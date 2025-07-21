import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { SecureLink } from '@/models/SecureLink';
import BrandSettings from '@/models/BrandSettings';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { brandName, count = 100 } = body;
    
    if (!brandName) {
      return NextResponse.json({ error: 'Brand name is required' }, { status: 400 });
    }
    
    console.log('🔍 SECURE LINKS: Creating secure links for brand:', brandName, 'count:', count);
    
    // Find the brand settings to get the partner ID
    const brandSettings = await BrandSettings.findOne({ 
      brandName: { $regex: new RegExp(brandName, 'i') }
    });
    
    if (!brandSettings) {
      console.log('❌ SECURE LINKS: Brand not found:', brandName);
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }
    
    const partnerId = brandSettings.userId;
    console.log('✅ SECURE LINKS: Found partner ID:', partnerId);
    
    // Check existing secure links
    const existingCount = await SecureLink.countDocuments({ partnerId });
    console.log('🔍 SECURE LINKS: Existing secure links:', existingCount);
    
    // Create new secure links
    const secureLinks = [];
    const now = new Date();
    
    for (let i = 0; i < count; i++) {
      const secureLink = {
        linkId: `LINK-${Date.now()}-${i}`,
        partnerId,
        chatId: `CHAT-${Date.now()}-${i}`,
        isUsed: false,
        expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 24 hour expiry
        createdAt: now,
        metadata: {
          brandName,
          createdFor: 'sale',
          available: true
        }
      };
      
      secureLinks.push(secureLink);
    }
    
    await SecureLink.insertMany(secureLinks);
    
    console.log('✅ SECURE LINKS: Created', secureLinks.length, 'secure links for partner:', partnerId);
    
    return NextResponse.json({
      success: true,
      message: `Created ${secureLinks.length} secure links for ${brandName}`,
      data: {
        brandName,
        partnerId,
        secureLinksCreated: secureLinks.length,
        totalSecureLinks: existingCount + secureLinks.length
      }
    });
    
  } catch (error) {
    console.error('❌ SECURE LINKS: Error creating secure links:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create secure links' 
    }, { status: 500 });
  }
} 