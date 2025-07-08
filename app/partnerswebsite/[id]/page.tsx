'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface BrandSettings {
  brandName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  isDeployed: boolean;
  websiteUrl: string;
}

export default function PartnerWebsitePage() {
  const params = useParams();
  const id = params.id as string;
  
  const [brandSettings, setBrandSettings] = useState<BrandSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrandSettings = async () => {
      try {
        console.log('🔍 PARTNER WEBSITE: Fetching brand settings for ID:', id);
        
        // Try to fetch brand settings by brand name (URL slug)
        const response = await fetch(`/api/brand-settings/public?brandId=${encodeURIComponent(id)}`);
        
        if (!response.ok) {
          throw new Error('Brand not found or not deployed');
        }

        const data = await response.json();
        
        if (data.success) {
          console.log('✅ PARTNER WEBSITE: Brand settings received:', data.brandSettings);
          setBrandSettings(data.brandSettings);
        } else {
          throw new Error(data.message || 'Failed to load brand settings');
        }
        
      } catch (error) {
        console.error('❌ PARTNER WEBSITE: Error fetching brand settings:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBrandSettings();
    }
  }, [id]);

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

  return <PartnerWebsite brandSettings={brandSettings} />;
}

// Partner Website Component
function PartnerWebsite({ brandSettings }: { brandSettings: BrandSettings }) {
  const { brandName, logoUrl, primaryColor, secondaryColor } = brandSettings;

  useEffect(() => {
    // Set CSS custom properties for brand colors
    document.documentElement.style.setProperty('--brand-primary', primaryColor);
    document.documentElement.style.setProperty('--brand-secondary', secondaryColor);
    
    // Set page title
    document.title = `${brandName} - AI Health Check`;
  }, [brandName, primaryColor, secondaryColor]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Inline styles for brand colors */}
      <style jsx>{`
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
      `}</style>

      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              {logoUrl ? (
                <img src={logoUrl} alt={brandName} className="h-8 w-8 mr-3 rounded" />
              ) : (
                <div className="h-8 w-8 mr-3 rounded text-brand-primary font-bold text-sm flex items-center justify-center border border-brand-primary">
                  {brandName.substring(0, 2).toUpperCase()}
                </div>
              )}
              <span className="text-xl font-bold text-gray-900">{brandName}</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-brand-primary transition-colors">Features</a>
              <a href="#about" className="text-gray-600 hover:text-brand-primary transition-colors">About</a>
              <a href="#contact" className="text-gray-600 hover:text-brand-primary transition-colors">Contact</a>
              <button className="bg-brand-primary text-white px-4 py-2 rounded-md transition-all duration-200 hover:opacity-90">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="gradient-brand">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                AI-Powered Health Analysis
              </h1>
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                Get instant, comprehensive health insights from your medical reports using advanced AI technology with {brandName}.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-brand-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Upload Report
                </button>
                <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-brand-primary transition-colors">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose {brandName}?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of health analysis with our cutting-edge AI technology.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:border-brand-primary transition-colors">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <svg className="w-8 h-8 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Analysis</h3>
              <p className="text-gray-600">Get comprehensive health insights in seconds, not days.</p>
            </div>
            
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:border-brand-primary transition-colors">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${secondaryColor}20` }}
              >
                <svg className="w-8 h-8 text-brand-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Accurate Results</h3>
              <p className="text-gray-600">AI-powered analysis with medical-grade accuracy.</p>
            </div>
            
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:border-brand-primary transition-colors">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <svg className="w-8 h-8 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Private</h3>
              <p className="text-gray-600">Your health data is encrypted and completely secure.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                About {brandName}
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                We're revolutionizing healthcare through AI-powered analysis. Our advanced technology helps individuals 
                understand their health better by providing instant, accurate insights from medical reports.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                With {brandName}, you can take control of your health journey with confidence and clarity.
              </p>
              <button className="bg-brand-primary text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity">
                Start Your Analysis
              </button>
            </div>
            <div className="bg-white/50 backdrop-blur-sm p-8 rounded-lg border">
              <div className="text-center">
                <div className="text-4xl font-bold text-brand-primary mb-2">10,000+</div>
                <div className="text-gray-600 mb-6">Reports Analyzed</div>
                
                <div className="text-4xl font-bold text-brand-secondary mb-2">99.9%</div>
                <div className="text-gray-600 mb-6">Accuracy Rate</div>
                
                <div className="text-4xl font-bold text-brand-primary mb-2">24/7</div>
                <div className="text-gray-600">Available</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-brand-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust {brandName} for their health analysis needs.
          </p>
          <button className="bg-white text-brand-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Upload Your Report Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                {logoUrl ? (
                  <img src={logoUrl} alt={brandName} className="h-8 w-8 mr-3 rounded" />
                ) : (
                  <div className="h-8 w-8 mr-3 rounded text-brand-primary font-bold text-sm flex items-center justify-center border border-brand-primary">
                    {brandName.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <span className="text-xl font-bold">{brandName}</span>
              </div>
              <p className="text-gray-400">
                AI-powered health analysis for everyone.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">AI Analysis</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Secure Upload</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Instant Results</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-gray-400">
                <p>Email: info@{brandName.toLowerCase().replace(/\s+/g, '')}.com</p>
                <p>Phone: +1 (555) 123-4567</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 {brandName}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 