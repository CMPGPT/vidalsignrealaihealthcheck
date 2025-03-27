'use client';

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import GlassCard from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { HelpCircle, Mail, MessageSquare, Phone, FileQuestion, ExternalLink, Search } from "lucide-react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// FAQ items
const faqItems = [
  {
    question: "How do I upload lab reports?",
    answer: "To upload lab reports, navigate to the Upload section in your dashboard. You can drag and drop PDF files or click to select them from your computer. Once uploaded, enter the patient's email address and any additional notes before sending."
  },
  {
    question: "What file formats are supported for lab reports?",
    answer: "VidalSigns currently supports PDF files for lab reports. We recommend uploading clear, high-resolution scans or directly exported PDF files from your lab system for the best results."
  },
  {
    question: "How secure is VidalSigns?",
    answer: "VidalSigns uses industry-standard encryption and is fully HIPAA compliant. All data is encrypted both in transit and at rest. We implement strict access controls and regular security audits to ensure your patients' information remains confidential and secure."
  },
  {
    question: "Can I customize the email sent to patients?",
    answer: "Yes, you can customize both the subject line and body of emails sent to patients. Go to Settings > Email Templates to set up your preferred templates. You can use placeholders like [Patient Name] and [Clinic Name] that will be automatically filled with the appropriate information."
  },
  {
    question: "How long can patients access their reports?",
    answer: "By default, secure links to reports expire after 30 days. You can adjust this setting to between 1 and 90 days in your account settings. After a link expires, you can easily generate a new link and resend it to the patient if needed."
  },
  {
    question: "How do I track if a patient has viewed their report?",
    answer: "In the Reports section of your dashboard, you can see the status of each report sent. A 'Viewed' status indicates that the patient has accessed the report. You can also enable email notifications to be alerted when a patient views their report."
  }
];

type ContactFormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export default function SupportPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const form = useForm<ContactFormData>({
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: ""
    }
  });
  
  const onSubmit: SubmitHandler<ContactFormData> = (data) => {
    console.log(data);
    // Here you would send the support request
  };
  
  const filteredFAQs = faqItems.filter((item) => 
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between ">
        <h1 className="text-3xl font-bold py-1 sm:py-0">Support</h1>
        </div>
        
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
        <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                type="text"
                  placeholder="Search FAQs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
            </div>
            
                <Accordion type="single" collapsible className="w-full">
              {filteredFAQs.length > 0 ? (
                filteredFAQs.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="hover:text-primary">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                ))
              ) : (
                <p className="text-center py-4 text-muted-foreground">No matching FAQs found</p>
              )}
            </Accordion>
            
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="font-medium mb-2">Still need help?</h3>
              <p className="text-muted-foreground mb-4">
                If you couldn&apos;t find the answer you&apos;re looking for, please don&apos;t hesitate to contact our support team directly.
              </p>
              <div className="flex gap-4">
                <Button variant="outline" className="gap-2">
                  <FileQuestion className="h-4 w-4" />
                  Browse Documentation
                </Button>
                <Button variant="outline" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Video Tutorials
                </Button>
              </div>
              </div>
            </GlassCard>
          </div>
          
          <div className="lg:col-span-1">
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold mb-4">Contact Support</h2>
              
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                  control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Full name" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                  control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                      <FormLabel>Email</FormLabel>
                        <FormControl>
                        <Input type="email" placeholder="Your email address" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                  control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                        <Input placeholder="How can we help?" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                  control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea 
                          placeholder="Please describe your issue in detail" 
                            className="min-h-[120px]"
                            {...field} 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                <Button type="submit" className="w-full">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
                </form>
              </Form>
              
            <div className="mt-6 pt-6 border-t border-border">
                <h3 className="font-medium mb-3">Other Ways to Reach Us</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">support@vidalsigns.com</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">(555) 123-4567</span>
                  </div>
                  <div className="flex items-center">
                    <HelpCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Live chat: 9am-5pm ET, Mon-Fri</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
  );
} 