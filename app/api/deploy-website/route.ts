import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/dbConnect';
import BrandSettings, { generatePartnerUrl } from '@/models/BrandSettings';
import PartnerUser from '@/models/PartnerUser';
import { doubleEncrypt, doubleDecrypt } from '@/lib/encryption';

// POST - Deploy website for the authenticated user
export async function POST(req: NextRequest) {
  try {
    console.log('🔍 DEPLOY WEBSITE: Starting deployment');
    
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.email) {
      console.log('❌ DEPLOY WEBSITE: No token or email found');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ DEPLOY WEBSITE: Token found for email:', token.email);

    await dbConnect();

    // Resolve the authenticated partner user from token.email (with encrypted fallback)
    let user = await PartnerUser.findOne({ email: token.email });
    if (!user) {
      try {
        const encryptedEmail = doubleEncrypt(token.email as string);
        user = await PartnerUser.findOne({ email: encryptedEmail });
        if (!user) {
          const allUsers = await PartnerUser.find();
          for (const potentialUser of allUsers) {
            try {
              const decryptedEmail = doubleDecrypt(potentialUser.email);
              if (decryptedEmail === token.email) {
                user = potentialUser;
                break;
              }
            } catch {}
          }
        }
      } catch {}
    }

    if (!user) {
      console.log('❌ DEPLOY WEBSITE: User not resolved from token');
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // BrandSettings are keyed by Mongo user _id string
    const brandSettings = await BrandSettings.findOne({ userId: String(user._id) });

    if (!brandSettings) {
      console.log('❌ DEPLOY WEBSITE: No brand settings found');
      return NextResponse.json({ 
        message: 'Brand settings not found. Please configure your brand settings first.' 
      }, { status: 400 });
    }

    if (!brandSettings.brandName) {
      console.log('❌ DEPLOY WEBSITE: Brand name is required');
      return NextResponse.json({ 
        message: 'Brand name is required for deployment.' 
      }, { status: 400 });
    }

    console.log('✅ DEPLOY WEBSITE: Brand settings found:', brandSettings.brandName);

    // Generate partner website URL using userId
    const partnerUrl = `/partnerswebsite/${brandSettings.userId}`;
    const fullWebsiteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${partnerUrl}`;
    
    console.log('🔍 DEPLOY WEBSITE: Generated partner URL:', fullWebsiteUrl);

    // Deployment process
    try {
      console.log('🚀 DEPLOY WEBSITE: Starting deployment process...');
      
      // Simulate deployment delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('✅ DEPLOY WEBSITE: Deployment completed successfully');
      
      // Update brand settings with deployment info
      const updatedBrandSettings = await BrandSettings.findOneAndUpdate(
        { _id: brandSettings._id },
        { 
          isDeployed: true,
          websiteUrl: fullWebsiteUrl,
          lastDeployedAt: new Date()
        },
        { new: true }
      );

      if (!updatedBrandSettings) {
        console.log('❌ DEPLOY WEBSITE: Failed to update brand settings');
        return NextResponse.json({ message: 'Deployment succeeded but failed to update records' }, { status: 500 });
      }

      console.log('✅ DEPLOY WEBSITE: Brand settings updated with deployment info');

      return NextResponse.json({ 
        success: true,
        message: 'Website deployed successfully!',
        websiteUrl: fullWebsiteUrl,
        partnerUrl: partnerUrl,
        deployedAt: updatedBrandSettings.lastDeployedAt,
        brandSettings: {
          brandName: updatedBrandSettings.brandName,
          logoUrl: updatedBrandSettings.logoUrl,
          selectedTheme: updatedBrandSettings.selectedTheme,
          customColors: updatedBrandSettings.customColors,
          isDeployed: updatedBrandSettings.isDeployed,
          websiteUrl: updatedBrandSettings.websiteUrl
        }
      }, { status: 200 });

    } catch (deploymentError) {
      console.error('❌ DEPLOY WEBSITE: Deployment failed:', deploymentError);
      return NextResponse.json({ 
        message: 'Deployment failed. Please try again.' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ DEPLOY WEBSITE: Error:', error);
    return NextResponse.json(
      { message: 'Failed to deploy website' }, 
      { status: 500 }
    );
  }
}

// GET - Get deployment status for the authenticated user
export async function GET(req: NextRequest) {
  try {
    console.log('🔍 GET DEPLOYMENT STATUS: Starting fetch');
    
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.email) {
      console.log('❌ GET DEPLOYMENT STATUS: No token or email found');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ GET DEPLOYMENT STATUS: Token found for email:', token.email);

    await dbConnect();

    // Resolve user then find brand settings by userId (Mongo _id string)
    let user = await PartnerUser.findOne({ email: token.email });
    if (!user) {
      try {
        const encryptedEmail = doubleEncrypt(token.email as string);
        user = await PartnerUser.findOne({ email: encryptedEmail });
        if (!user) {
          const allUsers = await PartnerUser.find();
          for (const potentialUser of allUsers) {
            try {
              const decryptedEmail = doubleDecrypt(potentialUser.email);
              if (decryptedEmail === token.email) {
                user = potentialUser;
                break;
              }
            } catch {}
          }
        }
      } catch {}
    }

    const brandSettings = user
      ? await BrandSettings.findOne({ userId: String(user._id) })
      : null;

    if (!brandSettings) {
      console.log('❌ GET DEPLOYMENT STATUS: No brand settings found');
      return NextResponse.json({ 
        success: true,
        isDeployed: false,
        message: 'No brand settings found'
      }, { status: 200 });
    }

    console.log('✅ GET DEPLOYMENT STATUS: Brand settings found');

    return NextResponse.json({ 
      success: true,
      isDeployed: brandSettings.isDeployed,
      websiteUrl: brandSettings.websiteUrl || '',
      lastDeployedAt: brandSettings.lastDeployedAt,
      brandName: brandSettings.brandName
    }, { status: 200 });

  } catch (error) {
    console.error('❌ GET DEPLOYMENT STATUS: Error:', error);
    return NextResponse.json(
      { message: 'Failed to get deployment status' }, 
      { status: 500 }
    );
  }
} 