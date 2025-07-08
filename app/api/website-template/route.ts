import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import BrandSettings from '@/models/BrandSettings';

// GET - Generate website template HTML based on brand settings
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const brandName = searchParams.get('brand');
    
    if (!brandName) {
      return NextResponse.json({ message: 'Brand name is required' }, { status: 400 });
    }

    console.log('🔍 WEBSITE TEMPLATE: Generating template for brand:', brandName);

    await dbConnect();

    // Find brand settings by brand name
    const brandSettings = await BrandSettings.findOne({ 
      brandName: { $regex: new RegExp(brandName, 'i') } 
    });

    if (!brandSettings) {
      return NextResponse.json({ message: 'Brand not found' }, { status: 404 });
    }

    console.log('✅ WEBSITE TEMPLATE: Brand settings found');

    // Generate HTML template
    const htmlTemplate = generateWebsiteHTML(brandSettings);

    return new NextResponse(htmlTemplate, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error('❌ WEBSITE TEMPLATE: Error:', error);
    return NextResponse.json(
      { message: 'Failed to generate website template' }, 
      { status: 500 }
    );
  }
}

// Generate HTML template based on brand settings
function generateWebsiteHTML(brandSettings: any): string {
  const {
    brandName,
    logoUrl,
    primaryColor,
    secondaryColor,
    websiteUrl
  } = brandSettings;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${brandName} - AI Health Check</title>
    <meta name="description" content="Get instant AI-powered health analysis with ${brandName}. Upload your medical reports and receive comprehensive health insights.">
    <meta name="keywords" content="AI health, medical analysis, health check, ${brandName}">
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Custom CSS -->
    <style>
        :root {
            --primary-color: ${primaryColor};
            --secondary-color: ${secondaryColor};
        }
        
        .bg-primary { background-color: var(--primary-color) !important; }
        .text-primary { color: var(--primary-color) !important; }
        .border-primary { border-color: var(--primary-color) !important; }
        .bg-secondary { background-color: var(--secondary-color) !important; }
        .text-secondary { color: var(--secondary-color) !important; }
        
        .btn-primary {
            background-color: var(--primary-color);
            border-color: var(--primary-color);
            color: white;
        }
        
        .btn-primary:hover {
            background-color: var(--primary-color);
            opacity: 0.9;
        }
        
        .btn-secondary {
            background-color: var(--secondary-color);
            border-color: var(--secondary-color);
            color: white;
        }
        
        .btn-secondary:hover {
            background-color: var(--secondary-color);
            opacity: 0.9;
        }
        
        .gradient-bg {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        }
        
        .glass-card {
            backdrop-filter: blur(10px);
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
    </style>
</head>
<body class="bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <div class="flex items-center">
                    ${logoUrl ? `
                        <img src="${logoUrl}" alt="${brandName}" class="h-8 w-8 mr-3 rounded">
                    ` : `
                        <div class="h-8 w-8 mr-3 rounded text-primary font-bold text-sm flex items-center justify-center border border-primary">
                            ${brandName.substring(0, 2).toUpperCase()}
                        </div>
                    `}
                    <span class="text-xl font-bold text-gray-900">${brandName}</span>
                </div>
                <div class="hidden md:flex items-center space-x-8">
                    <a href="#features" class="text-gray-600 hover:text-primary transition-colors">Features</a>
                    <a href="#about" class="text-gray-600 hover:text-primary transition-colors">About</a>
                    <a href="#contact" class="text-gray-600 hover:text-primary transition-colors">Contact</a>
                    <button class="btn-primary px-4 py-2 rounded-md transition-all duration-200 hover:scale-105">
                        Get Started
                    </button>
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="relative overflow-hidden">
        <div class="gradient-bg">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div class="text-center">
                    <h1 class="text-4xl md:text-6xl font-bold text-white mb-6">
                        AI-Powered Health Analysis
                    </h1>
                    <p class="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                        Get instant, comprehensive health insights from your medical reports using advanced AI technology.
                    </p>
                    <div class="flex flex-col sm:flex-row gap-4 justify-center">
                        <button class="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                            Upload Report
                        </button>
                        <button class="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors">
                            Learn More
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-20 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-16">
                <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    Why Choose ${brandName}?
                </h2>
                <p class="text-xl text-gray-600 max-w-2xl mx-auto">
                    Experience the future of health analysis with our cutting-edge AI technology.
                </p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="text-center p-6 rounded-lg border border-gray-200 hover:border-primary transition-colors">
                    <div class="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">Instant Analysis</h3>
                    <p class="text-gray-600">Get comprehensive health insights in seconds, not days.</p>
                </div>
                
                <div class="text-center p-6 rounded-lg border border-gray-200 hover:border-primary transition-colors">
                    <div class="bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">Accurate Results</h3>
                    <p class="text-gray-600">AI-powered analysis with medical-grade accuracy.</p>
                </div>
                
                <div class="text-center p-6 rounded-lg border border-gray-200 hover:border-primary transition-colors">
                    <div class="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">Secure & Private</h3>
                    <p class="text-gray-600">Your health data is encrypted and completely secure.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- About Section -->
    <section id="about" class="py-20 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                    <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                        About ${brandName}
                    </h2>
                    <p class="text-lg text-gray-600 mb-6">
                        We're revolutionizing healthcare through AI-powered analysis. Our advanced technology helps individuals 
                        understand their health better by providing instant, accurate insights from medical reports.
                    </p>
                    <p class="text-lg text-gray-600 mb-8">
                        With ${brandName}, you can take control of your health journey with confidence and clarity.
                    </p>
                    <button class="btn-primary px-8 py-3 rounded-lg font-semibold hover:scale-105 transition-transform">
                        Start Your Analysis
                    </button>
                </div>
                <div class="glass-card p-8 rounded-lg">
                    <div class="text-center">
                        <div class="text-4xl font-bold text-primary mb-2">10,000+</div>
                        <div class="text-gray-600 mb-6">Reports Analyzed</div>
                        
                        <div class="text-4xl font-bold text-secondary mb-2">99.9%</div>
                        <div class="text-gray-600 mb-6">Accuracy Rate</div>
                        
                        <div class="text-4xl font-bold text-primary mb-2">24/7</div>
                        <div class="text-gray-600">Available</div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 bg-primary">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 class="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Get Started?
            </h2>
            <p class="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                Join thousands of users who trust ${brandName} for their health analysis needs.
            </p>
            <button class="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Upload Your Report Now
            </button>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <div class="flex items-center mb-4">
                        ${logoUrl ? `
                            <img src="${logoUrl}" alt="${brandName}" class="h-8 w-8 mr-3 rounded">
                        ` : `
                            <div class="h-8 w-8 mr-3 rounded text-primary font-bold text-sm flex items-center justify-center border border-primary">
                                ${brandName.substring(0, 2).toUpperCase()}
                            </div>
                        `}
                        <span class="text-xl font-bold">${brandName}</span>
                    </div>
                    <p class="text-gray-400">
                        AI-powered health analysis for everyone.
                    </p>
                </div>
                
                <div>
                    <h4 class="font-semibold mb-4">Features</h4>
                    <ul class="space-y-2 text-gray-400">
                        <li><a href="#" class="hover:text-white transition-colors">AI Analysis</a></li>
                        <li><a href="#" class="hover:text-white transition-colors">Secure Upload</a></li>
                        <li><a href="#" class="hover:text-white transition-colors">Instant Results</a></li>
                    </ul>
                </div>
                
                <div>
                    <h4 class="font-semibold mb-4">Support</h4>
                    <ul class="space-y-2 text-gray-400">
                        <li><a href="#" class="hover:text-white transition-colors">Help Center</a></li>
                        <li><a href="#" class="hover:text-white transition-colors">Contact Us</a></li>
                        <li><a href="#" class="hover:text-white transition-colors">Privacy Policy</a></li>
                    </ul>
                </div>
                
                <div>
                    <h4 class="font-semibold mb-4">Contact</h4>
                    <div class="space-y-2 text-gray-400">
                        <p>Email: info@${brandName.toLowerCase().replace(/\s+/g, '')}.com</p>
                        <p>Phone: +1 (555) 123-4567</p>
                    </div>
                </div>
            </div>
            
            <div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                <p>&copy; 2024 ${brandName}. All rights reserved.</p>
            </div>
        </div>
    </footer>
</body>
</html>
  `.trim();
} 