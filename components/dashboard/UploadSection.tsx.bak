import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, File, Check, X, Send } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { useToast } from "@/hooks/use-toast";

const UploadSection = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [isReady, setIsReady] = useState(false);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      handleFile(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      handleFile(selectedFile);
    }
  };

  const handleFile = (selectedFile: File) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    
    if (!validTypes.includes(selectedFile.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or image file (.pdf, .jpg, .jpeg, .png)",
        variant: "destructive"
      });
      return;
    }
    
    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive"
      });
      return;
    }
    
    setFile(selectedFile);
    simulateProcessFile();
  };

  // Simulate AI processing of the file
  const simulateProcessFile = () => {
    setIsProcessing(true);
    
    // Simulate processing delay
    setTimeout(() => {
      setIsProcessing(false);
      setPatientName("John Smith"); // This would come from AI in a real implementation
      setIsReady(true);
    }, 2000);
  };

  const handleSendReport = () => {
    if (!patientEmail) {
      toast({
        title: "Email required",
        description: "Please enter the patient's email address",
        variant: "destructive"
      });
      return;
    }
    
    // Simulate sending email
    toast({
      title: "Report sent successfully",
      description: `The lab results have been sent to ${patientEmail}`,
    });
    
    // Reset form
    setFile(null);
    setPatientName("");
    setPatientEmail("");
    setIsReady(false);
  };

  const removeFile = () => {
    setFile(null);
    setPatientName("");
    setPatientEmail("");
    setIsReady(false);
  };

  return (
    <div className="space-y-8">
      <GlassCard className="p-8">
        <h2 className="text-2xl font-semibold mb-6">Upload Lab Report</h2>
        
        {!file ? (
          <div 
            className={`border-2 border-dashed rounded-xl p-10 text-center ${
              isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'
            } transition-colors cursor-pointer`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
            />
            
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Drag & Drop Lab Report Here</h3>
            <p className="text-muted-foreground mb-4">
              Accepts PDF, JPG, JPEG, and PNG files (max 10MB)
            </p>
            <Button variant="outline" className="rounded-lg">
              Select File
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center p-4 bg-muted/30 rounded-lg">
              <div className="mr-4">
                <File className="h-10 w-10 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB • {file.type}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={removeFile}
                className="ml-2"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {isProcessing ? (
              <div className="flex flex-col items-center p-6">
                <div className="animate-pulse-subtle">
                  <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <p className="mt-4 text-muted-foreground">Processing lab report...</p>
              </div>
            ) : isReady ? (
              <div className="space-y-6">
                <div className="p-4 bg-green-50 text-green-800 rounded-lg flex items-center">
                  <Check className="h-5 w-5 mr-2" />
                  <span>Lab report processed successfully!</span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="patient-name" className="block text-sm font-medium mb-2">
                      Patient Name (auto-detected)
                    </label>
                    <input
                      id="patient-name"
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-[hsl(var(--border))] focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="patient-email" className="block text-sm font-medium mb-2">
                      Patient Email Address
                    </label>
                    <input
                      id="patient-email"
                      type="email"
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                      placeholder="Enter patient's email"
                      className="w-full px-4 py-3 rounded-lg border border-[hsl(var(--border))] focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
                
                <Button
                  onClick={handleSendReport}
                  className="w-full py-6 rounded-lg bg-primary hover:bg-primary/90 flex items-center justify-center gap-2"
                >
                  <Send className="h-5 w-5" />
                  Send Secure Lab Results
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </GlassCard>
      
      <GlassCard className="p-8">
        <h3 className="text-lg font-semibold mb-4">What Happens Next?</h3>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white font-medium">1</div>
            <div>
              <h4 className="font-medium mb-1">AI Processing</h4>
              <p className="text-muted-foreground text-sm">Our AI extracts and interprets the lab results, translating medical terminology into plain language.</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white font-medium">2</div>
            <div>
              <h4 className="font-medium mb-1">Secure Email Delivery</h4>
              <p className="text-muted-foreground text-sm">A personalized email with a secure, one-time access link is sent to the patient.</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white font-medium">3</div>
            <div>
              <h4 className="font-medium mb-1">Patient Interaction</h4>
              <p className="text-muted-foreground text-sm">Patients can view their results and ask follow-up questions via the AI assistant.</p>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default UploadSection;
