"use client";

import { FileText, Dna, Zap, Heart } from "lucide-react";

export const FeaturesSection = () => {
  const features = [
    {
      icon: FileText,
      title: "Standard Lab Reports",
      description: "Clear explanations for reports from Quest, LabCorp, and more.",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      icon: Dna,
      title: "DNA & Genomic Reports",
      description: "Insights for GeneSight, 23andMe, and pharmacogenomic results.",
      bgColor: "bg-indigo-100",
      iconColor: "text-indigo-600"
    },
    {
      icon: Zap,
      title: "Wellness & Coach Panels",
      description: "Actionable advice for fitness assessments and health coaching.",
      bgColor: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      icon: Heart,
      title: "Functional Medicine",
      description: "Context for hormone panels, gut health, and micronutrient tests.",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600"
    }
  ];

  return (
    <section className="py-16 sm:py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-display font-bold tracking-tight text-foreground sm:text-4xl">
            One Platform for All Your Health Data
          </h3>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            From standard blood work to complex genetic reports, our AI is trained to provide 
            clear insights across a wide range of health data.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="hover-lift bg-background p-6 rounded-xl border border-border flex items-start space-x-4"
              >
                <div className={`flex-shrink-0 h-10 w-10 rounded-lg ${feature.bgColor} ${feature.iconColor} flex items-center justify-center`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{feature.title}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

