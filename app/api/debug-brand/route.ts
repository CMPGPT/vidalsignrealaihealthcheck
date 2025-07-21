import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import BrandSettings from '@/models/BrandSettings';
import PartnerUser from '@/models/PartnerUser';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const brand = request.nextUrl.searchParams.get('brand');
    
    if (!brand) {
      return NextResponse.json({ error: 'Brand parameter is required' }, { status: 400 });
    }

    console.log('🔍 DEBUG: Looking for brand:', brand);

    // Find the brand settings
    const brandSettings = await BrandSettings.findOne({ 
      brandName: { $regex: new RegExp(brand, 'i') },
      isDeployed: true 
    });

    if (!brandSettings) {
      console.log('❌ DEBUG: Brand not found:', brand);
      
      // Let's see what brands exist
      const allBrands = await BrandSettings.find({});
      console.log('🔍 DEBUG: All brands in database:', allBrands.map(b => b.brandName));
      
      return NextResponse.json({ 
        error: 'Brand not found',
        searchedFor: brand,
        allBrands: allBrands.map(b => b.brandName)
      }, { status: 404 });
    }

    // Find the partner user
    const partnerUser = await PartnerUser.findById(brandSettings.userId);
    
    return NextResponse.json({
      success: true,
      brandFound: true,
      brandSettings: {
        brandName: brandSettings.brandName,
        userId: brandSettings.userId,
        isDeployed: brandSettings.isDeployed,
        websiteUrl: brandSettings.websiteUrl
      },
      partnerUser: partnerUser ? {
        id: partnerUser._id,
        firstName: partnerUser.first_Name,
        lastName: partnerUser.last_Name,
        email: partnerUser.email
      } : null
    });

  } catch (error) {
    console.error('❌ DEBUG: Error:', error);
    return NextResponse.json(
      { error: 'Failed to debug brand', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 