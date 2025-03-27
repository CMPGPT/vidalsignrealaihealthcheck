import { Upload, MessageSquare, ShieldCheck, BrainCircuit, Clock, BarChart3 } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

const features = [
  {
    icon: <Upload className="h-8 w-8 text-primary" />,
    title: "Simple Upload Process",
    description: "Upload your lab reports as PDFs or images in seconds. Our AI automatically recognizes test results and patient information."
  },
  {
    icon: <MessageSquare className="h-8 w-8 text-primary" />,
    title: "AI-Powered Explanations",
    description: "Receive clear explanations of your lab results with actionable insights and helpful context in plain, non-medical language."
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-primary" />,
    title: "Direct Consumer Access",
    description: "Visit our site, pay a one-time fee, upload your labs, and instantly receive AI-powered interpretations of your results."
  },
  {
    icon: <BrainCircuit className="h-8 w-8 text-primary" />,
    title: "Partner QR Codes",
    description: "Partners purchase bulk QR code packages for their clients, offering instant, prepaid access to our lab interpretation service."
  },
  {
    icon: <Clock className="h-8 w-8 text-primary" />,
    title: "Co-Branded Experience",
    description: "Partners receive custom-branded redemption pages featuring their business name, logo, and optional tagline."
  },
  {
    icon: <BarChart3 className="h-8 w-8 text-primary" />,
    title: "Automated Process",
    description: "No logins or dashboards to manage. The entire process is streamlined and automated for both users and partners."
  }
];

const Features = () => {
  return (
    <section id="features" className="py-20 md:py-32 bg-secondary/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Two Simple Ways to Access
          </h2>
          <p className="text-muted-foreground text-lg">
          VidalSigns offers flexible access options for individuals and businesses, with no complex dashboards or management required.          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <GlassCard 
              key={index} 
              className="p-8 h-full"
              animation={index % 2 === 0 ? "scale" : "fade"}
              opacity="light"
            >
              <div className="flex flex-col h-full">
                <div className="mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-medium mb-3">{feature.title}</h3>
                <p className="text-muted-foreground flex-grow">{feature.description}</p>
              </div>
            </GlassCard>
          ))}
        </div>
        
        <div className="mt-20">
          <GlassCard className="p-8 md:p-12 max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">How It Works</h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white font-medium">1</div>
                    <div>
                      <h4 className="font-medium mb-1">For Individuals</h4>
                      <p className="text-muted-foreground text-sm">Visit our site, pay a one-time fee, and upload your lab report</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white font-medium">2</div>
                    <div>
                      <h4 className="font-medium mb-1">For Partners</h4>
                      <p className="text-muted-foreground text-sm">Purchase bulk QR codes, receive branded materials, and distribute to clients.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white font-medium">3</div>
                    <div>
                      <h4 className="font-medium mb-1">Instant Analysis</h4>
                      <p className="text-muted-foreground text-sm">Our AI analyzes your lab results and provides clear, actionable explanations.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white font-medium">4</div>
                    <div>
                      <h4 className="font-medium mb-1">Interactive Results</h4>
                      <p className="text-muted-foreground text-sm">Ask follow-up questions about your results to deepen your understanding.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted rounded-xl aspect-square flex items-center justify-center">
                <p className="text-muted-foreground">Interactive Demo Visualization</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
};

export default Features;
