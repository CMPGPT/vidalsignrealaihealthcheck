'use client';

import { useEffect, useState } from 'react';

interface BrandSettings {
  brandName: string;
  logoUrl: string;
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

export default function ModernLayout({ brandSettings, onPaymentClick, contactInfo }: { brandSettings: BrandSettings; onPaymentClick: (plan: any) => void; contactInfo?: ContactInfo }) {
  const { brandName, logoUrl, customColors, heroSection, featuresSection, pricingSection } = brandSettings;
  const primaryColor = customColors.primary;
  const secondaryColor = customColors.secondary;
  const accentColor = customColors.accent;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty('--brand-primary', primaryColor);
    document.documentElement.style.setProperty('--brand-secondary', secondaryColor);
    document.documentElement.style.setProperty('--brand-accent', accentColor);
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
    <div className="min-h-screen bg-white font-['Inter',sans-serif]">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        .text-brand-primary { color: ${primaryColor}; }
        .bg-brand-primary { background-color: ${primaryColor}; }
        .border-brand-primary { border-color: ${primaryColor}; }
        .text-brand-secondary { color: ${secondaryColor}; }
        .bg-brand-secondary { background-color: ${secondaryColor}; }
        .border-brand-secondary { border-color: ${secondaryColor}; }
        .text-brand-accent { color: ${accentColor}; }
        .bg-brand-accent { background-color: ${accentColor}; }
        .border-brand-accent { border-color: ${accentColor}; }
        
        .brand-gradient {
          background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
        }
        .brand-gradient-text {
          background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .brand-accent-bg {
          background: linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}15);
        }
        .minimal-shadow {
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .minimal-hover {
          transition: all 0.2s ease;
        }
        .minimal-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .brand-button {
          background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
          color: white;
        }
        .brand-button:hover {
          background: linear-gradient(135deg, ${secondaryColor}, ${primaryColor});
        }
      `}</style>

      {/* Modern Navigation with Brand Colors */}
      <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              {logoUrl ? (
                <img src={logoUrl} alt={brandName} className="h-8 w-8 rounded-lg" />
              ) : (
                <div className="h-8 w-8 rounded-lg brand-gradient flex items-center justify-center">
                  <span className="text-sm font-medium text-white">{brandName.substring(0, 2).toUpperCase()}</span>
                </div>
              )}
              <span className="text-lg font-medium brand-gradient-text">{brandName}</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-brand-primary transition-colors text-sm">Features</a>
              {pricingSection.enabled && (
                <a href="#pricing" className="text-gray-600 hover:text-brand-primary transition-colors text-sm">Pricing</a>
              )}
              <a href="#about" className="text-gray-600 hover:text-brand-primary transition-colors text-sm">About</a>
              <button 
                onClick={() => {
                  if (pricingSection.enabled) {
                    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="brand-button px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                onClick={handleMobileMenuToggle}
                className="text-gray-600 hover:text-brand-primary transition-colors p-1"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-100 py-4">
              <div className="space-y-3">
                <a 
                  href="#features" 
                  onClick={() => handleMobileNavClick('features')}
                  className="block text-gray-600 hover:text-brand-primary transition-colors text-sm py-2"
                >
                  Features
                </a>
                {pricingSection.enabled && (
                  <a 
                    href="#pricing" 
                    onClick={() => handleMobileNavClick('pricing')}
                    className="block text-gray-600 hover:text-brand-primary transition-colors text-sm py-2"
                  >
                    Pricing
                  </a>
                )}
                <a 
                  href="#about" 
                  onClick={() => handleMobileNavClick('about')}
                  className="block text-gray-600 hover:text-brand-primary transition-colors text-sm py-2"
                >
                  About
                </a>
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (pricingSection.enabled) {
                      document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="w-full brand-button px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Modern Hero Section with Brand Colors */}
      <section className="py-32 px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-light text-gray-900 mb-8 leading-tight">
            <span className="brand-gradient-text">{heroSection.headline}</span>
          </h1>
          
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            {heroSection.subheadline}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button 
              onClick={() => {
                if (pricingSection.enabled) {
                  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="brand-button px-8 py-3 rounded-lg font-medium transition-all duration-300"
            >
              {heroSection.ctaText}
            </button>
            <button 
              onClick={() => {
                document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:border-brand-primary hover:text-brand-primary transition-colors"
            >
              {heroSection.secondaryCtaText}
            </button>
          </div>
          
          {/* Stats with Brand Colors */}
          {heroSection.stats && heroSection.stats.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 border-t border-gray-100">
              {heroSection.stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-semibold brand-gradient-text mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modern Features Section with Brand Colors */}
      <section id="features" className="py-24 px-8 brand-accent-bg">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light brand-gradient-text mb-4">
              {featuresSection.title}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {featuresSection.subtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuresSection.features.map((feature, index) => {
              const getIconSvg = (iconName: string) => {
                switch (iconName) {
                  case 'upload':
                    return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>;
                  case 'brain':
                    return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>;
                  case 'shield':
                    return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>;
                  default:
                    return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>;
                }
              };
              
              return (
                <div key={index} className="bg-white p-8 rounded-lg minimal-shadow minimal-hover">
                  <div className="w-12 h-12 brand-gradient rounded-lg flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {getIconSvg(feature.icon)}
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Modern Pricing Section with Brand Colors */}
      {pricingSection.enabled && (
        <section id="pricing" className="py-24 px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-light brand-gradient-text mb-4">
                {pricingSection.title}
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {pricingSection.subtitle}
              </p>
            </div>
            
            <div className={`grid gap-6 ${pricingSection.plans.length === 1 ? 'max-w-md mx-auto' : 'grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto'}`}>
              {pricingSection.plans.map((plan, index) => (
                <div key={index} className={`bg-white p-8 rounded-lg minimal-shadow minimal-hover ${
                  plan.popular ? 'border-2 border-brand-primary' : 'border border-gray-200'
                }`}>
                  {plan.popular && (
                    <div className="text-center mb-6">
                      <span className="brand-gradient text-white px-3 py-1 rounded-full text-xs font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-medium text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 text-sm mb-6">{plan.description}</p>
                    
                    <div className="mb-6">
                      <div className="flex items-baseline justify-center mb-1">
                        <span className="text-4xl font-light brand-gradient-text">{plan.price}</span>
                        <span className="text-gray-500 ml-1 text-sm">for {plan.quantity}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => onPaymentClick(plan)}
                      className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-300 ${
                        plan.popular
                          ? 'brand-button'
                          : 'border border-gray-300 text-gray-700 hover:border-brand-primary hover:text-brand-primary'
                      }`}
                    >
                      {plan.buttonText}
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 text-sm">What's included:</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <svg className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                          </svg>
                          <span className="text-sm text-gray-600">{feature}</span>
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

      {/* Modern About Section with Brand Colors */}
      <section id="about" className="py-24 px-8 brand-accent-bg">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-light brand-gradient-text mb-8">
            About {brandName}
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            We're revolutionizing healthcare through AI-powered analysis. Our advanced technology helps individuals 
            understand their health better by providing instant, accurate insights from medical reports.
          </p>
          <p className="text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            With {brandName}, you can take control of your health journey with confidence and clarity.
          </p>
          <button 
            onClick={() => {
              if (pricingSection.enabled) {
                document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
              } else {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="brand-button px-8 py-3 rounded-lg font-medium transition-all duration-300"
          >
            Start Your Analysis
          </button>
        </div>
      </section>

      {/* Modern CTA Section with Brand Colors */}
      <section className="py-24 px-8 brand-gradient">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-light text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust {brandName} for their health analysis needs.
          </p>
          <button 
            onClick={() => {
              if (pricingSection.enabled) {
                document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
              } else {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="bg-white text-brand-primary px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Upload Your Report Now
          </button>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="bg-white border-t border-gray-100 py-16 px-8">
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
                <span className="text-lg font-medium brand-gradient-text">{brandName}</span>
              </div>
              <p className="text-gray-600 text-sm">
                AI-powered health analysis for everyone.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Contact</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>{contactInfo?.email || `info@${brandName.toLowerCase().replace(/\s+/g, '')}.com`}</p>
                <p>{contactInfo?.phone || '+1 (555) 123-4567'}</p>
              </div>
            </div>
          </div>
          
                              <div className="border-t border-gray-100 mt-8 pt-8 text-center text-sm text-gray-500">
                      <p>&copy; {new Date().getFullYear()} {brandName}. All rights reserved.</p>
                    </div>
        </div>
      </footer>
    </div>
  );
} 