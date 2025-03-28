
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Bot, Send, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ChatInterfaceProps {
  className?: string;
  suggestedQuestions: string[];
  onAskQuestion: (question: string) => void;
}

interface Message {
  id: number;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const ChatInterface = ({ className, suggestedQuestions, onAskQuestion }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: "Hello, I'm your medical assistant. How can I help you understand your clinic report today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const newUserMessage: Message = {
      id: messages.length + 1,
      content: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");
    onAskQuestion(input);
    simulateBotReply(input);
  };

  const simulateBotReply = (userInput: string) => {
    setIsTyping(true);
    
    // Simulate bot thinking time
    setTimeout(() => {
      // Simple response simulation
      const responses = [
        "Based on your report, your blood tests are within normal ranges. This is a good sign for your overall health.",
        "I see that your question is about medication. Your report shows that the prescribed treatment is appropriate for your condition.",
        "Your vital signs are stable according to the report. This indicates your body is functioning well.",
        "From your report, I can see that your doctor has recommended a follow-up in 3 months.",
        "The report indicates some values that might need attention. I'd recommend discussing this with your doctor at your next appointment.",
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const newBotMessage: Message = {
        id: messages.length + 2,
        content: randomResponse,
        sender: "bot",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, newBotMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
    
    // Small delay to show the question in the input before sending
    setTimeout(() => {
      const newUserMessage: Message = {
        id: messages.length + 1,
        content: question,
        sender: "user",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, newUserMessage]);
      onAskQuestion(question);
      simulateBotReply(question);
    }, 300);
  };

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
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex w-max max-w-[80%] animate-fade-in",
              message.sender === "user" ? "ml-auto" : "mr-auto"
            )}
          >
            <div
              className={cn(
                "rounded-lg px-4 py-2 shadow-subtle",
                message.sender === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              )}
            >
              <div className="text-sm">{message.content}</div>
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
      <div className="px-4 py-2">
        <div className="flex gap-2 flex-wrap">
          {suggestedQuestions.map((question, index) => (
            <Button
              key={index}
              variant="secondary"
              size="sm"
              className="text-xs animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => handleSuggestedQuestion(question)}
            >
              {question}
            </Button>
          ))}
        </div>
      </div>
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
