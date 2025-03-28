
import { useState } from "react";
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

const ReportSummary = ({ className, report, onDelete }: ReportSummaryProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = () => {
    setIsLoading(true);
    // Simulate deletion delay
    setTimeout(() => {
      setIsLoading(false);
      onDelete?.();
      toast("Report deleted", {
        description: "Your report has been permanently deleted.",
      });
    }, 800);
  };

  const handleExpiry = () => {
    toast.error("Report expired", {
      description: "Your report has been automatically deleted due to expiration.",
    });
    onDelete?.();
  };

  return (
    <Card className={cn("w-full overflow-hidden backdrop-blur-sm bg-card/90 transition-all duration-300", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="font-medium text-lg">{report.title}</h3>
        </div>
        <div className="text-sm text-muted-foreground">{report.date}</div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="text-sm leading-relaxed space-y-4">
          {report.summary.split('\n\n').map((paragraph, index) => (
            <p key={index} className="animate-fade-in">{paragraph}</p>
          ))}
        </div>
      </CardContent>
      <Separator />
      <CardFooter className="flex justify-between items-center py-3">
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
