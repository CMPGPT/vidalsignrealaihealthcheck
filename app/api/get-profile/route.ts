import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/dbConnect';
import PartnerUser from '@/models/PartnerUser';
import { doubleEncrypt, doubleDecrypt } from '@/lib/encryption';

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 GET PROFILE: Starting profile fetch');
    
    // Get the user's token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.email) {
      console.log('❌ GET PROFILE: No token or email found');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ GET PROFILE: Token found for email:', token.email);

    await dbConnect();

    // Find the user (handle encrypted emails)
    let user = await PartnerUser.findOne({ email: token.email });
    
    if (!user) {
      console.log('🔍 GET PROFILE: Direct lookup failed, trying encrypted email');
      try {
        const encryptedEmail = doubleEncrypt(token.email);
        user = await PartnerUser.findOne({ email: encryptedEmail });
      } catch (error) {
        console.log('🔍 GET PROFILE: Encryption failed, trying to decrypt all emails');
        // Try to find by decrypting all emails
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
      console.log('❌ GET PROFILE: User not found');
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    console.log('✅ GET PROFILE: User found:', user._id);

    // Decrypt user data for display
    const profileData = {
      firstName: '',
      lastName: '',
      email: token.email,
      phone: '',
      website: '',
      organizationName: '',
      businessAddress: '',
      city: '',
      state: '',
      zip: '',
      businessType: '',
      stripePublishableKey: '',
      stripeSecretKey: '',
      stripeWebhookSecret: ''
    };

    // Decrypt all sensitive fields
    try {
      profileData.firstName = user.first_Name ? doubleDecrypt(user.first_Name) : '';
    } catch (e) {
      profileData.firstName = user.first_Name || '';
    }

    try {
      profileData.lastName = user.last_Name ? doubleDecrypt(user.last_Name) : '';
    } catch (e) {
      profileData.lastName = user.last_Name || '';
    }

    try {
      profileData.phone = user.phone ? doubleDecrypt(user.phone) : '';
    } catch (e) {
      profileData.phone = user.phone || '';
    }

    try {
      profileData.website = user.website_link ? doubleDecrypt(user.website_link) : '';
    } catch (e) {
      profileData.website = user.website_link || '';
    }

    try {
      profileData.organizationName = user.organization_name ? doubleDecrypt(user.organization_name) : '';
    } catch (e) {
      profileData.organizationName = user.organization_name || '';
    }

    try {
      profileData.businessAddress = user.business_address ? doubleDecrypt(user.business_address) : '';
    } catch (e) {
      profileData.businessAddress = user.business_address || '';
    }

    try {
      profileData.city = user.city ? doubleDecrypt(user.city) : '';
    } catch (e) {
      profileData.city = user.city || '';
    }

    try {
      profileData.state = user.state ? doubleDecrypt(user.state) : '';
    } catch (e) {
      profileData.state = user.state || '';
    }

    try {
      profileData.zip = user.zip ? doubleDecrypt(user.zip) : '';
    } catch (e) {
      profileData.zip = user.zip || '';
    }

    try {
      profileData.businessType = user.business_type ? doubleDecrypt(user.business_type) : '';
    } catch (e) {
      profileData.businessType = user.business_type || '';
    }

    // Decrypt Stripe credentials
    try {
      profileData.stripePublishableKey = user.stripePublishableKey ? doubleDecrypt(user.stripePublishableKey) : '';
    } catch (e) {
      profileData.stripePublishableKey = user.stripePublishableKey || '';
    }

    try {
      profileData.stripeSecretKey = user.stripeSecretKey ? doubleDecrypt(user.stripeSecretKey) : '';
    } catch (e) {
      profileData.stripeSecretKey = user.stripeSecretKey || '';
    }

    try {
      profileData.stripeWebhookSecret = user.stripeWebhookSecret ? doubleDecrypt(user.stripeWebhookSecret) : '';
    } catch (e) {
      profileData.stripeWebhookSecret = user.stripeWebhookSecret || '';
    }

    console.log('✅ GET PROFILE: Profile data decrypted successfully');

    return NextResponse.json({ 
      success: true,
      profile: profileData
    }, { status: 200 });

  } catch (error) {
    console.error('❌ GET PROFILE: Error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch profile' }, 
      { status: 500 }
    );
  }
} 