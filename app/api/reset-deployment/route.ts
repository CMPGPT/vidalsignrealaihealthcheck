import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/dbConnect';
import BrandSettings from '@/models/BrandSettings';
import PartnerUser from '@/models/PartnerUser';
import { doubleEncrypt, doubleDecrypt } from '@/lib/encryption';

// POST - Reset deployment status for the authenticated user
export async function POST(req: NextRequest) {
  try {
    console.log('🔍 RESET DEPLOYMENT: Starting reset');
    
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.email) {
      console.log('❌ RESET DEPLOYMENT: No token or email found');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ RESET DEPLOYMENT: Token found for email:', token.email);

    await dbConnect();

    // Find the user first to get their ID
    let user = await PartnerUser.findOne({ email: token.email });
    
    if (!user) {
      console.log('🔍 RESET DEPLOYMENT: Direct lookup failed, trying encrypted email');
      try {
        const encryptedEmail = doubleEncrypt(token.email);
        user = await PartnerUser.findOne({ email: encryptedEmail });
      } catch (error) {
        console.log('🔍 RESET DEPLOYMENT: Encryption failed, trying to decrypt all emails');
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
      console.log('❌ RESET DEPLOYMENT: User not found');
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    console.log('✅ RESET DEPLOYMENT: User found:', user._id);

    // Reset deployment status
    const updatedBrandSettings = await BrandSettings.findOneAndUpdate(
      { userId: String(user._id) },
      { 
        isDeployed: false,
        websiteUrl: '',
        lastDeployedAt: null
      },
      { new: true }
    );

    if (!updatedBrandSettings) {
      console.log('❌ RESET DEPLOYMENT: Brand settings not found');
      return NextResponse.json({ message: 'Brand settings not found' }, { status: 404 });
    }

    console.log('✅ RESET DEPLOYMENT: Deployment status reset successfully');

    return NextResponse.json({ 
      success: true,
      message: 'Deployment status reset successfully. You can now redeploy with the correct URL.',
      brandSettings: {
        brandName: updatedBrandSettings.brandName,
        isDeployed: false,
        websiteUrl: '',
        lastDeployedAt: null
      }
    }, { status: 200 });

  } catch (error) {
    console.error('❌ RESET DEPLOYMENT: Error:', error);
    return NextResponse.json(
      { message: 'Failed to reset deployment status' }, 
      { status: 500 }
    );
  }
} 