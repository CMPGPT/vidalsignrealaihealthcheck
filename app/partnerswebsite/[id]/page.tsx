'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import ModernLayout from '@/components/partner-layouts/ModernLayout';
import CreativeLayout from '@/components/partner-layouts/CreativeLayout';
import PaymentPopup from '@/components/partners/PaymentPopup';

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

interface ContactInfo {
  email: string;
  phone: string;
}

export default function PartnerWebsitePage() {
  const params = useParams();
  const brandId = params.id as string;
  const [brandSettings, setBrandSettings] = useState<BrandSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: '',
    phone: ''
  });
  const [paymentPopup, setPaymentPopup] = useState<{
    isOpen: boolean;
    plan: any;
  }>({
    isOpen: false,
    plan: null
  });

  const fetchBrandSettings = async () => {
    try {
      console.log('🔍 PARTNER WEBSITE: Fetching brand settings for:', brandId);
      
      const response = await fetch(`/api/brand-settings/public?brandId=${brandId}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('✅ PARTNER WEBSITE: Brand settings received:', data.brandSettings);
        setBrandSettings(data.brandSettings);
        
        // Fetch contact information for the footer
        console.log('🔍 PARTNER WEBSITE: About to fetch contact info for userId:', data.brandSettings.userId);
        await fetchContactInfo(data.brandSettings.userId);
      } else {
        console.log('❌ PARTNER WEBSITE: Failed to fetch brand settings:', data.message);
        setError(data.message || 'Website not found');
      }
    } catch (error) {
      console.error('❌ PARTNER WEBSITE: Error fetching brand settings:', error);
      setError('Failed to load website');
    } finally {
      setLoading(false);
    }
  };

  const fetchContactInfo = async (userId: string) => {
    try {
      console.log('🔍 PARTNER WEBSITE: Fetching contact info for userId:', userId);
      
      const response = await fetch(`/api/partner-contact?userId=${userId}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('✅ PARTNER WEBSITE: Contact info received:', data.contact);
        setContactInfo(data.contact);
      } else {
        console.log('❌ PARTNER WEBSITE: Failed to fetch contact info:', data.error);
        // Use fallback contact info
        setContactInfo({
          email: `info@${brandSettings?.brandName?.toLowerCase().replace(/\s+/g, '') || 'company'}.com`,
          phone: '+1 (555) 123-4567'
        });
      }
    } catch (error) {
      console.error('❌ PARTNER WEBSITE: Error fetching contact info:', error);
      // Use fallback contact info
      setContactInfo({
        email: `info@${brandSettings?.brandName?.toLowerCase().replace(/\s+/g, '') || 'company'}.com`,
        phone: '+1 (555) 123-4567'
      });
    }
  };

  useEffect(() => {
    if (brandId) {
      fetchBrandSettings();
    }
  }, [brandId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading website...</p>
        </div>
      </div>
    );
  }

  if (error || !brandSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">🏥</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Website Not Found</h1>
          <p className="text-gray-600 mb-4">
            {error || 'This partner website is not available or has not been deployed yet.'}
          </p>
          <a 
            href="/" 
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Main Site
          </a>
        </div>
      </div>
    );
  }

  // Render different layouts based on websiteStyle
  const renderLayout = () => {
    const handlePaymentClick = (plan: any) => {
      setPaymentPopup({
        isOpen: true,
        plan
      });
    };

    switch (brandSettings.websiteStyle) {
      case 'modern':
        return <ModernLayout brandSettings={brandSettings} onPaymentClick={handlePaymentClick} contactInfo={contactInfo} />;
      case 'creative':
        return <CreativeLayout brandSettings={brandSettings} onPaymentClick={handlePaymentClick} contactInfo={contactInfo} />;
      case 'classic':
      default:
        return <ClassicLayout brandSettings={brandSettings} onPaymentClick={handlePaymentClick} contactInfo={contactInfo} />;
    }
  };

  return (
    <>
      {renderLayout()}
      
      {paymentPopup.isOpen && paymentPopup.plan && brandSettings && (
        <PaymentPopup
          isOpen={paymentPopup.isOpen}
          onClose={() => setPaymentPopup({ isOpen: false, plan: null })}
          plan={{
            ...paymentPopup.plan,
            // Ensure price has $ symbol
            price: paymentPopup.plan.price.startsWith('$') 
              ? paymentPopup.plan.price 
              : `$${paymentPopup.plan.price}`
          }}
          brandName={brandSettings.brandName}
          brandColors={brandSettings.customColors}
        />
      )}
    </>
  );
}

// Classic Layout Component (Enhanced Beautiful Design - Fully Responsive)
function ClassicLayout({ brandSettings, onPaymentClick, contactInfo }: { brandSettings: BrandSettings; onPaymentClick: (plan: any) => void; contactInfo?: ContactInfo }) {
  const { brandName, logoUrl, customColors, heroSection, featuresSection, pricingSection } = brandSettings;
  const primaryColor = customColors.primary;
  const secondaryColor = customColors.secondary;
  const accentColor = customColors.accent;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Set CSS custom properties for brand colors
    document.documentElement.style.setProperty('--brand-primary', primaryColor);
    document.documentElement.style.setProperty('--brand-secondary', secondaryColor);
    document.documentElement.style.setProperty('--brand-accent', accentColor);
    
    // Set page title
    document.title = `${brandName} - AI Health Check`;
  }, [brandName, primaryColor, secondaryColor, accentColor]);

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    document.getElementById(sectionId)?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 font-['Inter',sans-serif]">
      {/* Inline styles for brand colors and custom fonts */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');
        
        .bg-brand-primary { background-color: ${primaryColor}; }
        .text-brand-primary { color: ${primaryColor}; }
        .border-brand-primary { border-color: ${primaryColor}; }
        .bg-brand-secondary { background-color: ${secondaryColor}; }
        .text-brand-secondary { color: ${secondaryColor}; }
        .hover\\:bg-brand-primary:hover { background-color: ${primaryColor}; }
        .hover\\:text-brand-primary:hover { color: ${primaryColor}; }
        .gradient-brand { 
          background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor}); 
        }
        .gradient-hero {
          background: linear-gradient(135deg, ${primaryColor}dd, ${secondaryColor}dd, ${accentColor}dd);
        }
        .glass-effect {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .shadow-glow {
          box-shadow: 0 0 30px rgba(0, 0, 0, 0.1);
        }
        .text-gradient {
          background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Enhanced Navigation - Fully Responsive */}
      <nav className="bg-white/90 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center">
              {logoUrl ? (
                <img src={logoUrl} alt={brandName} className="h-8 w-8 sm:h-12 sm:w-12 mr-2 sm:mr-4 rounded-lg sm:rounded-xl shadow-lg" />
              ) : (
                <div className="h-8 w-8 sm:h-12 sm:w-12 mr-2 sm:mr-4 rounded-lg sm:rounded-xl text-white font-bold text-sm sm:text-lg flex items-center justify-center shadow-lg gradient-brand">
                  {brandName.substring(0, 2).toUpperCase()}
                </div>
              )}
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 font-['Playfair+Display',serif]">{brandName}</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <a href="#features" className="text-gray-700 hover:text-brand-primary transition-all duration-300 font-medium text-sm lg:text-base">Features</a>
              {pricingSection.enabled && (
                <a href="#pricing" className="text-gray-700 hover:text-brand-primary transition-all duration-300 font-medium text-sm lg:text-base">Pricing</a>
              )}
              <a href="#about" className="text-gray-700 hover:text-brand-primary transition-all duration-300 font-medium text-sm lg:text-base">About</a>
              <button 
                onClick={() => {
                  if (pricingSection.enabled) {
                    document.getElementById('pricing')?.scrollIntoView({ 
                      behavior: 'smooth' 
                    });
                  } else {
                    document.getElementById('features')?.scrollIntoView({ 
                      behavior: 'smooth' 
                    });
                  }
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 lg:px-6 lg:py-3 rounded-full font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105 shadow-md border-2 border-blue-200 text-sm lg:text-base"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                onClick={handleMobileMenuToggle}
                className="text-gray-700 hover:text-brand-primary transition-colors p-2"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-lg">
              <div className="px-4 py-6 space-y-4">
                <a 
                  href="#features" 
                  onClick={() => handleMobileNavClick('features')}
                  className="block text-gray-700 hover:text-brand-primary transition-colors font-medium text-lg py-2"
                >
                  Features
                </a>
                {pricingSection.enabled && (
                  <a 
                    href="#pricing" 
                    onClick={() => handleMobileNavClick('pricing')}
                    className="block text-gray-700 hover:text-brand-primary transition-colors font-medium text-lg py-2"
                  >
                    Pricing
                  </a>
                )}
                <a 
                  href="#about" 
                  onClick={() => handleMobileNavClick('about')}
                  className="block text-gray-700 hover:text-brand-primary transition-colors font-medium text-lg py-2"
                >
                  About
                </a>
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (pricingSection.enabled) {
                      document.getElementById('pricing')?.scrollIntoView({ 
                        behavior: 'smooth' 
                      });
                    } else {
                      document.getElementById('features')?.scrollIntoView({ 
                        behavior: 'smooth' 
                      });
                    }
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105 shadow-md border-2 border-blue-200 text-base"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Enhanced Hero Section - Fully Responsive */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0 gradient-hero"></div>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 lg:py-32">
          <div className="text-center">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 md:mb-8 font-['Playfair+Display',serif] leading-tight">
                {heroSection.headline}
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-8 sm:mb-10 md:mb-12 max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl mx-auto font-light leading-relaxed">
                {heroSection.subheadline}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-12 sm:mb-16">
              <button 
                onClick={() => {
                  if (pricingSection.enabled) {
                    document.getElementById('pricing')?.scrollIntoView({ 
                      behavior: 'smooth' 
                    });
                  } else {
                    document.getElementById('features')?.scrollIntoView({ 
                      behavior: 'smooth' 
                    });
                  }
                }}
                className="bg-white text-brand-primary px-6 sm:px-8 md:px-10 py-3 sm:py-4 rounded-full font-semibold text-sm sm:text-base md:text-lg hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-lg"
              >
                {heroSection.ctaText}
              </button>
              <button 
                onClick={() => {
                  document.getElementById('about')?.scrollIntoView({ 
                    behavior: 'smooth' 
                  });
                }}
                className="border-2 border-white text-white px-6 sm:px-8 md:px-10 py-3 sm:py-4 rounded-full font-semibold text-sm sm:text-base md:text-lg hover:bg-white hover:text-purple-600 transition-all duration-300 backdrop-blur-sm"
              >
                {heroSection.secondaryCtaText}
              </button>
            </div>
            
            {/* Enhanced Stats Section - Responsive Grid */}
            {heroSection.stats && heroSection.stats.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mt-12 sm:mt-16 md:mt-20 pt-12 sm:pt-16 md:pt-20 border-t border-white/20">
                {heroSection.stats.map((stat, index) => (
                  <div key={index} className="text-center glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6 backdrop-blur-sm">
                    <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 font-['Playfair+Display',serif]">
                      {stat.value}
                    </div>
                    <div className="text-white/90 text-xs sm:text-sm font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 sm:top-20 left-4 sm:left-10 w-12 h-12 sm:w-20 sm:h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 sm:bottom-20 right-4 sm:right-10 w-16 h-16 sm:w-32 sm:h-32 bg-white/10 rounded-full blur-xl"></div>
      </section>

      {/* Enhanced Features Section - Fully Responsive */}
      <section id="features" className="py-16 sm:py-20 md:py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 font-['Playfair+Display',serif]">
              {featuresSection.title}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl mx-auto font-light leading-relaxed">
              {featuresSection.subtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {featuresSection.features.map((feature, index) => {
              const getIconSvg = (iconName: string) => {
                switch (iconName) {
                  case 'upload':
                    return (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                    );
                  case 'brain':
                    return (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                    );
                  case 'shield':
                    return (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    );
                  default:
                    return (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    );
                }
              };
              
              return (
                <div key={index} className="group text-center p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-200 hover:border-brand-primary/50 transition-all duration-500 hover:shadow-glow bg-white hover:bg-gradient-to-br hover:from-white hover:to-gray-50">
                  <div 
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300"
                    style={{ 
                      background: `linear-gradient(135deg, ${index % 2 === 0 ? primaryColor : secondaryColor}20, ${index % 2 === 0 ? primaryColor : secondaryColor}10)` 
                    }}
                  >
                    <svg className={`w-8 h-8 sm:w-10 sm:h-10 ${index % 2 === 0 ? 'text-brand-primary' : 'text-brand-secondary'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {getIconSvg(feature.icon)}
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4 font-['Playfair+Display',serif]">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enhanced Pricing Section - Fully Responsive */}
      {pricingSection.enabled && (
        <section id="pricing" className="py-16 sm:py-20 md:py-24 lg:py-32 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16 md:mb-20">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 font-['Playfair+Display',serif]">
                {pricingSection.title}
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl mx-auto font-light leading-relaxed">
                {pricingSection.subtitle}
              </p>
            </div>
            
            <div className={`grid gap-6 sm:gap-8 ${pricingSection.plans.length === 1 ? 'max-w-sm sm:max-w-md mx-auto' : 'grid-cols-1 lg:grid-cols-2 max-w-4xl lg:max-w-5xl mx-auto'}`}>
              {pricingSection.plans.map((plan, index) => (
                <div 
                  key={index} 
                  className={`relative bg-white rounded-2xl sm:rounded-3xl border-2 p-6 sm:p-8 md:p-10 shadow-glow hover:shadow-2xl transition-all duration-500 ${
                    plan.popular 
                      ? 'border-brand-primary scale-105' 
                      : 'border-gray-200 hover:border-brand-primary/50'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 sm:-top-6 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-semibold shadow-lg border-2 border-white">
                        Most Popular
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 font-['Playfair+Display',serif]">{plan.name}</h3>
                    <p className="text-sm sm:text-base md:text-lg text-gray-700 mb-6 sm:mb-8">{plan.description}</p>
                    
                    <div className="mb-6 sm:mb-8">
                      <div className="flex items-baseline justify-center mb-2">
                        <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">{plan.price}</span>
                        <span className="text-sm sm:text-base md:text-lg text-gray-600 ml-1 sm:ml-2">for {plan.quantity}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => onPaymentClick(plan)}
                      className={`w-full py-3 sm:py-4 px-6 sm:px-8 rounded-full font-semibold text-sm sm:text-base md:text-lg transition-all duration-300 mb-8 sm:mb-10 ${
                        plan.popular
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-xl hover:scale-105 shadow-lg border-2 border-purple-200'
                          : 'bg-blue-600 text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 hover:shadow-xl hover:scale-105 shadow-md border-2 border-blue-200'
                      }`}
                    >
                      {plan.buttonText}
                    </button>
                  </div>
                  
                  <div className="space-y-4 sm:space-y-6">
                    <h4 className="font-semibold text-gray-900 text-base sm:text-lg md:text-xl">What's included:</h4>
                    <ul className="space-y-3 sm:space-y-4">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <svg 
                            className="h-5 w-5 sm:h-6 sm:w-6 text-brand-primary mr-3 sm:mr-4 mt-0.5 sm:mt-1 flex-shrink-0" 
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
                          <span className="text-sm sm:text-base md:text-lg text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Enhanced About Section - Fully Responsive */}
      <section id="about" className="py-16 sm:py-20 md:py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8 font-['Playfair+Display',serif]">
                About {brandName}
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                We're revolutionizing healthcare through AI-powered analysis. Our advanced technology helps individuals 
                understand their health better by providing instant, accurate insights from medical reports.
              </p>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-10 leading-relaxed">
                With {brandName}, you can take control of your health journey with confidence and clarity.
              </p>
              <button 
                onClick={() => {
                  if (pricingSection.enabled) {
                    document.getElementById('pricing')?.scrollIntoView({ 
                      behavior: 'smooth' 
                    });
                  } else {
                    document.getElementById('features')?.scrollIntoView({ 
                      behavior: 'smooth' 
                    });
                  }
                }}
                className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white px-6 sm:px-8 md:px-10 py-3 sm:py-4 rounded-full font-semibold text-sm sm:text-base md:text-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                Start Your Analysis
              </button>
            </div>
            <div className="glass-effect p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl backdrop-blur-sm border border-white/20">
              <div className="text-center space-y-6 sm:space-y-8">
                <div>
                  <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-primary mb-2 sm:mb-3 font-['Playfair+Display',serif]">10,000+</div>
                  <div className="text-sm sm:text-base md:text-lg text-gray-600">Reports Analyzed</div>
                </div>
                
                <div>
                  <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-secondary mb-2 sm:mb-3 font-['Playfair+Display',serif]">99.9%</div>
                  <div className="text-sm sm:text-base md:text-lg text-gray-600">Accuracy Rate</div>
                </div>
                
                <div>
                  <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-primary mb-2 sm:mb-3 font-['Playfair+Display',serif]">24/7</div>
                  <div className="text-sm sm:text-base md:text-lg text-gray-600">Available</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section - Fully Responsive */}
      <section className="py-16 sm:py-20 md:py-24 lg:py-32 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 sm:mb-8 font-['Playfair+Display',serif]">
            Ready to Get Started?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-8 sm:mb-10 max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl mx-auto font-light leading-relaxed">
            Join thousands of users who trust {brandName} for their health analysis needs.
          </p>
          <button 
            onClick={() => {
              if (pricingSection.enabled) {
                document.getElementById('pricing')?.scrollIntoView({ 
                  behavior: 'smooth' 
                });
              } else {
                document.getElementById('features')?.scrollIntoView({ 
                  behavior: 'smooth' 
                });
              }
            }}
            className="bg-white text-blue-600 px-6 sm:px-8 md:px-10 py-3 sm:py-4 rounded-full font-semibold text-sm sm:text-base md:text-lg hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-lg"
          >
            Upload Your Report Now
          </button>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-4 sm:top-10 left-4 sm:left-10 w-16 h-16 sm:w-32 sm:h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-4 sm:bottom-10 right-4 sm:right-10 w-12 h-12 sm:w-24 sm:h-24 bg-white/10 rounded-full blur-xl"></div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center mb-4">
                {logoUrl ? (
                  <img src={logoUrl} alt={brandName} className="h-8 w-8 mr-3 rounded-lg" />
                ) : (
                  <div className="h-8 w-8 mr-3 rounded-lg bg-gray-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">{brandName.substring(0, 2).toUpperCase()}</span>
                  </div>
                )}
                <span className="text-lg font-medium text-white">{brandName}</span>
              </div>
              <p className="text-gray-300 text-sm">
                AI-powered health analysis for everyone.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-white mb-4">Contact</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <p>{contactInfo?.email || `info@${brandName.toLowerCase().replace(/\s+/g, '')}.com`}</p>
                <p>{contactInfo?.phone || '+1 (555) 123-4567'}</p>
                {/* Debug info - remove this later */}
                <p className="text-xs text-gray-500">Debug: contactInfo = {JSON.stringify(contactInfo)}</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} {brandName}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 