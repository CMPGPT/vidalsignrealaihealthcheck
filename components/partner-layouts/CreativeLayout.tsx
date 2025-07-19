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

export default function CreativeLayout({ brandSettings, onPaymentClick }: { brandSettings: BrandSettings; onPaymentClick: (plan: any) => void }) {
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
    <div className="min-h-screen bg-gray-900 text-white overflow-x-hidden">
      <style jsx>{`
        .bg-brand-primary { background-color: ${primaryColor}; }
        .text-brand-primary { color: ${primaryColor}; }
        .border-brand-primary { border-color: ${primaryColor}; }
        .bg-brand-secondary { background-color: ${secondaryColor}; }
        .text-brand-secondary { color: ${secondaryColor}; }
        .bg-brand-accent { background-color: ${accentColor}; }
        .text-brand-accent { color: ${accentColor}; }
        .hover\\:bg-brand-primary:hover { background-color: ${primaryColor}; }
        .creative-gradient { 
          background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor}, ${accentColor}); 
        }
        .creative-gradient-reverse { 
          background: linear-gradient(315deg, ${accentColor}, ${secondaryColor}, ${primaryColor}); 
        }
        .text-gradient {
          background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Creative Floating Navigation */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-black/20 backdrop-blur-xl rounded-full px-8 py-4 border border-white/10">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-3">
            {logoUrl ? (
              <img src={logoUrl} alt={brandName} className="h-10 w-10 rounded-full object-cover border-2 border-white/20" />
            ) : (
              <div className="h-10 w-10 rounded-full creative-gradient flex items-center justify-center font-bold text-sm">
                {brandName.substring(0, 2).toUpperCase()}
              </div>
            )}
            <span className="text-lg font-bold">{brandName}</span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-white/80 hover:text-white transition-colors text-sm">Features</a>
            {pricingSection.enabled && (
              <a href="#pricing" className="text-white/80 hover:text-white transition-colors text-sm">Pricing</a>
            )}
            <a href="#about" className="text-white/80 hover:text-white transition-colors text-sm">About</a>
            <button 
              onClick={() => {
                if (pricingSection.enabled) {
                  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="creative-gradient px-6 py-2 rounded-full text-white font-semibold hover:opacity-90 transition-opacity text-sm"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Creative Asymmetric Layout */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-96 h-96 creative-gradient rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 creative-gradient-reverse rounded-full blur-3xl opacity-15"></div>
          <div className="absolute top-1/2 left-1/3 w-60 h-60 bg-brand-accent rounded-full blur-2xl opacity-10"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-6xl md:text-7xl font-black leading-tight">
                  <span className="text-gradient">{heroSection.headline.split(' ').slice(0, 3).join(' ')}</span>
                  <br />
                  <span className="text-white">{heroSection.headline.split(' ').slice(3).join(' ')}</span>
                </h1>
                <p className="text-xl text-white/80 leading-relaxed max-w-xl">
                  {heroSection.subheadline}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => {
                    if (pricingSection.enabled) {
                      document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="creative-gradient px-8 py-4 rounded-xl text-white font-bold text-lg hover:scale-105 transition-transform"
                >
                  {heroSection.ctaText}
                </button>
                <button 
                  onClick={() => {
                    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-colors backdrop-blur-sm"
                >
                  {heroSection.secondaryCtaText}
                </button>
              </div>
            </div>
            
            {/* Right Column - Creative Visual */}
            <div className="relative">
              <div className="relative">
                {/* Floating Cards */}
                <div className="absolute top-0 right-0 bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 transform rotate-3 hover:rotate-0 transition-transform">
                  <div className="text-3xl font-bold text-gradient">AI-Powered</div>
                  <div className="text-white/80">Analysis</div>
                </div>
                <div className="absolute bottom-0 left-0 bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 transform -rotate-3 hover:rotate-0 transition-transform">
                  <div className="text-3xl font-bold text-gradient">Instant</div>
                  <div className="text-white/80">Results</div>
                </div>
                <div className="creative-gradient rounded-3xl p-8 text-center mx-8 my-16">
                  <div className="text-4xl font-black mb-2">⚡</div>
                  <div className="text-2xl font-bold">Revolutionary</div>
                  <div className="text-lg">Health Tech</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Creative Floating */}
      {heroSection.stats && heroSection.stats.length > 0 && (
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {heroSection.stats.map((stat, index) => (
                <div key={index} className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center hover:scale-105 transition-transform">
                  <div className="text-4xl md:text-5xl font-black text-gradient mb-2">
                    {stat.value}
                  </div>
                  <div className="text-white/80 font-medium uppercase tracking-wide text-sm">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section - Creative Asymmetric Grid */}
      <section id="features" className="py-32 relative">
        <div className="absolute top-0 left-0 w-full h-px creative-gradient"></div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              <span className="text-gradient">{featuresSection.title}</span>
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              {featuresSection.subtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuresSection.features.map((feature, index) => {
              const getIconSvg = (iconName: string) => {
                switch (iconName) {
                  case 'upload':
                    return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>;
                  case 'brain':
                    return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>;
                  case 'shield':
                    return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>;
                  default:
                    return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>;
                }
              };
              
              return (
                <div 
                  key={index} 
                  className={`bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-105 ${
                    index % 2 === 0 ? 'transform hover:rotate-1' : 'transform hover:-rotate-1'
                  }`}
                >
                  <div className="creative-gradient w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {getIconSvg(feature.icon)}
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-white/80 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section - Creative Cards */}
      {pricingSection.enabled && (
        <section id="pricing" className="py-32 relative">
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/4 w-96 h-96 creative-gradient-reverse rounded-full blur-3xl opacity-10"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-6xl font-black mb-6">
                <span className="text-gradient">{pricingSection.title}</span>
              </h2>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                {pricingSection.subtitle}
              </p>
            </div>
            
            <div className={`grid gap-8 ${pricingSection.plans.length === 1 ? 'max-w-md mx-auto' : 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto'}`}>
              {pricingSection.plans.map((plan, index) => (
                <div 
                  key={index} 
                  className={`relative bg-black/40 backdrop-blur-xl rounded-3xl p-8 border transition-all duration-300 hover:scale-105 ${
                    plan.popular 
                      ? 'border-white/50 shadow-2xl transform rotate-1' 
                      : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="creative-gradient text-white px-6 py-2 rounded-full text-sm font-bold">
                        🔥 MOST POPULAR
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center mb-8">
                    <h3 className="text-3xl font-black text-white mb-4">{plan.name}</h3>
                    <p className="text-white/80 mb-6">{plan.description}</p>
                    
                    <div className="mb-8">
                      <div className="flex items-baseline justify-center mb-2">
                        <span className="text-6xl font-black text-gradient">{plan.price}</span>
                        <span className="text-white/80 ml-2">for {plan.quantity}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => onPaymentClick(plan)}
                      className={`w-full py-4 px-8 rounded-2xl font-bold transition-all duration-200 hover:scale-105 ${
                        plan.popular
                          ? 'creative-gradient text-white'
                          : 'border-2 border-white/30 text-white hover:bg-white/10'
                      }`}
                    >
                      {plan.buttonText}
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <div className="creative-gradient w-5 h-5 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-white/80">{feature}</span>
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

      {/* About Section - Creative Split */}
      <section id="about" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="creative-gradient absolute inset-0 rounded-3xl blur-xl opacity-20"></div>
              <div className="relative bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
                <h2 className="text-4xl md:text-5xl font-black mb-6">
                  About <span className="text-gradient">{brandName}</span>
                </h2>
                <p className="text-lg text-white/80 leading-relaxed mb-6">
                  We're revolutionizing healthcare through AI-powered analysis. Our advanced technology helps individuals 
                  understand their health better by providing instant, accurate insights from medical reports.
                </p>
                <p className="text-lg text-white/80 leading-relaxed mb-8">
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
                  className="creative-gradient px-8 py-4 rounded-2xl text-white font-bold hover:scale-105 transition-transform"
                >
                  Start Your Analysis
                </button>
              </div>
            </div>
            
            <div className="relative">
              {/* Creative Visual Elements */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 transform rotate-3 hover:rotate-0 transition-transform">
                    <div className="text-3xl font-black text-gradient">50K+</div>
                    <div className="text-white/80">Happy Users</div>
                  </div>
                  <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 transform -rotate-2 hover:rotate-0 transition-transform">
                    <div className="text-3xl font-black text-gradient">24/7</div>
                    <div className="text-white/80">Support</div>
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 transform -rotate-3 hover:rotate-0 transition-transform">
                    <div className="text-3xl font-black text-gradient">99.9%</div>
                    <div className="text-white/80">Accuracy</div>
                  </div>
                  <div className="creative-gradient rounded-2xl p-6 transform rotate-2 hover:rotate-0 transition-transform">
                    <div className="text-3xl font-black">HIPAA</div>
                    <div className="text-white/90">Compliant</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Creative Footer */}
      <footer className="relative bg-black/60 backdrop-blur-xl border-t border-white/10 py-20">
        <div className="absolute top-0 left-0 w-full h-px creative-gradient"></div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                {logoUrl ? (
                  <img src={logoUrl} alt={brandName} className="h-10 w-10 mr-4 rounded-full border border-white/20" />
                ) : (
                  <div className="h-10 w-10 mr-4 rounded-full creative-gradient flex items-center justify-center font-bold text-sm">
                    {brandName.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <span className="text-2xl font-bold text-gradient">{brandName}</span>
              </div>
              <p className="text-white/80 text-lg">
                AI-powered health analysis for everyone.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-6">Contact</h4>
              <div className="space-y-4 text-white/80">
                <p>info@{brandName.toLowerCase().replace(/\s+/g, '')}.com</p>
                <p>+1 (555) 123-4567</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-6">Legal</h4>
              <ul className="space-y-4 text-white/80">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-16 pt-8 text-center text-white/60">
            <p>&copy; 2024 {brandName}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 