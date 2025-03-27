import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/ui/GlassCard";
import Link from "next/link";

const partnerPlans = [
  {
    name: "Starter",
    price: "$25",
    period: "per month",
    description: "Perfect for small wellness centers and independent practitioners.",
    features: [
      "50 QR codes per month",
      "Custom branded patient portal",
      "Basic analytics dashboard",
      "Email support",
      "Marketing materials",
      "HIPAA compliant"
    ],
    popular: false,
    buttonText: "Get Started",
    buttonVariant: "outline"
  },
  {
    name: "Professional",
    price: "$99",
    period: "per month",
    description: "Ideal for growing clinics and wellness facilities.",
    features: [
      "200 QR codes per month",
      "Fully branded patient experience",
      "Detailed usage analytics",
      "Priority support",
      "Customizable marketing kit",
      "API access for integration",
      "Volume discount eligible"
    ],
    popular: true,
    buttonText: "Become a Partner",
    buttonVariant: "default"
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "pricing",
    description: "For large healthcare networks and hospital systems.",
    features: [
      "Unlimited QR codes",
      "White-label solution",
      "Advanced analytics and reporting",
      "Dedicated account manager",
      "Custom integration services",
      "Bulk generation capabilities",
      "Up to 25% volume discount"
    ],
    popular: false,
    buttonText: "Contact Sales",
    buttonVariant: "outline"
  }
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-20 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Partner With VidalSigns
          </h2>
          <p className="text-muted-foreground text-lg">
            Offer AI-powered lab report translations to your clients and patients with our partner program.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {partnerPlans.map((plan, index) => (
            <GlassCard 
              key={index}
              className={`p-8 flex flex-col h-full ${plan.popular ? 'border-primary ring-1 ring-primary relative' : ''}`}
              opacity={plan.popular ? "medium" : "light"}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-white text-sm font-medium py-1 px-4 rounded-full">
                  Most Popular
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-xl font-medium mb-2">{plan.name}</h3>
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-muted-foreground">{plan.description}</p>
              </div>
              
              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-auto">
                <Link href="/partners">
                  <Button 
                    variant={plan.buttonVariant as "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"}
                    className={`w-full rounded-full py-6 ${
                      plan.buttonVariant === "outline" 
                        ? "hover:bg-primary/10 hover:text-primary" 
                        : "bg-primary hover:bg-primary/90"
                    }`}
                  >
                    {plan.buttonText}
                  </Button>
                </Link>
              </div>
            </GlassCard>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">
            All partner plans include a 14-day trial period and dedicated onboarding support.
          </p>
          <p className="text-sm text-muted-foreground">
            Need additional QR codes? <a href="#contact" className="text-primary underline underline-offset-4">Purchase additional codes</a> at $0.50 each with volume discounts up to 25%.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
