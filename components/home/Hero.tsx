'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

const Hero = () => {
  const router = useRouter();

  const handleUploadClick = () => {
    const id = uuidv4(); // ✅ Generate UUID
    router.push(`/chat/${id}`); // ✅ Navigate to dynamic page
  };

  return (
    <section className="relative pt-28 md:pt-40 pb-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-0 -right-[10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 -left-[10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center max-w-[85rem] mx-auto">
          <span className="inline-flex items-center gap-x-2 bg-secondary/50 border border-[hsl(var(--border))] rounded-full py-2 px-4 text-sm text-primary font-medium mb-6 animate-fade-in-up">
            <span className="flex size-2 rounded-full bg-primary"></span>
            HIPAA Compliant Medical Platform
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-balance mb-6 animate-fade-in-up [animation-delay:200ms]">
            Understand Your Lab Results
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent block pr-1 pb-3 mb-1">
              {" "}In Plain English
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mb-10 animate-fade-in-up [animation-delay:400ms]">
            VidalSigns translates complex lab reports into clear, easy-to-understand explanations using advanced AI technology—no medical knowledge required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up [animation-delay:600ms]">
            <Button
              size="lg"
              onClick={handleUploadClick}
              className="rounded-full px-8 py-6 bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-primary/25 hover:transform hover:translate-y-[-2px] transition-all"
            >
              Upload Your Labs
            </Button>
            <Link href="#demo">
              <Button size="lg" variant="outline" className="rounded-full px-8 py-6 border-primary text-primary hover:bg-primary/5">
                Partner With Us
              </Button>
            </Link>
          </div>

          <div className="mt-16 md:mt-24 animate-fade-in-up [animation-delay:800ms]">
            <GlassCard className="max-w-5xl mx-auto overflow-hidden p-1 md:p-2">
              <div className="aspect-video rounded-lg overflow-hidden bg-cyan-50 border-2 border-cyan-100 flex items-center justify-center">
                <Image
                  src="/image/Screenshot 2025-03-19 004314.png"
                  alt="VidalSigns Product Demo"
                  width={1200}
                  height={675}
                  className="object-contain"
                />
              </div>
            </GlassCard>
          </div>

          <div className="mt-16 flex flex-wrap justify-center gap-8 animate-fade-in-up [animation-delay:1000ms]">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-foreground">100K+</span>
              <span className="text-muted-foreground">Healthcare Providers</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-foreground">500K+</span>
              <span className="text-muted-foreground">Patients Served</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-foreground">4.9/5</span>
              <span className="text-muted-foreground">Uptime</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold text-foreground">AI</span>
              <span className="text-muted-foreground">Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
