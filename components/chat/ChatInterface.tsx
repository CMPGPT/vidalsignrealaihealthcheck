import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Bot, Send, User, Image, Upload } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useUploadThing } from "@/lib/uploadthing-hooks";

interface ReportData {
  id: string;
  title: string;
  date: string;
  summary: string;
  expiryTime: Date;
  suggestedQuestions?: string[];
}

interface BrandSettings {
  brandName: string;
  logoUrl?: string;
  customColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

interface ChatInterfaceProps {
  className?: string;
  suggestedQuestions?: string[];
  onAskQuestion: (question: string) => void;
  report?: ReportData | null;
  brandSettings?: BrandSettings | null;
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
  // Calculate formatted content without state to avoid render-time updates
  const getFormattedContent = () => {
    if (isFormatted) {
      return content; // Content is already HTML formatted
    } else if (shouldAutoFormat(content)) {
      return formatTextWithMarkers(content); // Auto-format with markers
    } else {
      return content; // Regular text content
    }
  };
  
  const formattedContent = getFormattedContent();
  
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

const ChatInterface = ({ className, suggestedQuestions: initialSuggestedQuestions = [], onAskQuestion, report: initialReport, brandSettings }: ChatInterfaceProps) => {
    // Use partner's primary color only if it's not a starter user
    const shouldUsePartnerColor = brandSettings && brandSettings.brandName !== 'Vidal Chat';
    const iconColor = shouldUsePartnerColor && brandSettings?.customColors?.primary 
        ? brandSettings.customColors.primary 
        : undefined;
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
    } catch (error) {
      console.error('Error getting AI response:', error);

      // Add error message to chat
      const errorMessage: Message = {
        id: messages.length + 2,
        content: "I understand this might be concerning. I'm here to help you understand your health information. Please try asking your question again, and I'll do my best to provide clear, compassionate guidance.",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    // Create user message immediately
    const newUserMessage: Message = {
      id: messages.length + 1,
      content: question,
      sender: "user",
      timestamp: new Date(),
    };

    // Update states immediately without setTimeout
    setAskedQuestions(prev => new Set(prev).add(question));
    setMessages((prev) => [...prev, newUserMessage]);
    
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
  };

  // Setup UploadThing hook for image uploads
  const { startUpload: startImageUpload } = useUploadThing("medicalReportUploader", {
    onClientUploadComplete: (res) => {
      if (res && res.length > 0) {
        const uploadData = {
          fileUrl: res[0].ufsUrl || res[0].url,
          fileType: res[0].type || "",
          fileName: res[0].name,
        };
        handleImageAnalysis(uploadData);
      }
    },
    onUploadError: (error) => {
      console.error("Image upload error:", error);
      const errorMessage: Message = {
        id: Date.now(),
        content: "Sorry, I couldn't upload that image. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    },
  });

  const handleImageAnalysis = async (data: { fileUrl: string; fileType: string; fileName: string }) => {
    // Add single message that will be updated
    const messageId = Date.now();
    const uploadingMessage: Message = {
      id: messageId,
      content: `<div class="flex flex-col items-end space-y-2">
        <div class="text-sm opacity-80">📤 Uploading: ${data.fileName}</div>
        <div class="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-2 rounded-lg">
          <div class="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <span class="text-sm">Uploading image...</span>
        </div>
      </div>`,
      sender: "user",
      timestamp: new Date(),
      isFormatted: true,
    };
    
    setMessages(prev => [...prev, uploadingMessage]);
    
    // Wait a moment to show upload progress
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update the same message to show uploaded image
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? {
            ...msg,
            content: `<div class="flex flex-col items-end space-y-2">
              <div class="text-sm opacity-80">📷 Uploaded: ${data.fileName}</div>
              <img src="${data.fileUrl}" alt="${data.fileName}" class="max-w-[200px] rounded-lg shadow-md hover:scale-105 transition-transform duration-200" />
            </div>`
          }
        : msg
    ));
    
    // Show typing indicator
    setIsTyping(true);
    
    // Get simple AI response for the uploaded image (not medical analysis)
    try {
      const response = await fetch('/api/chat-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileUrl: data.fileUrl,
          fileType: data.fileType,
          fileName: data.fileName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const result = await response.json();
      
      if (result.success) {
        const botMessage: Message = {
          id: Date.now() + 1,
          content: result.response,
          sender: "bot",
          timestamp: new Date(),
          isFormatted: true,
        };
        
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(result.error || 'Failed to analyze image');
      }
    } catch (error) {
      console.error('Image analysis error:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        content: "I can see you've uploaded an image. What would you like to know about it? Feel free to ask me any questions!",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      // Hide typing indicator
      setIsTyping(false);
    }
  };

  // Get filtered suggested questions (remove already asked questions) - limit to 3
  const getFilteredSuggestedQuestions = () => {
    const reportQuestions = report?.suggestedQuestions || [];
    const allQuestions = [...new Set([...reportQuestions, ...suggestedQuestions])];
    
    const filteredQuestions = allQuestions.filter(question => !askedQuestions.has(question));
    
    // Limit to maximum 3 questions
    return filteredQuestions.slice(0, 3);
  };

  const filteredQuestions = getFilteredSuggestedQuestions();

  return (
    <Card className={cn("flex flex-col h-full overflow-hidden backdrop-blur-sm bg-card/90 transition-all duration-300", className)}>
      {/* Header - 7% height */}
      <CardHeader className="flex flex-row items-center justify-between py-2 px-4 space-y-0 h-[7%] min-h-[50px]">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8 bg-primary/10 flex justify-center items-center">
            {brandSettings?.logoUrl ? (
              <img 
                src={brandSettings.logoUrl} 
                alt={brandSettings.brandName}
                className="h-6 w-6 rounded object-cover"
              />
            ) : (
              <Bot className="h-4 w-4 text-primary" />
            )}
          </Avatar>
          <h3 className="font-medium">
            {brandSettings?.brandName ? `${brandSettings.brandName} Assistant` : 'Medical Assistant'}
          </h3>
        </div>
        
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
          
          {/* Image Upload Button */}
          <div className="relative">
            <input
              type="file"
              id="image-upload"
              className="hidden"
              accept="image/jpeg,image/png,image/jpg"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  try {
                    await startImageUpload([file]);
                  } catch (error) {
                    console.error("Upload error:", error);
                  }
                }
              }}
            />
            <Button
              type="button"
              size="icon"
              variant="secondary"
              onClick={() => document.getElementById('image-upload')?.click()}
              className="bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-input"
              style={{
                backgroundColor: iconColor,
                borderColor: iconColor,
              }}
            >
              <Image 
                className="h-4 w-4" 
                style={{ color: iconColor ? 'white' : undefined }}
              />
            </Button>
          </div>
          
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim()}
            className={cn(
              "transition-all duration-300",
              !input.trim() ? "opacity-50" : "opacity-100"
            )}
            style={{
              backgroundColor: iconColor,
              borderColor: iconColor,
            }}
          >
            <Send 
              className="h-4 w-4" 
              style={{ color: iconColor ? 'white' : undefined }}
            />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default ChatInterface;