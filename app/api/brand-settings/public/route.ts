import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import BrandSettings from '@/models/BrandSettings';

// GET - Get brand settings by brand ID/name (public endpoint for deployed websites)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const brandId = searchParams.get('brandId');
    
    if (!brandId) {
      return NextResponse.json({ message: 'Brand ID is required' }, { status: 400 });
    }

    console.log('🔍 PUBLIC BRAND SETTINGS: Fetching for brandId:', brandId);

    await dbConnect();

    // Find brand settings by brand name (case-insensitive)
    // The brandId in the URL is typically a URL-friendly version of the brand name
    let brandSettings = await BrandSettings.findOne({ 
      brandName: { $regex: new RegExp(brandId.replace(/-/g, ' '), 'i') },
      isDeployed: true // Only return deployed websites
    });

    // If not found, try exact match
    if (!brandSettings) {
      brandSettings = await BrandSettings.findOne({ 
        brandName: brandId,
        isDeployed: true
      });
    }

    // If still not found, try with URL decoding
    if (!brandSettings) {
      const decodedBrandId = decodeURIComponent(brandId);
      brandSettings = await BrandSettings.findOne({ 
        brandName: { $regex: new RegExp(decodedBrandId, 'i') },
        isDeployed: true
      });
    }

    if (!brandSettings) {
      console.log('❌ PUBLIC BRAND SETTINGS: Brand not found or not deployed:', brandId);
      return NextResponse.json({ 
        message: 'Brand not found or website not deployed' 
      }, { status: 404 });
    }

    console.log('✅ PUBLIC BRAND SETTINGS: Brand settings found:', brandSettings.brandName);

    // Return public brand settings (don't include sensitive data)
    return NextResponse.json({ 
      success: true,
      brandSettings: {
        brandName: brandSettings.brandName,
        logoUrl: brandSettings.logoUrl || '',
        selectedTheme: brandSettings.selectedTheme,
        websiteStyle: brandSettings.websiteStyle,
        customColors: brandSettings.customColors,
        heroSection: brandSettings.heroSection,
        featuresSection: brandSettings.featuresSection,
        pricingSection: brandSettings.pricingSection,
        isDeployed: brandSettings.isDeployed,
        websiteUrl: brandSettings.websiteUrl || ''
      }
    }, { status: 200 });

  } catch (error) {
    console.error('❌ PUBLIC BRAND SETTINGS: Error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch brand settings' }, 
      { status: 500 }
    );
  }
} 