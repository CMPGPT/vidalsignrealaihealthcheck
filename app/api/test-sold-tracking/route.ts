import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { SecureLink } from '@/models/SecureLink';
import BrandSettings from '@/models/BrandSettings';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const brandName = searchParams.get('brandName') || 'Vidal Shop';
    
    console.log('🔍 TEST SOLD TRACKING: Checking sold tracking for brand:', brandName);
    
    // Find the brand settings
    const brandSettings = await BrandSettings.findOne({ 
      brandName: { $regex: new RegExp(brandName, 'i') }
    });
    
    if (!brandSettings) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }
    
    const partnerId = brandSettings.userId;
    console.log('✅ TEST SOLD TRACKING: Found partner ID:', partnerId);
    
    // Get all secure links for this partner
    const allSecureLinks = await SecureLink.find({ partnerId });
    
    // Get sold secure links
    const soldSecureLinks = await SecureLink.find({ 
      partnerId,
      'metadata.sold': true 
    });
    
    // Get used secure links
    const usedSecureLinks = await SecureLink.find({ 
      partnerId,
      isUsed: true 
    });
    
    // Get unused secure links
    const unusedSecureLinks = await SecureLink.find({ 
      partnerId,
      isUsed: false,
      'metadata.sold': { $ne: true }
    });
    
    console.log('🔍 TEST SOLD TRACKING: Statistics:', {
      total: allSecureLinks.length,
      sold: soldSecureLinks.length,
      used: usedSecureLinks.length,
      unused: unusedSecureLinks.length
    });
    
    // Get some sample sold links with details
    const sampleSoldLinks = soldSecureLinks.slice(0, 5).map(link => ({
      linkId: link.linkId,
      isUsed: link.isUsed,
      sold: link.metadata?.sold,
      soldDate: link.metadata?.soldDate,
      customerEmail: link.metadata?.customerEmail,
      plan: link.metadata?.plan,
      purchaseDate: link.metadata?.purchaseDate
    }));
    
    return NextResponse.json({
      success: true,
      data: {
        brandName,
        partnerId,
        statistics: {
          total: allSecureLinks.length,
          sold: soldSecureLinks.length,
          used: usedSecureLinks.length,
          unused: unusedSecureLinks.length
        },
        sampleSoldLinks,
        allSecureLinks: allSecureLinks.map(link => ({
          linkId: link.linkId,
          isUsed: link.isUsed,
          sold: link.metadata?.sold,
          customerEmail: link.metadata?.customerEmail,
          plan: link.metadata?.plan
        }))
      }
    });
    
  } catch (error) {
    console.error('❌ TEST SOLD TRACKING: Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to test sold tracking' 
    }, { status: 500 });
  }
} 