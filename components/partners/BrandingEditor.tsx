'use client';

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building, 
  Palette, 
  Rocket, 
  Upload, 
  Image, 
  Loader2, 
  ExternalLink, 
  Check,
  X,
  Plus,
  Trash2,
  Eye,
  Settings
} from "lucide-react";
import { toast } from "sonner";

// Website style definitions
const websiteStyles = [
  {
    id: "classic",
    name: "Classic Layout",
    description: "Traditional landing page with clean sections and smooth flow",
    preview: "Standard hero → features → pricing → about flow with modern design"
  },
  {
    id: "modern",
    name: "Modern Minimal",
    description: "Minimalist design with bold typography and plenty of white space",
    preview: "Clean lines, large text, minimal elements with focus on content"
  },
  {
    id: "creative",
    name: "Creative Bold",
    description: "Dynamic layout with creative sections and interactive elements",
    preview: "Asymmetric layouts, gradient backgrounds, and creative animations"
  }
];

// Theme definitions
const themes = [
  {
    id: "medical",
    name: "Medical Blue",
    description: "Professional medical theme with calming blue tones",
    primaryColor: "#2563eb",
    secondaryColor: "#10b981",
    accentColor: "#06b6d4",
    backgroundColor: "#f8fafc",
    textColor: "#1e293b"
  },
  {
    id: "wellness",
    name: "Wellness Green", 
    description: "Fresh and natural wellness theme",
    primaryColor: "#059669",
    secondaryColor: "#7c3aed",
    accentColor: "#ea580c",
    backgroundColor: "#f0fdf4",
    textColor: "#1f2937"
  },
  {
    id: "fitness",
    name: "Fitness Orange",
    description: "Energetic fitness and sports theme",
    primaryColor: "#ea580c",
    secondaryColor: "#dc2626",
    accentColor: "#ca8a04",
    backgroundColor: "#fffbeb",
    textColor: "#1c1917"
  },
  {
    id: "therapy",
    name: "Therapy Purple",
    description: "Calming therapy and mental health theme",
    primaryColor: "#7c3aed",
    secondaryColor: "#ec4899",
    accentColor: "#06b6d4",
    backgroundColor: "#faf5ff",
    textColor: "#3730a3"
  },
  {
    id: "modern",
    name: "Modern Dark",
    description: "Sleek modern theme with dark accents",
    primaryColor: "#1e293b",
    secondaryColor: "#475569",
    accentColor: "#0ea5e9",
    backgroundColor: "#ffffff",
    textColor: "#0f172a"
  }
];

interface BrandSettings {
  brandName: string;
  logoUrl: string;
  selectedTheme: string;
  websiteStyle: string;
  customColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  heroSection: {
    headline: string;
    subheadline: string;
    ctaText: string;
    secondaryCtaText: string;
    stats: Array<{
      value: string;
      label: string;
    }>;
  };
  featuresSection: {
    title: string;
    subtitle: string;
    features: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
  };
  pricingSection: {
    enabled: boolean;
    title: string;
    subtitle: string;
    plans: Array<{
      name: string;
      price: string;
      quantity: string;
      description: string;
      features: string[];
      popular: boolean;
      buttonText: string;
    }>;
  };
  isDeployed: boolean;
  websiteUrl: string;
}

interface BrandingEditorProps {
  initialSettings: Partial<BrandSettings>;
  onSave: (settings: BrandSettings) => Promise<void>;
  onDeploy: () => Promise<void>;
  isLoading?: boolean;
  isDeploying?: boolean;
}

const defaultSettings: BrandSettings = {
  brandName: "",
  logoUrl: "",
  selectedTheme: "medical",
  websiteStyle: "classic",
  customColors: {
    primary: "#2563eb",
    secondary: "#10b981", 
    accent: "#06b6d4"
  },
  heroSection: {
    headline: "Understand Your Lab Results In Plain English",
    subheadline: "Translate complex lab reports into clear, easy-to-understand explanations using advanced AI technology—no medical knowledge required.",
    ctaText: "Upload Your Labs",
    secondaryCtaText: "Learn More",
    stats: [
      { value: "100K+", label: "Healthcare Providers" },
      { value: "500K+", label: "Patients Served" },
      { value: "4.9/5", label: "Satisfaction Score" },
      { value: "HIPAA", label: "Compliant" }
    ]
  },
  featuresSection: {
    title: "Two Simple Ways to Access",
    subtitle: "Flexible access options for individuals and businesses, with no complex dashboards or management required.",
    features: [
      {
        title: "Simple Upload Process",
        description: "Upload your lab reports as PDFs or images in seconds. Our AI automatically recognizes test results.",
        icon: "upload"
      },
      {
        title: "AI-Powered Explanations", 
        description: "Receive clear explanations of your lab results with actionable insights in plain language.",
        icon: "brain"
      },
      {
        title: "HIPAA Compliant",
        description: "All data is processed securely with full HIPAA compliance and encryption standards.",
        icon: "shield"
      }
    ]
  },
  pricingSection: {
    enabled: true,
    title: "QR Codes & Secure Links",
    subtitle: "Purchase QR codes and secure links to share lab reports with your patients.",
    plans: [
      {
        name: "Starter Pack",
        price: "$29",
        quantity: "10 QR Codes",
        description: "Perfect for small practices",
        features: [
          "10 QR Codes",
          "Secure link generation",
          "Basic support",
          "24-hour expiry"
        ],
        popular: false,
        buttonText: "Purchase Now"
      }
    ]
  },
  isDeployed: false,
  websiteUrl: ""
};

export default function BrandingEditor({ 
  initialSettings, 
  onSave, 
  onDeploy, 
  isLoading = false, 
  isDeploying = false 
}: BrandingEditorProps) {
  const [settings, setSettings] = useState<BrandSettings>({
    ...defaultSettings,
    ...initialSettings
  });

  const [activeSection, setActiveSection] = useState("layout");

  // Sync component state with prop changes
  useEffect(() => {
    setSettings(prev => ({
      ...defaultSettings,
      ...initialSettings
    }));
  }, [initialSettings]);

  // Sync customColors when selectedTheme changes in initialSettings
  useEffect(() => {
    if (initialSettings.selectedTheme) {
      const selectedTheme = themes.find(t => t.id === initialSettings.selectedTheme);
      if (selectedTheme && !initialSettings.customColors) {
        // Only auto-update colors if no custom colors are set
        setSettings(prev => ({
          ...prev,
          customColors: {
            primary: selectedTheme.primaryColor,
            secondary: selectedTheme.secondaryColor,
            accent: selectedTheme.accentColor
          }
        }));
      }
    }
  }, [initialSettings.selectedTheme]);

  const handleSettingsChange = (path: string, value: any) => {
    console.log('🔍 FRONTEND: handleSettingsChange called with path:', path, 'value:', value);
    setSettings(prev => {
      const newSettings = JSON.parse(JSON.stringify(prev)); // Deep clone to avoid mutation
      const keys = path.split('.');
      let current: any = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      
      // Special handling: When selectedTheme changes, update customColors to match
      if (path === 'selectedTheme') {
        const selectedTheme = themes.find(t => t.id === value);
        if (selectedTheme) {
          newSettings.customColors = {
            primary: selectedTheme.primaryColor,
            secondary: selectedTheme.secondaryColor,
            accent: selectedTheme.accentColor
          };
          console.log('🎨 FRONTEND: Auto-updated customColors for theme:', value, newSettings.customColors);
        }
      }
      
      console.log('🔍 FRONTEND: Updated settings after change:', JSON.stringify(newSettings, null, 2));
      return newSettings;
    });
  };

  const addPricingPlan = () => {
    if (settings.pricingSection.plans.length >= 5) {
      toast.error("Maximum 5 pricing plans allowed");
      return;
    }

    const newPlan = {
      name: "New Pack",
      price: "$49",
      quantity: "25 QR Codes",
      description: "Perfect for growing practices",
      features: ["25 QR Codes", "Secure link generation", "Email support"],
      popular: false,
      buttonText: "Purchase Now"
    };

    setSettings(prev => ({
      ...prev,
      pricingSection: {
        ...prev.pricingSection,
        plans: [...prev.pricingSection.plans, newPlan]
      }
    }));
  };

  const removePricingPlan = (index: number) => {
    if (settings.pricingSection.plans.length <= 1) {
      toast.error("At least 1 pricing plan required");
      return;
    }

    setSettings(prev => ({
      ...prev,
      pricingSection: {
        ...prev.pricingSection,
        plans: prev.pricingSection.plans.filter((_, i) => i !== index)
      }
    }));
  };

  const selectedTheme = themes.find(t => t.id === settings.selectedTheme) || themes[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Advanced Branding & Website Builder
        </CardTitle>
        <CardDescription>
          Create a fully customized website for your practice with professional themes and editable content
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="theme">Theme</TabsTrigger>
            <TabsTrigger value="brand">Brand</TabsTrigger>
            <TabsTrigger value="hero">Hero</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
          </TabsList>

          {/* Layout/Website Style Selection */}
          <TabsContent value="layout" className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Choose Your Website Layout</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {websiteStyles.map((style) => (
                  <div
                    key={style.id}
                    onClick={() => handleSettingsChange('websiteStyle', style.id)}
                    className={`relative p-6 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                      settings.websiteStyle === style.id 
                        ? 'border-primary ring-2 ring-primary/20' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {settings.websiteStyle === style.id && (
                      <div className="absolute -top-2 -right-2 bg-primary text-white rounded-full p-1">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                    
                    {/* Layout Preview */}
                    <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-md mb-4 relative overflow-hidden">
                      {style.id === 'classic' && (
                        <div className="p-2 text-xs text-gray-600">
                          <div className="bg-white h-3 rounded mb-1"></div>
                          <div className="grid grid-cols-3 gap-1 mb-1">
                            <div className="bg-white h-6 rounded"></div>
                            <div className="bg-white h-6 rounded"></div>
                            <div className="bg-white h-6 rounded"></div>
                          </div>
                          <div className="bg-white h-8 rounded"></div>
                        </div>
                      )}
                      {style.id === 'modern' && (
                        <div className="p-2 text-xs text-gray-600">
                          <div className="bg-white h-8 rounded mb-2"></div>
                          <div className="bg-white h-4 rounded mb-4"></div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-white h-6 rounded"></div>
                            <div className="bg-white h-6 rounded"></div>
                          </div>
                        </div>
                      )}
                      {style.id === 'creative' && (
                        <div className="p-2 text-xs text-gray-600">
                          <div className="bg-gradient-to-r from-white to-gray-300 h-6 rounded mb-1"></div>
                          <div className="flex gap-1">
                            <div className="bg-white h-8 rounded flex-1"></div>
                            <div className="bg-gradient-to-br from-white to-gray-300 h-12 rounded w-8"></div>
                          </div>
                          <div className="bg-white h-4 rounded mt-1"></div>
                        </div>
                      )}
                    </div>
                    
                    <h4 className="font-medium text-base mb-2">{style.name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{style.description}</p>
                    <p className="text-xs text-muted-foreground italic">{style.preview}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Theme Selection */}
          <TabsContent value="theme" className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Choose Your Theme</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {themes.map((theme) => (
                  <div
                    key={theme.id}
                    onClick={() => handleSettingsChange('selectedTheme', theme.id)}
                    className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                      settings.selectedTheme === theme.id 
                        ? 'border-primary ring-2 ring-primary/20' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {settings.selectedTheme === theme.id && (
                      <div className="absolute -top-2 -right-2 bg-primary text-white rounded-full p-1">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                    
                    <div 
                      className="h-20 rounded-md mb-3"
                      style={{
                        background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`
                      }}
                    />
                    
                    <h4 className="font-medium text-sm">{theme.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{theme.description}</p>
                    
                    <div className="flex gap-1 mt-2">
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: theme.primaryColor }}
                      />
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: theme.secondaryColor }}
                      />
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: theme.accentColor }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Colors Override */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Customize Colors (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-10 h-10 rounded border"
                      style={{ backgroundColor: settings.customColors.primary }}
                    />
                    <Input 
                      value={settings.customColors.primary}
                      onChange={(e) => handleSettingsChange('customColors.primary', e.target.value)}
                      placeholder="#2563eb"
                    />
                    <input
                      type="color"
                      value={settings.customColors.primary}
                      onChange={(e) => handleSettingsChange('customColors.primary', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-10 h-10 rounded border"
                      style={{ backgroundColor: settings.customColors.secondary }}
                    />
                    <Input 
                      value={settings.customColors.secondary}
                      onChange={(e) => handleSettingsChange('customColors.secondary', e.target.value)}
                      placeholder="#10b981"
                    />
                    <input
                      type="color"
                      value={settings.customColors.secondary}
                      onChange={(e) => handleSettingsChange('customColors.secondary', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Accent Color</Label>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-10 h-10 rounded border"
                      style={{ backgroundColor: settings.customColors.accent }}
                    />
                    <Input 
                      value={settings.customColors.accent}
                      onChange={(e) => handleSettingsChange('customColors.accent', e.target.value)}
                      placeholder="#06b6d4"
                    />
                    <input
                      type="color"
                      value={settings.customColors.accent}
                      onChange={(e) => handleSettingsChange('customColors.accent', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Brand Settings */}
          <TabsContent value="brand" className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="brand-name">Brand Name</Label>
                <Input 
                  id="brand-name"
                  value={settings.brandName}
                  onChange={(e) => handleSettingsChange('brandName', e.target.value)}
                  placeholder="Enter your brand name"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label>Brand Logo</Label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center border overflow-hidden">
                    {settings.logoUrl ? (
                      <img 
                        src={settings.logoUrl} 
                        alt="Brand Logo" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Logo
                    </Button>
                    {settings.logoUrl && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleSettingsChange('logoUrl', '')}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Hero Section */}
          <TabsContent value="hero" className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="hero-headline">Main Headline</Label>
                <Input 
                  id="hero-headline"
                  value={settings.heroSection.headline}
                  onChange={(e) => handleSettingsChange('heroSection.headline', e.target.value)}
                  placeholder="Your main headline"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="hero-subheadline">Subheadline</Label>
                <Textarea 
                  id="hero-subheadline"
                  value={settings.heroSection.subheadline}
                  onChange={(e) => handleSettingsChange('heroSection.subheadline', e.target.value)}
                  placeholder="Describe your service..."
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hero-cta">Primary Button Text</Label>
                  <Input 
                    id="hero-cta"
                    value={settings.heroSection.ctaText}
                    onChange={(e) => handleSettingsChange('heroSection.ctaText', e.target.value)}
                    placeholder="Get Started"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="hero-secondary-cta">Secondary Button Text</Label>
                  <Input 
                    id="hero-secondary-cta"
                    value={settings.heroSection.secondaryCtaText}
                    onChange={(e) => handleSettingsChange('heroSection.secondaryCtaText', e.target.value)}
                    placeholder="Learn More"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label>Statistics Section</Label>
                <div className="mt-2 space-y-2">
                  {settings.heroSection.stats.map((stat, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input 
                        value={stat.value}
                        onChange={(e) => {
                          const newStats = [...settings.heroSection.stats];
                          newStats[index].value = e.target.value;
                          handleSettingsChange('heroSection.stats', newStats);
                        }}
                        placeholder="100K+"
                        className="w-24"
                      />
                      <Input 
                        value={stat.label}
                        onChange={(e) => {
                          const newStats = [...settings.heroSection.stats];
                          newStats[index].label = e.target.value;
                          handleSettingsChange('heroSection.stats', newStats);
                        }}
                        placeholder="Happy Customers"
                        className="flex-1"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Features Section */}
          <TabsContent value="features" className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="features-title">Features Section Title</Label>
                <Input 
                  id="features-title"
                  value={settings.featuresSection.title}
                  onChange={(e) => handleSettingsChange('featuresSection.title', e.target.value)}
                  placeholder="Why Choose Us"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="features-subtitle">Features Section Subtitle</Label>
                <Textarea 
                  id="features-subtitle"
                  value={settings.featuresSection.subtitle}
                  onChange={(e) => handleSettingsChange('featuresSection.subtitle', e.target.value)}
                  placeholder="Describe your key features..."
                  className="mt-1"
                  rows={2}
                />
              </div>
              
              <div>
                <Label>Features List</Label>
                <div className="mt-2 space-y-4">
                  {settings.featuresSection.features.map((feature, index) => (
                    <Card key={index} className="p-4">
                      <div className="space-y-3">
                        <div>
                          <Label>Feature Title</Label>
                          <Input 
                            value={feature.title}
                            onChange={(e) => {
                              const newFeatures = [...settings.featuresSection.features];
                              newFeatures[index].title = e.target.value;
                              handleSettingsChange('featuresSection.features', newFeatures);
                            }}
                            placeholder="Feature name"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Feature Description</Label>
                          <Textarea 
                            value={feature.description}
                            onChange={(e) => {
                              const newFeatures = [...settings.featuresSection.features];
                              newFeatures[index].description = e.target.value;
                              handleSettingsChange('featuresSection.features', newFeatures);
                            }}
                            placeholder="Describe this feature..."
                            className="mt-1"
                            rows={2}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Pricing Section */}
          <TabsContent value="pricing" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">QR Code & Secure Link Packages</h3>
                <p className="text-sm text-muted-foreground">Configure 1-5 pricing plans for QR codes and secure links</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={settings.pricingSection.enabled}
                  onCheckedChange={(checked) => handleSettingsChange('pricingSection.enabled', checked)}
                />
                <Label>Enable Pricing Section</Label>
              </div>
            </div>
            
            {settings.pricingSection.enabled && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pricing-title">Pricing Section Title</Label>
                    <Input 
                      id="pricing-title"
                      value={settings.pricingSection.title}
                      onChange={(e) => handleSettingsChange('pricingSection.title', e.target.value)}
                      placeholder="Our Pricing"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pricing-subtitle">Pricing Section Subtitle</Label>
                    <Input 
                      id="pricing-subtitle"
                      value={settings.pricingSection.subtitle}
                      onChange={(e) => handleSettingsChange('pricingSection.subtitle', e.target.value)}
                      placeholder="Choose the right plan for you"
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div>
                                  <div className="flex items-center justify-between mb-4">
                  <Label>Pricing Plans ({settings.pricingSection.plans.length}/5)</Label>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={addPricingPlan}
                    disabled={settings.pricingSection.plans.length >= 5}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Plan
                  </Button>
                </div>
                  
                  <div className="space-y-4">
                    {settings.pricingSection.plans.map((plan, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium">Plan {index + 1}</h4>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                              <Switch 
                                checked={plan.popular}
                                onCheckedChange={(checked) => {
                                  const newPlans = [...settings.pricingSection.plans];
                                  newPlans[index].popular = checked;
                                  handleSettingsChange('pricingSection.plans', newPlans);
                                }}
                              />
                              <Label className="text-sm">Popular</Label>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removePricingPlan(index)}
                              disabled={settings.pricingSection.plans.length <= 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Plan Name</Label>
                            <Input 
                              value={plan.name}
                              onChange={(e) => {
                                const newPlans = [...settings.pricingSection.plans];
                                newPlans[index].name = e.target.value;
                                handleSettingsChange('pricingSection.plans', newPlans);
                              }}
                              placeholder="Professional"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Price</Label>
                            <Input 
                              value={plan.price}
                              onChange={(e) => {
                                const newPlans = [...settings.pricingSection.plans];
                                newPlans[index].price = e.target.value;
                                handleSettingsChange('pricingSection.plans', newPlans);
                              }}
                              placeholder="$99"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Quantity</Label>
                            <Input 
                              value={plan.quantity}
                              onChange={(e) => {
                                const newPlans = [...settings.pricingSection.plans];
                                newPlans[index].quantity = e.target.value;
                                handleSettingsChange('pricingSection.plans', newPlans);
                              }}
                              placeholder="10 QR Codes"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Button Text</Label>
                            <Input 
                              value={plan.buttonText}
                              onChange={(e) => {
                                const newPlans = [...settings.pricingSection.plans];
                                newPlans[index].buttonText = e.target.value;
                                handleSettingsChange('pricingSection.plans', newPlans);
                              }}
                              placeholder="Get Started"
                              className="mt-1"
                            />
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <Label>Description</Label>
                          <Textarea 
                            value={plan.description}
                            onChange={(e) => {
                              const newPlans = [...settings.pricingSection.plans];
                              newPlans[index].description = e.target.value;
                              handleSettingsChange('pricingSection.plans', newPlans);
                            }}
                            placeholder="Perfect for growing businesses"
                            className="mt-1"
                            rows={2}
                          />
                        </div>
                        
                        <div className="mt-4">
                          <Label>Features (one per line)</Label>
                          <Textarea 
                            value={plan.features.join('\n')}
                            onChange={(e) => {
                              const newPlans = [...settings.pricingSection.plans];
                              newPlans[index].features = e.target.value.split('\n').filter(f => f.trim());
                              handleSettingsChange('pricingSection.plans', newPlans);
                            }}
                            placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                            className="mt-1"
                            rows={4}
                          />
                        </div>
                      </Card>
                    ))}
                  </div>
                  
                  {/* Pricing Preview */}
                  <div className="mt-8">
                    <h4 className="text-lg font-medium mb-4">Preview</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {settings.pricingSection.plans.map((plan, index) => (
                        <div key={index} className="relative bg-white rounded-lg border p-6 shadow-sm">
                          {plan.popular && (
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                              <div className="bg-brand-primary text-white px-4 py-1 rounded-full text-xs font-semibold">
                                Most Popular
                              </div>
                            </div>
                          )}
                          
                          <div className="text-center">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                            <p className="text-gray-600 mb-4">{plan.description}</p>
                            
                            <div className="mb-6">
                              <div className="flex items-baseline justify-center mb-2">
                                <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                                <span className="text-gray-600 ml-1">for {plan.quantity}</span>
                              </div>
                            </div>
                            
                            <button className="w-full py-2 px-4 rounded-lg font-semibold transition-all duration-200 mb-6 bg-brand-primary text-white hover:opacity-90">
                              {plan.buttonText}
                            </button>
                          </div>
                          
                          <div className="space-y-3">
                            <h4 className="font-semibold text-gray-900 text-sm">What's included:</h4>
                            <ul className="space-y-2">
                              {plan.features.map((feature, featureIndex) => (
                                <li key={featureIndex} className="flex items-start text-sm">
                                  <svg 
                                    className="h-4 w-4 text-brand-primary mr-2 mt-0.5 flex-shrink-0" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                  >
                                    <path 
                                      strokeLinecap="round" 
                                      strokeLinejoin="round" 
                                      strokeWidth="2" 
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                  <span className="text-gray-700">{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Separator className="my-6" />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => {
              console.log('🔍 FRONTEND: About to save settings:', JSON.stringify(settings, null, 2));
              onSave(settings);
            }}
            disabled={isLoading || isDeploying}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Settings className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
          
          <Button 
            variant="outline"
            onClick={onDeploy}
            disabled={isLoading || isDeploying || !settings.brandName}
            className="flex-1"
          >
            {isDeploying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deploying...
              </>
            ) : (
              <>
                <Rocket className="mr-2 h-4 w-4" />
                Deploy Website
              </>
            )}
          </Button>
          
          <Button 
            variant="secondary"
            disabled={!settings.isDeployed}
            onClick={() => {
              if (settings.websiteUrl) {
                window.open(settings.websiteUrl, '_blank');
              }
            }}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Preview
          </Button>
        </div>

        {/* Deployment Status */}
        {settings.isDeployed && settings.websiteUrl && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">🚀 Website Deployed Successfully!</CardTitle>
              <CardDescription>Your branded website is live and ready to use</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Website URL:</p>
                  <p className="text-sm text-muted-foreground break-all">{settings.websiteUrl}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(settings.websiteUrl, '_blank')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Visit Site
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
} 