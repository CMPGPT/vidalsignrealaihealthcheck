'use client';

import { useEffect } from 'react';

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

export default function ModernLayout({ brandSettings, onPaymentClick }: { brandSettings: BrandSettings; onPaymentClick: (plan: any) => void }) {
  const { brandName, logoUrl, customColors, heroSection, featuresSection, pricingSection } = brandSettings;
  const primaryColor = customColors.primary;
  const secondaryColor = customColors.secondary;
  const accentColor = customColors.accent;

  useEffect(() => {
    document.documentElement.style.setProperty('--brand-primary', primaryColor);
    document.documentElement.style.setProperty('--brand-secondary', secondaryColor);
    document.documentElement.style.setProperty('--brand-accent', accentColor);
    document.title = `${brandName} - AI Health Check`;
  }, [brandName, primaryColor, secondaryColor, accentColor]);

  return (
    <div className="min-h-screen bg-white">
      <style jsx>{`
        .bg-brand-primary { background-color: ${primaryColor}; }
        .text-brand-primary { color: ${primaryColor}; }
        .border-brand-primary { border-color: ${primaryColor}; }
        .bg-brand-secondary { background-color: ${secondaryColor}; }
        .text-brand-secondary { color: ${secondaryColor}; }
        .hover\\:bg-brand-primary:hover { background-color: ${primaryColor}; }
        .hover\\:text-brand-primary:hover { color: ${primaryColor}; }
        .bg-brand-primary-subtle { background-color: ${primaryColor}10; }
        .bg-brand-secondary-subtle { background-color: ${secondaryColor}10; }
        .bg-brand-accent-subtle { background-color: ${accentColor}10; }
        .border-brand-primary-subtle { border-color: ${primaryColor}40; }
        .modern-gradient-subtle {
          background: linear-gradient(135deg, ${primaryColor}05, ${secondaryColor}05, ${accentColor}05);
        }
        .modern-gradient-text {
          background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Minimal Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              {logoUrl ? (
                <img src={logoUrl} alt={brandName} className="h-12 w-12 rounded-lg object-cover" />
              ) : (
                <div className="h-12 w-12 rounded-lg text-brand-primary font-bold text-lg flex items-center justify-center bg-gray-50 border border-gray-200">
                  {brandName.substring(0, 2).toUpperCase()}
                </div>
              )}
              <span className="text-2xl font-light text-gray-900">{brandName}</span>
            </div>
            <div className="hidden md:flex items-center space-x-12">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors font-light">Features</a>
              {pricingSection.enabled && (
                <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors font-light">Pricing</a>
              )}
              <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors font-light">About</a>
                          <button 
              onClick={() => {
                if (pricingSection.enabled) {
                  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="bg-brand-primary text-white px-8 py-3 rounded-lg font-light hover:bg-brand-secondary transition-colors"
            >
              Get Started
            </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Minimalist Hero Section */}
      <section className="py-32 px-6 lg:px-8 modern-gradient-subtle">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl md:text-8xl font-extralight mb-8 leading-tight">
            <span className="modern-gradient-text">{heroSection.headline.split(' ').slice(0, 2).join(' ')}</span>
            <br />
            <span className="text-gray-900">{heroSection.headline.split(' ').slice(2).join(' ')}</span>
          </h1>
          <p className="text-xl font-light text-gray-600 mb-16 max-w-2xl mx-auto leading-relaxed">
            {heroSection.subheadline}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button 
              onClick={() => {
                if (pricingSection.enabled) {
                  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="bg-brand-primary text-white px-12 py-4 text-lg font-light hover:bg-brand-secondary transition-colors"
            >
              {heroSection.ctaText}
            </button>
            <button 
              onClick={() => {
                document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="border border-brand-primary text-brand-primary px-12 py-4 text-lg font-light hover:bg-brand-primary hover:text-white transition-colors"
            >
              {heroSection.secondaryCtaText}
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section - Minimal */}
      {heroSection.stats && heroSection.stats.length > 0 && (
        <section className="py-20 border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {heroSection.stats.map((stat, index) => (
                <div key={index} className="text-center p-8 bg-brand-primary-subtle rounded-xl hover:bg-brand-secondary-subtle transition-colors">
                  <div className="text-4xl md:text-5xl font-extralight modern-gradient-text mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 font-light uppercase tracking-wide text-sm">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section - Clean Grid */}
      <section id="features" className="py-32 px-6 lg:px-8 bg-brand-secondary-subtle">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-extralight mb-6">
              <span className="modern-gradient-text">{featuresSection.title}</span>
            </h2>
            <p className="text-xl font-light text-gray-600 max-w-2xl mx-auto">
              {featuresSection.subtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
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
                <div key={index} className="text-center p-8 bg-white rounded-xl hover:bg-brand-primary-subtle transition-colors">
                  <div className="w-16 h-16 mx-auto mb-8 bg-brand-accent-subtle rounded-lg flex items-center justify-center border-2 border-brand-primary-subtle">
                    <svg className="w-8 h-8 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {getIconSvg(feature.icon)}
                    </svg>
                  </div>
                  <h3 className="text-2xl font-light modern-gradient-text mb-4">{feature.title}</h3>
                  <p className="text-gray-600 font-light leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section - Minimal Cards */}
      {pricingSection.enabled && (
        <section id="pricing" className="py-32 modern-gradient-subtle px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-5xl font-extralight mb-6">
                <span className="modern-gradient-text">{pricingSection.title}</span>
              </h2>
              <p className="text-xl font-light text-gray-600 max-w-2xl mx-auto">
                {pricingSection.subtitle}
              </p>
            </div>
            
            <div className={`grid gap-8 ${pricingSection.plans.length === 1 ? 'max-w-md mx-auto' : 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto'}`}>
              {pricingSection.plans.map((plan, index) => (
                <div 
                  key={index} 
                  className={`bg-white p-12 ${
                    plan.popular 
                      ? 'border-2 border-brand-primary' 
                      : 'border border-gray-200'
                  } transition-all duration-200`}
                >
                  {plan.popular && (
                    <div className="text-center mb-8">
                      <div className="bg-brand-accent text-white px-6 py-2 text-sm font-light uppercase tracking-wide">
                        Most Popular
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center mb-12">
                    <h3 className="text-2xl font-light text-gray-900 mb-4">{plan.name}</h3>
                    <p className="text-gray-600 font-light mb-8">{plan.description}</p>
                    
                    <div className="mb-8">
                      <div className="flex items-baseline justify-center mb-2">
                        <span className="text-6xl font-extralight text-gray-900">{plan.price}</span>
                        <span className="text-gray-600 ml-2 font-light">for {plan.quantity}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => onPaymentClick(plan)}
                      className={`w-full py-4 px-8 font-light transition-all duration-200 ${
                        plan.popular
                          ? 'bg-brand-primary text-white hover:bg-brand-secondary'
                          : 'border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white'
                      }`}
                    >
                      {plan.buttonText}
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <ul className="space-y-4">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <svg 
                            className="h-5 w-5 text-gray-600 mr-4 mt-1 flex-shrink-0" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth="1.5" 
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span className="text-gray-700 font-light">{feature}</span>
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

      {/* About Section - Simple */}
      <section id="about" className="py-32 px-6 lg:px-8 bg-brand-accent-subtle">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-extralight mb-8">
            About <span className="modern-gradient-text">{brandName}</span>
          </h2>
          <p className="text-xl font-light text-gray-600 leading-relaxed mb-8 bg-white/50 p-8 rounded-xl backdrop-blur-sm">
            We're revolutionizing healthcare through AI-powered analysis. Our advanced technology helps individuals 
            understand their health better by providing instant, accurate insights from medical reports.
          </p>
          <p className="text-xl font-light text-gray-600 leading-relaxed mb-12 bg-white/50 p-8 rounded-xl backdrop-blur-sm">
            With <span className="text-brand-primary font-medium">{brandName}</span>, you can take control of your health journey with confidence and clarity.
          </p>
          <button 
            onClick={() => {
              if (pricingSection.enabled) {
                document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
              } else {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="bg-brand-primary text-white px-12 py-4 text-lg font-light hover:bg-brand-secondary transition-colors"
          >
            Start Your Analysis
          </button>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="bg-brand-primary-subtle border-t border-brand-primary/10 py-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                {logoUrl ? (
                  <img src={logoUrl} alt={brandName} className="h-8 w-8 mr-3 rounded-lg" />
                ) : (
                  <div className="h-8 w-8 mr-3 rounded-lg text-brand-primary font-bold text-sm flex items-center justify-center bg-white border border-brand-primary-subtle">
                    {brandName.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <span className="text-xl font-light modern-gradient-text">{brandName}</span>
              </div>
              <p className="text-gray-600 font-light bg-white/50 p-4 rounded-lg backdrop-blur-sm">
                AI-powered health analysis for everyone.
              </p>
            </div>
            
            <div className="bg-white/50 p-6 rounded-lg backdrop-blur-sm">
              <h4 className="font-light modern-gradient-text mb-6">Contact</h4>
              <div className="space-y-3 text-gray-600 font-light">
                <p>info@{brandName.toLowerCase().replace(/\s+/g, '')}.com</p>
                <p>+1 (555) 123-4567</p>
              </div>
            </div>
            
            <div className="bg-white/50 p-6 rounded-lg backdrop-blur-sm">
              <h4 className="font-light modern-gradient-text mb-6">Legal</h4>
              <ul className="space-y-3 text-gray-600 font-light">
                <li><a href="#" className="hover:text-brand-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-brand-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-brand-primary/10 mt-16 pt-8 text-center text-gray-600 font-light bg-white/30 rounded-lg backdrop-blur-sm">
            <p>&copy; 2024 <span className="text-brand-primary">{brandName}</span>. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 