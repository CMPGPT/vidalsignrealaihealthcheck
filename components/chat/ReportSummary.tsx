'use client'

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import CountdownTimer from "@/components/chat/CountdownTimer";
import { FileText, Trash2 } from "lucide-react";

interface ReportSummaryProps {
  className?: string;
  report: {
    id: string;
    title: string;
    date: string;
    summary: string;
    expiryTime: Date;
  };
  onDelete?: () => void;
}

// Function to convert markdown to HTML
function convertMarkdownToHTML(markdown: string): string {
  if (!markdown) return '';
  
  // Convert headings
  let html = markdown
    .replace(/^### (.*$)/gim, '<h3 class="font-bold text-md mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="font-bold text-lg mt-4 mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="font-bold text-xl mt-4 mb-3">$1</h1>');
  
  // Convert bold text
  html = html.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-primary">$1</span>');
  
  // Convert list items (lines starting with - or *)
  html = html.replace(/^[\s]*[-*] (.*$)/gim, '<li class="ml-4 mb-1">$1</li>');
  
  // Wrap adjacent list items in <ul> tags
  html = html.replace(/<\/li>\n<li/g, '</li><li');
  // @ts-ignore
  html = html.replace(/<li(.*?)>(.*?)(?=<(?:h[1-3]|\/li|$))/gs, (match) => {
    if (!match.includes('</li>')) return match;
    return '<ul class="list-disc my-2 pl-4">' + match + '</ul>';
  });
  
  // Convert line breaks to <p> tags for non-list, non-heading lines
  const paragraphs = html.split('\n\n');
  html = paragraphs.map(para => {
    if (
      !para.trim().startsWith('<h') && 
      !para.trim().startsWith('<ul') && 
      !para.trim().startsWith('<li') && 
      para.trim().length > 0
    ) {
      return `<p class="mb-3">${para}</p>`;
    }
    return para;
  }).join('\n\n');
  
  // Clean up any nested paragraph tags
  html = html.replace(/<p>(<h[1-3].*?>)(.*?)(<\/h[1-3]>)<\/p>/g, '$1$2$3');
  html = html.replace(/<p>(<ul>)(.*?)(<\/ul>)<\/p>/g, '$1$2$3');
  
  return html;
}

const ReportSummary = ({ className, report, onDelete }: ReportSummaryProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  
  // Animation sequence when report loads
  useEffect(() => {
    if (report) {
      // First make the card appear
      setIsVisible(true);
      
      // Then reveal the content with a slight delay
      const timer = setTimeout(() => {
        setContentVisible(true);
      }, 200);
      
      return () => clearTimeout(timer);
    } else {
      setContentVisible(false);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [report]);

  // Check if report is undefined or null
  if (!report) {
    return (
      <Card className={cn(
        "w-full overflow-hidden backdrop-blur-sm bg-card/90",
        "transition-all duration-500 ease-in-out",
        isVisible ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-8",
        className
      )}>
        <CardContent className="p-8 flex items-center justify-center">
          <p className="text-muted-foreground">No report data available</p>
        </CardContent>
      </Card>
    );
  }

  const handleDelete = () => {
    setIsLoading(true);
    // Simulate deletion delay
    setTimeout(() => {
      setIsLoading(false);
      
      // Animate out before deletion
      setContentVisible(false);
      setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          onDelete?.();
          toast("Report deleted", {
            description: "Your report has been permanently deleted.",
          });
        }, 300);
      }, 200);
    }, 800);
  };

  const handleExpiry = () => {
    // Animate out before deletion
    setContentVisible(false);
    setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onDelete?.();
        toast.error("Report expired", {
          description: "Your report has been automatically deleted due to expiration.",
        });
      }, 300);
    }, 200);
  };

  // Convert markdown to HTML
  const formattedSummary = convertMarkdownToHTML(report.summary);

  return (
    <Card className={cn(
      "w-full overflow-hidden backdrop-blur-sm bg-card/90",
      "transition-all duration-500 ease-in-out",
      isVisible ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-8",
      className
    )}>
      <CardHeader className={cn(
        "flex flex-row items-center justify-between pb-2 space-y-0",
        "transition-all duration-500 ease-in-out delay-100",
        contentVisible ? "opacity-100 transform translate-y-0" : "opacity-0 transform -translate-y-4"
      )}>
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="font-medium text-lg">{report.title}</h3>
        </div>
        <div className="text-sm text-muted-foreground">{report.date}</div>
      </CardHeader>
      <CardContent className={cn(
        "pb-4",
        "transition-all duration-500 ease-in-out delay-200",
        contentVisible ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-4"
      )}>
        <div 
          className="text-sm leading-relaxed space-y-1"
          dangerouslySetInnerHTML={{ __html: formattedSummary }}
        />
      </CardContent>
      <Separator className={cn(
        "transition-all duration-300 ease-in-out delay-300",
        contentVisible ? "opacity-100" : "opacity-0"
      )} />
      <CardFooter className={cn(
        "flex justify-between items-center py-3",
        "transition-all duration-500 ease-in-out delay-300",
        contentVisible ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-4"
      )}>
        <CountdownTimer 
          expiryTime={report.expiryTime} 
          onExpire={handleExpiry}
        />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive" 
              size="sm" 
              className="text-xs h-8"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Delete now
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="glass">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete report?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete your report. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleDelete}
                disabled={isLoading}
              >
                {isLoading ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
};

export default ReportSummary;