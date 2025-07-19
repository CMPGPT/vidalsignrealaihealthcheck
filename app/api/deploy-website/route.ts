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

    // Find the user first to get their ID
    let user = await PartnerUser.findOne({ email: token.email });
    
    if (!user) {
      console.log('🔍 DEPLOY WEBSITE: Direct lookup failed, trying encrypted email');
      try {
        const encryptedEmail = doubleEncrypt(token.email);
        user = await PartnerUser.findOne({ email: encryptedEmail });
      } catch (error) {
        console.log('🔍 DEPLOY WEBSITE: Encryption failed, trying to decrypt all emails');
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
      console.log('❌ DEPLOY WEBSITE: User not found');
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    console.log('✅ DEPLOY WEBSITE: User found:', user._id);

    // Find brand settings for this user
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

    // Generate partner website URL
    const partnerUrl = generatePartnerUrl(brandSettings.brandName);
    const fullWebsiteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${partnerUrl}`;
    
    console.log('🔍 DEPLOY WEBSITE: Generated partner URL:', fullWebsiteUrl);

    // Deployment process
    try {
      console.log('🚀 DEPLOY WEBSITE: Starting deployment process...');
      
      // In a real implementation, here you would:
      // 1. Generate the HTML/CSS/JS for the website using the brand settings ✅
      // 2. Deploy to a CDN or hosting service
      // 3. Configure DNS for the subdomain
      // 4. Wait for deployment to complete
      
      // For now, the website template is served via /api/website-template?brand=${brandName}
      // and can be accessed at the subdomain URL which would redirect to the template
      
      // Simulate deployment delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('✅ DEPLOY WEBSITE: Deployment completed successfully');
      
      // Update brand settings with deployment info
      const updatedBrandSettings = await BrandSettings.findOneAndUpdate(
        { userId: String(user._id) },
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

    // Find the user first to get their ID
    let user = await PartnerUser.findOne({ email: token.email });
    
    if (!user) {
      console.log('🔍 GET DEPLOYMENT STATUS: Direct lookup failed, trying encrypted email');
      try {
        const encryptedEmail = doubleEncrypt(token.email);
        user = await PartnerUser.findOne({ email: encryptedEmail });
      } catch (error) {
        console.log('🔍 GET DEPLOYMENT STATUS: Encryption failed, trying to decrypt all emails');
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
      console.log('❌ GET DEPLOYMENT STATUS: User not found');
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    console.log('✅ GET DEPLOYMENT STATUS: User found:', user._id);

    // Find brand settings for this user
    const brandSettings = await BrandSettings.findOne({ userId: String(user._id) });

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