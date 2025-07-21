import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import BrandSettings from '@/models/BrandSettings';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Get all brand settings
    const brands = await BrandSettings.find({}, { 
      brandName: 1, 
      userId: 1, 
      isDeployed: 1,
      websiteUrl: 1 
    });
    
    return NextResponse.json({
      success: true,
      data: {
        brands: brands.map(brand => ({
          brandName: brand.brandName,
          userId: brand.userId,
          isDeployed: brand.isDeployed,
          websiteUrl: brand.websiteUrl
        })),
        totalBrands: brands.length
      }
    });
    
  } catch (error) {
    console.error('❌ DEBUG BRANDS: Error fetching brands:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch brands' 
    }, { status: 500 });
  }
} 