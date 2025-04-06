import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Bot, Send, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";

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
        className="text-sm message-content"
        dangerouslySetInnerHTML={{ __html: formattedContent }} 
      />
    );
  }
  
  // For regular text messages
  return <div className="text-sm whitespace-pre-wrap">{content}</div>;
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

  // This is a predefined response for demonstration purposes
  const handleTestFormattedResponse = () => {
    const formattedResponse = `
      <h1 class="text-lg font-bold mb-3">Low Hemoglobin Levels</h1>
      <p class="mb-3">Low hemoglobin levels can be caused by a variety of factors, including:</p>
      <ol class="list-decimal pl-5 mb-3">
        <li class="mb-2">
          <strong class="text-primary">Nutritional Deficiencies:</strong> 
          <p>Iron deficiency is the most common cause of anemia, leading to insufficient hemoglobin production. Vitamin B12 or folate deficiency can also affect red blood cell production and hemoglobin levels.</p>
        </li>
        <li class="mb-2">
          <strong class="text-primary">Chronic Diseases:</strong> 
          <p>Conditions such as chronic kidney disease, cancer, or inflammatory diseases can interfere with red blood cell production.</p>
        </li>
        <li class="mb-2">
          <strong class="text-primary">Blood Loss:</strong> 
          <p>Acute or chronic blood loss from injuries, surgery, gastrointestinal bleeding, or heavy menstrual periods can lead to low hemoglobin levels.</p>
        </li>
        <li class="mb-2">
          <strong class="text-primary">Bone Marrow Disorders:</strong> 
          <p>Disorders like aplastic anemia or leukemia can affect the bone marrow's ability to produce red blood cells.</p>
        </li>
        <li class="mb-2">
          <strong class="text-primary">Hemolytic Anemia:</strong> 
          <p>Conditions where red blood cells are destroyed faster than they can be produced, such as autoimmune hemolytic anemia or sickle cell anemia.</p>
        </li>
        <li class="mb-2">
          <strong class="text-primary">Genetic Disorders:</strong> 
          <p>Conditions like thalassemia can lead to abnormal hemoglobin production.</p>
        </li>
      </ol>
      <p class="mt-3 text-primary-foreground bg-primary/10 p-3 rounded-md">It is important to consult with a healthcare provider to determine the specific cause of low hemoglobin levels and develop an appropriate treatment plan.</p>
    `;

    // Add formatted AI response to chat
    const newBotMessage: Message = {
      id: messages.length + 2,
      content: formattedResponse,
      sender: "bot",
      timestamp: new Date(),
      isFormatted: true,
    };

    setMessages((prev) => [...prev, newBotMessage]);
  };

  // Example of handling text with ** markers
  const handleTestStarFormatting = () => {
    const textWithStars = `Low hemoglobin levels can be caused by a variety of factors and underlying conditions. Some common causes include:

1. **Nutritional Deficiencies:**
- Iron deficiency, which is the most common cause of anemia.
- Vitamin B12 or folate deficiency.

2. **Chronic Diseases:**
- Chronic kidney disease.
- Chronic inflammatory conditions such as rheumatoid arthritis.

3. **Blood Loss:**
- Acute or chronic bleeding, such as from gastrointestinal ulcers or heavy menstrual periods.

4. **Bone Marrow Disorders:**
- Conditions that affect the bone marrow's ability to produce red blood cells.`;

    // Add response with ** formatting that will be auto-detected
    const newBotMessage: Message = {
      id: messages.length + 2,
      content: textWithStars,
      sender: "bot",
      timestamp: new Date(),
      // No need to set isFormatted, the component will detect it
    };

    setMessages((prev) => [...prev, newBotMessage]);
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
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4 space-y-0">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8 bg-primary/10 flex justify-center items-center">
            <Bot className="h-4 w-4 text-primary" />
          </Avatar>
          <h3 className="font-medium">Medical Assistant</h3>
        </div>
      </CardHeader>
      <Separator />
      <CardContent 
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex w-max max-w-[85%]",
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
                "rounded-lg px-4 py-3 shadow-subtle",
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
          <div className="flex w-max max-w-[80%] mr-auto animate-fade-in">
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
      
      {/* Suggested Questions Section - Only shown if there are filtered questions */}
      {filteredQuestions.length > 0 && (
        <div className="px-4 py-2">
          <div className="text-sm mb-2 font-semibold text-muted-foreground">💡 Suggested Questions</div>
          <div className="flex flex-wrap gap-2">
            {filteredQuestions.map((question, index) => (
              <Button
                key={index}
                variant="secondary"
                size="sm"
                className="text-xs opacity-0 animate-fade-in-up"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: "forwards",
                }}
                aria-label={`Suggested Question ${index + 1}`}
                onClick={() => handleSuggestedQuestion(question)}
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      <Separator />
      <CardFooter className="p-2">
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
    </Card>
  );
};

export default ChatInterface;