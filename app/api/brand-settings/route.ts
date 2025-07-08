import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/dbConnect';
import BrandSettings from '@/models/BrandSettings';
import PartnerUser from '@/models/PartnerUser';
import { doubleEncrypt, doubleDecrypt } from '@/lib/encryption';

// GET - Get brand settings for the authenticated user
export async function GET(req: NextRequest) {
  try {
    console.log('🔍 GET BRAND SETTINGS: Starting fetch');
    
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.email) {
      console.log('❌ GET BRAND SETTINGS: No token or email found');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ GET BRAND SETTINGS: Token found for email:', token.email);

    await dbConnect();

    // Find the user first to get their ID
    let user = await PartnerUser.findOne({ email: token.email });
    
    if (!user) {
      console.log('🔍 GET BRAND SETTINGS: Direct lookup failed, trying encrypted email');
      try {
        const encryptedEmail = doubleEncrypt(token.email);
        user = await PartnerUser.findOne({ email: encryptedEmail });
      } catch (error) {
        console.log('🔍 GET BRAND SETTINGS: Encryption failed, trying to decrypt all emails');
        const allUsers = await PartnerUser.find();
        
        for (const potentialUser of allUsers) {
          try {
            const decryptedEmail = doubleDecrypt(potentialUser.email);
            if (decryptedEmail === token.email) {
              user = potentialUser;
              break;
            }
          } catch (e) {
            continue;
          }
        }
      }
    }

    if (!user) {
      console.log('❌ GET BRAND SETTINGS: User not found');
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    console.log('✅ GET BRAND SETTINGS: User found:', user._id);

    // Find brand settings for this user
    const brandSettings = await BrandSettings.findOne({ userId: String(user._id) });

    if (!brandSettings) {
      console.log('🔍 GET BRAND SETTINGS: No brand settings found, returning defaults');
      return NextResponse.json({ 
        success: true,
        brandSettings: {
          brandName: '',
          logoUrl: '',
          primaryColor: '#3B82F6',
          secondaryColor: '#10B981',
          isDeployed: false,
          websiteUrl: ''
        }
      }, { status: 200 });
    }

    console.log('✅ GET BRAND SETTINGS: Brand settings found');

    return NextResponse.json({ 
      success: true,
      brandSettings: {
        brandName: brandSettings.brandName,
        logoUrl: brandSettings.logoUrl || '',
        primaryColor: brandSettings.primaryColor,
        secondaryColor: brandSettings.secondaryColor,
        isDeployed: brandSettings.isDeployed,
        websiteUrl: brandSettings.websiteUrl || '',
        lastDeployedAt: brandSettings.lastDeployedAt
      }
    }, { status: 200 });

  } catch (error) {
    console.error('❌ GET BRAND SETTINGS: Error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch brand settings' }, 
      { status: 500 }
    );
  }
}

// POST - Create brand settings for the authenticated user
export async function POST(req: NextRequest) {
  try {
    console.log('🔍 CREATE BRAND SETTINGS: Starting creation');
    
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.email) {
      console.log('❌ CREATE BRAND SETTINGS: No token or email found');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ CREATE BRAND SETTINGS: Token found for email:', token.email);

    const body = await req.json();
    const { brandName, logoUrl, logoPublicId, primaryColor, secondaryColor } = body;

    if (!brandName) {
      return NextResponse.json({ message: 'Brand name is required' }, { status: 400 });
    }

    await dbConnect();

    // Find the user first to get their ID
    let user = await PartnerUser.findOne({ email: token.email });
    
    if (!user) {
      console.log('🔍 CREATE BRAND SETTINGS: Direct lookup failed, trying encrypted email');
      try {
        const encryptedEmail = doubleEncrypt(token.email);
        user = await PartnerUser.findOne({ email: encryptedEmail });
      } catch (error) {
        console.log('🔍 CREATE BRAND SETTINGS: Encryption failed, trying to decrypt all emails');
        const allUsers = await PartnerUser.find();
        
        for (const potentialUser of allUsers) {
          try {
            const decryptedEmail = doubleDecrypt(potentialUser.email);
            if (decryptedEmail === token.email) {
              user = potentialUser;
              break;
            }
          } catch (e) {
            continue;
          }
        }
      }
    }

    if (!user) {
      console.log('❌ CREATE BRAND SETTINGS: User not found');
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    console.log('✅ CREATE BRAND SETTINGS: User found:', user._id);

    // Check if brand settings already exist
    const existingSettings = await BrandSettings.findOne({ userId: String(user._id) });
    
    if (existingSettings) {
      console.log('❌ CREATE BRAND SETTINGS: Brand settings already exist');
      return NextResponse.json({ message: 'Brand settings already exist. Use PUT to update.' }, { status: 400 });
    }

    // Create new brand settings
    const brandSettings = new BrandSettings({
      userId: String(user._id),
      brandName,
      logoUrl: logoUrl || '',
      logoPublicId: logoPublicId || '',
      primaryColor: primaryColor || '#3B82F6',
      secondaryColor: secondaryColor || '#10B981',
      isDeployed: false
    });

    await brandSettings.save();

    console.log('✅ CREATE BRAND SETTINGS: Brand settings created successfully');

    return NextResponse.json({ 
      success: true,
      message: 'Brand settings created successfully',
      brandSettings: {
        brandName: brandSettings.brandName,
        logoUrl: brandSettings.logoUrl,
        primaryColor: brandSettings.primaryColor,
        secondaryColor: brandSettings.secondaryColor,
        isDeployed: brandSettings.isDeployed
      }
    }, { status: 201 });

  } catch (error) {
    console.error('❌ CREATE BRAND SETTINGS: Error:', error);
    return NextResponse.json(
      { message: 'Failed to create brand settings' }, 
      { status: 500 }
    );
  }
}

// PUT - Update brand settings for the authenticated user
export async function PUT(req: NextRequest) {
  try {
    console.log('🔍 UPDATE BRAND SETTINGS: Starting update');
    
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.email) {
      console.log('❌ UPDATE BRAND SETTINGS: No token or email found');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ UPDATE BRAND SETTINGS: Token found for email:', token.email);

    const body = await req.json();
    const { brandName, logoUrl, logoPublicId, primaryColor, secondaryColor } = body;

    await dbConnect();

    // Find the user first to get their ID
    let user = await PartnerUser.findOne({ email: token.email });
    
    if (!user) {
      console.log('🔍 UPDATE BRAND SETTINGS: Direct lookup failed, trying encrypted email');
      try {
        const encryptedEmail = doubleEncrypt(token.email);
        user = await PartnerUser.findOne({ email: encryptedEmail });
      } catch (error) {
        console.log('🔍 UPDATE BRAND SETTINGS: Encryption failed, trying to decrypt all emails');
        const allUsers = await PartnerUser.find();
        
        for (const potentialUser of allUsers) {
          try {
            const decryptedEmail = doubleDecrypt(potentialUser.email);
            if (decryptedEmail === token.email) {
              user = potentialUser;
              break;
            }
          } catch (e) {
            continue;
          }
        }
      }
    }

    if (!user) {
      console.log('❌ UPDATE BRAND SETTINGS: User not found');
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    console.log('✅ UPDATE BRAND SETTINGS: User found:', user._id);

    // Prepare update data
    const updateData: any = {};
    
    if (brandName !== undefined) updateData.brandName = brandName;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
    if (logoPublicId !== undefined) updateData.logoPublicId = logoPublicId;
    if (primaryColor !== undefined) updateData.primaryColor = primaryColor;
    if (secondaryColor !== undefined) updateData.secondaryColor = secondaryColor;

    console.log('🔍 UPDATE BRAND SETTINGS: Updating fields:', Object.keys(updateData));

    // Update or create brand settings
    const brandSettings = await BrandSettings.findOneAndUpdate(
      { userId: String(user._id) },
      updateData,
      { new: true, upsert: true }
    );

    if (!brandSettings) {
      console.log('❌ UPDATE BRAND SETTINGS: Failed to update brand settings');
      return NextResponse.json({ message: 'Failed to update brand settings' }, { status: 500 });
    }

    console.log('✅ UPDATE BRAND SETTINGS: Brand settings updated successfully');

    return NextResponse.json({ 
      success: true,
      message: 'Brand settings updated successfully',
      brandSettings: {
        brandName: brandSettings.brandName,
        logoUrl: brandSettings.logoUrl,
        primaryColor: brandSettings.primaryColor,
        secondaryColor: brandSettings.secondaryColor,
        isDeployed: brandSettings.isDeployed,
        websiteUrl: brandSettings.websiteUrl
      }
    }, { status: 200 });

  } catch (error) {
    console.error('❌ UPDATE BRAND SETTINGS: Error:', error);
    return NextResponse.json(
      { message: 'Failed to update brand settings' }, 
      { status: 500 }
    );
  }
} 