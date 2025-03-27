'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";

const CTA = () => {
  return (
    <section id="contact" className="py-20 md:py-32 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-0 -left-[10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 -right-[10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[100px]"></div>
      </div>
      
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
          Ready to understand your lab results?
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          Whether you&apos;re an individual seeking clarity or a business looking to offer added value to your clients, VidalSigns makes lab interpretation simple.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/signup">
              <Button size="lg" className="rounded-full px-8 py-6 bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-primary/25 hover:transform hover:translate-y-[-2px] transition-all">
                Upload Your Labs
              </Button>
            </Link>
            <Link href="#demo">
              <Button size="lg" variant="outline" className="rounded-full px-8 py-6 border-primary text-primary hover:bg-primary/5">
                Partner With Us
              </Button>
            </Link>
          </div>
          
          <div className="bg-secondary/50 border border-[hsl(var(--border))] rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl font-medium mb-6">Contact Us</h3>
            <form className="max-w-xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">Name</label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-3 rounded-lg border border-[hsl(var(--border))] bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-3 rounded-lg border border-[hsl(var(--border))] bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Your email"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="organization" className="block text-sm font-medium text-foreground mb-2">Organization</label>
                <input
                  type="text"
                  id="organization"
                  className="w-full px-4 py-3 rounded-lg border border-[hsl(var(--border))] bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Your gym, wellness center, or business name"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">Message</label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-[hsl(var(--border))] bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="How can we help you?"
                ></textarea>
              </div>
              
              <Button type="submit" className="w-full rounded-lg py-3 bg-primary hover:bg-primary/90">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
