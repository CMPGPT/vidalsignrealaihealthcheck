import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Bot, Send, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { notificationManager } from "@/lib/notificationUtils";
import NotificationSettings from "./NotificationSettings";

interface ReportData {
  id: string;
  title: string;
  date: string;
  summary: string;
  expiryTime: Date;
  suggestedQuestions?: string[];
}

interface ChatInterfaceProps {
  className?: string;
  suggestedQuestions?: string[];
  onAskQuestion: (question: string) => void;
  report?: ReportData | null;
}

interface Message {
  id: number;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
  isFormatted?: boolean;
}

// Function to convert text with ** markers to properly formatted HTML
function formatTextWithMarkers(text: string): string {
  if (!text) return '';
  
  // Replace ** markers with proper bold tags
  let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary font-bold">$1</strong>');
  
  // @ts-ignore
  formattedText = formattedText.replace(/(\d+)\.\s+(.+?)(?=\n\d+\.|\n\n|$)/gs, (match, number, content) => {
    return `<div class="flex mb-3">
      <div class="mr-2 font-bold">${number}.</div>
      <div>${content}</div>
    </div>`;
  });
  
  // Handle bullet points (lines starting with -)
  formattedText = formattedText.replace(/^\s*-\s+(.+)$/gm, '<li class="ml-6 mb-1">$1</li>');
  
  // Wrap adjacent list items in <ul> tags
  formattedText = formattedText.replace(/<\/li>\n<li/g, '</li><li');
  // @ts-ignore
  formattedText = formattedText.replace(/<li(.*?)>(.*?)(?=<(?:\/li|$))/gs, (match) => {
    if (!match.includes('</li>')) return match;
    return '<ul class="list-disc my-2">' + match + '</ul>';
  });
  
  // Convert paragraph breaks
  formattedText = formattedText.split('\n\n').map(para => {
    if (
      !para.trim().startsWith('<div') && 
      !para.trim().startsWith('<ul') && 
      !para.trim().startsWith('<li') && 
      para.trim().length > 0
    ) {
      return `<p class="mb-3">${para}</p>`;
    }
    return para;
  }).join('\n\n');
  
  return formattedText;
}

// Function to detect if text needs special formatting
function shouldAutoFormat(text: string): boolean {
  // Check for markdown-style formatting indicators
  return /\*\*(.*?)\*\*/.test(text) ||   // Bold text
         /^\d+\.\s+/m.test(text) ||      // Numbered lists
         /^\s*-\s+/m.test(text);         // Bullet points
}

// Function to safely render HTML content
const MessageContent = ({ content, isFormatted }: { content: string; isFormatted?: boolean }) => {
  const [formattedContent, setFormattedContent] = useState(content);
  
  useEffect(() => {
    if (isFormatted) {
      // Content is already HTML formatted, use as is
      setFormattedContent(content);
    } else if (shouldAutoFormat(content)) {
      // Content has markdown-style markers, auto-format it
      setFormattedContent(formatTextWithMarkers(content));
    } else {
      // Regular text content, no special formatting needed
      setFormattedContent(content);
    }
  }, [content, isFormatted]);
  
  if (isFormatted || shouldAutoFormat(content)) {
    return (
      <div 
        className="text-sm message-content overflow-hidden overflow-wrap-break-word"
        dangerouslySetInnerHTML={{ __html: formattedContent }} 
      />
    );
  }
  
  // For regular text messages
  return <div className="text-sm whitespace-pre-wrap overflow-wrap-break-word">{content}</div>;
};

const ChatInterface = ({ className, suggestedQuestions: initialSuggestedQuestions = [], onAskQuestion, report: initialReport }: ChatInterfaceProps) => {
  // State for local report data (to handle filtering questions)
  const [report, setReport] = useState<ReportData | null>(initialReport || null);
  // Separate state for suggested questions
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>(initialSuggestedQuestions);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: report
        ? "Hello, I'm your medical assistant. I've analyzed your report and can answer your questions about it."
        : "Hello, I'm your medical assistant. How can I help you understand your clinic report today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messageAnimation, setMessageAnimation] = useState(true);
  const [askedQuestions, setAskedQuestions] = useState<Set<string>>(new Set());
  const [isNotificationSupported, setIsNotificationSupported] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  // Update local report when external report changes
  useEffect(() => {
    if (initialReport?.id !== report?.id) {
      setReport(initialReport || null);
      // Reset asked questions when report changes
      setAskedQuestions(new Set());
    }
  }, [initialReport]);

  // Update local suggested questions when external ones change
  useEffect(() => {
    if (initialSuggestedQuestions !== suggestedQuestions) {
      setSuggestedQuestions(initialSuggestedQuestions);
    }
  }, [initialSuggestedQuestions]);

  // Initialize notification support
  useEffect(() => {
    setIsNotificationSupported(notificationManager.isSupported());
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update initial message when report changes
  useEffect(() => {
    if (report) {
      setMessages([{
        id: 1,
        content: "Hello, I'm your medical assistant. I've analyzed your report and can answer your questions about it.",
        sender: "bot",
        timestamp: new Date(),
      }]);
    }
  }, [report?.id]);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userQuestion = input.trim();
    
    const newUserMessage: Message = {
      id: messages.length + 1,
      content: userQuestion,
      sender: "user",
      timestamp: new Date(),
    };

    // Add to asked questions set
    setAskedQuestions(prev => new Set(prev).add(userQuestion));
    
    setMessages((prev) => [...prev, newUserMessage]);
    
    // Clear input immediately
    setInput("");
    
    onAskQuestion(userQuestion);
    getOpenAIResponse(userQuestion);
  };

  const getOpenAIResponse = async (userInput: string) => {
    setIsTyping(true);
    
    // Clear input field immediately after sending the message
    setInput("");

    try {
      // Create request payload with user question and report summary
      const payload = {
        question: userInput,
        reportSummary: report?.summary || "No report available"
      };

      // Make API call to your backend endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();

      // Process the response to detect if it contains HTML-like formatting
      const hasHtmlFormatting = /<(p|h[1-6]|ul|ol|li|strong|em|b|i|div|span)[^>]*>/.test(data.response);

      // Add AI response to chat
      const newBotMessage: Message = {
        id: messages.length + 2,
        content: data.response,
        sender: "bot",
        timestamp: new Date(),
        isFormatted: hasHtmlFormatting,
      };

      setMessages((prev) => [...prev, newBotMessage]);

      // Send notification for new bot message
      if (isNotificationSupported && data.response) {
        notificationManager.sendChatNotification('Medical Assistant', data.response);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);

      // Add error message to chat
      const errorMessage: Message = {
        id: messages.length + 2,
        content: "I'm sorry, I couldn't process your request. Please try again later.",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    // Briefly show the question in the input field
    setInput(question);

    // Small delay to show the question in the input before sending
    setTimeout(() => {
      const newUserMessage: Message = {
        id: messages.length + 1,
        content: question,
        sender: "user",
        timestamp: new Date(),
      };

      // Add to asked questions set
      setAskedQuestions(prev => new Set(prev).add(question));
      
      setMessages((prev) => [...prev, newUserMessage]);
      
      // Clear input field right after showing the question
      setInput("");
      
      // Filter out the selected question from suggested questions in local report
      if (report?.suggestedQuestions) {
        setReport({
          ...report,
          suggestedQuestions: report.suggestedQuestions.filter(q => q !== question)
        });
      }
      
      // Also filter local suggestedQuestions
      setSuggestedQuestions(prev => prev.filter(q => q !== question));
      
      onAskQuestion(question);
      getOpenAIResponse(question);
    }, 300);
  };

  // Get filtered suggested questions (remove already asked questions)
  const getFilteredSuggestedQuestions = () => {
    const reportQuestions = report?.suggestedQuestions || [];
    const allQuestions = [...new Set([...reportQuestions, ...suggestedQuestions])];
    
    return allQuestions.filter(question => !askedQuestions.has(question));
  };

  const filteredQuestions = getFilteredSuggestedQuestions();

  return (
    <Card className={cn("flex flex-col h-full overflow-hidden backdrop-blur-sm bg-card/90 transition-all duration-300", className)}>
      {/* Header - 7% height */}
      <CardHeader className="flex flex-row items-center justify-between py-2 px-4 space-y-0 h-[7%] min-h-[50px]">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8 bg-primary/10 flex justify-center items-center">
            <Bot className="h-4 w-4 text-primary" />
          </Avatar>
          <h3 className="font-medium">Medical Assistant</h3>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Notification Settings - Always visible on mobile */}
          {isNotificationSupported && (
            <NotificationSettings className="h-8 w-8" />
          )}
          
          {/* Mobile Report Button */}
          {report && (
            <Button 
              variant="secondary"
              size="sm"
              className="lg:hidden rounded-full bg-primary text-primary-foreground h-10 w-10 p-0"
              aria-label="View Report"
              onClick={() => window.dispatchEvent(new CustomEvent('toggleSidebar'))}
            >
              <span className="text-[10px] font-medium">Report</span>
            </Button>
          )}
        </div>
      </CardHeader>
      
      <Separator />
      
      {/* Messages Area - Auto expanding to fill available space */}
      <CardContent 
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 h-[80%]"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex max-w-[85%]",
              messageAnimation ? "animate-message-in" : "",
              message.sender === "user" 
                ? "ml-auto justify-end" 
                : "mr-auto justify-start"
            )}
            style={{
              animationDelay: `${(message.id - 1) * 0.1}s`,
            }}
          >
            <div
              className={cn(
                "rounded-lg px-4 py-3 shadow-subtle overflow-hidden",
                message.sender === "user"
                  ? "bg-primary text-primary-foreground"
                  : message.isFormatted
                    ? "bg-secondary/80 text-secondary-foreground formatted-message"
                    : "bg-secondary text-secondary-foreground"
              )}
            >
              <MessageContent content={message.content} isFormatted={message.isFormatted} />
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex max-w-[80%] mr-auto animate-fade-in">
            <div className="rounded-lg px-4 py-2 bg-secondary text-secondary-foreground shadow-subtle">
              <div className="flex space-x-1">
                <span className="animate-pulse">•</span>
                <span className="animate-pulse" style={{ animationDelay: "0.2s" }}>•</span>
                <span className="animate-pulse" style={{ animationDelay: "0.4s" }}>•</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>
      
      {/* Suggested Questions Section - Absolute positioning */}
      {filteredQuestions.length > 0 && (
        <div className="w-full bg-card border-t relative z-20 px-4 py-2">
          <div className="text-sm mb-2 font-semibold text-muted-foreground">💡 Suggested Questions</div>
          <div className="flex flex-col space-y-2 sm:flex-row sm:flex-wrap sm:space-y-0 sm:gap-2 pb-2">
            {filteredQuestions.map((question, index) => (
              <Button
                key={index}
                variant="secondary"
                size="sm"
                className="text-xs w-full sm:w-auto opacity-0 animate-fade-in-up text-left justify-start sm:justify-center whitespace-normal h-auto py-2"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: "forwards",
                }}
                aria-label={`Suggested Question ${index + 1}`}
                onClick={() => handleSuggestedQuestion(question)}
              >
                <span className="line-clamp-2">{question}</span>
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {/* Input Area - 6% height */}
      <CardFooter className="p-2 border-t mt-auto bg-card z-30 h-[6%] min-h-[50px]">
        <form
          className="flex w-full items-center space-x-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <Input
            type="text"
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim()}
            className={cn(
              "transition-all duration-300",
              !input.trim() ? "opacity-50" : "opacity-100"
            )}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>

      {/* Floating Notification Settings Button for Mobile */}
      {isNotificationSupported && (
        <div className="fixed bottom-4 right-4 z-50 lg:hidden">
          <NotificationSettings className="h-12 w-12 shadow-lg" />
        </div>
      )}
    </Card>
  );
};

export default ChatInterface;