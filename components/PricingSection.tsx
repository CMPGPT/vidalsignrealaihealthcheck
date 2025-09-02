"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export const PricingSection = () => {
  const plans = [
    {
      name: "Single Report",
      price: "$29",
      description: "Perfect for a one-time check-in.",
      features: ["1 QR Code"],
      popular: false
    },
    {
      name: "Two Reports",
      price: "$49",
      originalPrice: "$58",
      description: "Ideal for follow-up comparisons.",
      features: ["2 QR Codes"],
      popular: true
    },
    {
      name: "Three Reports",
      price: "$79",
      originalPrice: "$87",
      description: "Best value for tracking progress.",
      features: ["3 QR Codes"],
      popular: false
    }
  ];

  const handlePlanSelect = (planName: string) => {
    alert(`You've selected the "${planName}" plan. In a real application, this would lead to a secure checkout process.`);
  };

  return (
    <section className="py-16 sm:py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-display font-bold tracking-tight text-foreground sm:text-4xl">
            Simple, One-Time Pricing
          </h3>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Get the answers you need without a subscription. Perfect for individuals.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`hover-lift border rounded-xl p-8 flex flex-col ${
                plan.popular 
                  ? 'border-2 border-primary bg-primary-soft relative' 
                  : 'border-border bg-background'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-max flex justify-center">
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full uppercase">
                    Most Popular
                  </span>
                </div>
              )}
              <h4 className="text-lg font-semibold text-foreground">{plan.name}</h4>
              <p className="mt-4 flex items-baseline">
                <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
                {plan.originalPrice && (
                  <span className="ml-2 text-muted-foreground line-through">{plan.originalPrice}</span>
                )}
              </p>
              <p className="mt-2 text-muted-foreground">{plan.description}</p>
              <ul className="mt-6 space-y-4 flex-grow">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className="h-5 w-5 text-primary mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button 
                onClick={() => handlePlanSelect(plan.name)}
                className={`mt-8 w-full font-semibold py-3 rounded-lg transition-colors ${
                  plan.popular 
                    ? 'btn-medical' 
                    : 'btn-secondary'
                }`}
              >
                Choose Plan
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

