import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import BrandSettings from '@/models/BrandSettings';
import { SecureLink } from '@/models/SecureLink';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const brand = request.nextUrl.searchParams.get('brand');
    
    if (!brand) {
      return NextResponse.json({ error: 'Brand parameter is required' }, { status: 400 });
    }

    console.log('🔍 DEBUG: Looking for secure links for brand:', brand);

    // Find the brand settings
    const brandSettings = await BrandSettings.findOne({ 
      brandName: { $regex: new RegExp(brand, 'i') },
      isDeployed: true 
    });

    if (!brandSettings) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    // Find unused secure links for this partner
    const unusedSecureLinks = await SecureLink.find({ 
      partnerId: brandSettings.userId,
      isUsed: false,
      'metadata.sold': { $ne: true } // Only exclude already sold links
    });

    // Find all secure links for this partner
    const allSecureLinks = await SecureLink.find({ 
      partnerId: brandSettings.userId
    });

    // Find sold secure links for this partner
    const soldSecureLinks = await SecureLink.find({ 
      partnerId: brandSettings.userId,
      'metadata.sold': true
    });

    return NextResponse.json({
      success: true,
      brandName: brandSettings.brandName,
      partnerId: brandSettings.userId,
      secureLinks: {
        total: allSecureLinks.length,
        unused: unusedSecureLinks.length,
        sold: soldSecureLinks.length,
        used: allSecureLinks.length - unusedSecureLinks.length - soldSecureLinks.length
      },
      unusedLinks: unusedSecureLinks.map(link => ({
        id: link._id,
        linkId: link.linkId,
        isUsed: link.isUsed,
        sold: link.metadata?.sold || false
      }))
    });

  } catch (error) {
    console.error('❌ DEBUG: Error:', error);
    return NextResponse.json(
      { error: 'Failed to debug secure links', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 