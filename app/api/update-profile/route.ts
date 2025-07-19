import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/dbConnect';
import PartnerUser from '@/models/PartnerUser';
import { doubleEncrypt, doubleDecrypt } from '@/lib/encryption';

export async function PUT(request: NextRequest) {
  try {
    console.log('🔍 UPDATE PROFILE: Starting profile update');
    
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token?.email) {
      console.log('❌ UPDATE PROFILE: No token or email found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ UPDATE PROFILE: Token found for email:', token.email);

    const body = await request.json();
    console.log('🔍 UPDATE PROFILE: Received data:', body);

    await dbConnect();

    // Find the partner user by email (handle encrypted emails)
    let partnerUser = await PartnerUser.findOne({ email: token.email });
    
    if (!partnerUser) {
      console.log('🔍 UPDATE PROFILE: Direct lookup failed, trying encrypted email');
      try {
        const encryptedEmail = doubleEncrypt(token.email);
        partnerUser = await PartnerUser.findOne({ email: encryptedEmail });
      } catch (error) {
        console.log('🔍 UPDATE PROFILE: Encryption failed, trying to decrypt all emails');
        // Try to find by decrypting all emails
        const allUsers = await PartnerUser.find();
        
        for (const potentialUser of allUsers) {
          try {
            const decryptedEmail = doubleDecrypt(potentialUser.email);
            if (decryptedEmail === token.email) {
              partnerUser = potentialUser;
              break;
            }
          } catch (e) {
            continue;
          }
        }
      }
    }
    
    if (!partnerUser) {
      console.log('❌ UPDATE PROFILE: Partner user not found for email:', token.email);
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    console.log('✅ UPDATE PROFILE: Partner user found:', partnerUser._id);

    // Update fields that are provided
    const updateData: any = {};
    
    if (body.stripePublishableKey !== undefined) {
      updateData.stripePublishableKey = body.stripePublishableKey;
    }
    
    if (body.stripeSecretKey !== undefined) {
      updateData.stripeSecretKey = body.stripeSecretKey;
    }
    
    if (body.stripeWebhookSecret !== undefined) {
      updateData.stripeWebhookSecret = body.stripeWebhookSecret;
    }

    // Update other profile fields if provided
    if (body.firstName !== undefined) updateData.first_Name = body.firstName;
    if (body.lastName !== undefined) updateData.last_Name = body.lastName;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.website !== undefined) updateData.website_link = body.website;
    if (body.organizationName !== undefined) updateData.organization_name = body.organizationName;
    if (body.businessAddress !== undefined) updateData.business_address = body.businessAddress;
    if (body.city !== undefined) updateData.city = body.city;
    if (body.state !== undefined) updateData.state = body.state;
    if (body.zip !== undefined) updateData.zip = body.zip;
    if (body.businessType !== undefined) updateData.business_type = body.businessType;

    console.log('🔍 UPDATE PROFILE: Updating with data:', updateData);

    // Update the partner user
    const updatedPartner = await PartnerUser.findByIdAndUpdate(
      partnerUser._id,
      updateData,
      { new: true }
    );

    if (!updatedPartner) {
      console.log('❌ UPDATE PROFILE: Failed to update partner user');
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    console.log('✅ UPDATE PROFILE: Successfully updated partner user');

    return NextResponse.json({ 
      success: true,
      message: 'Profile updated successfully',
      partner: {
        firstName: updatedPartner.first_Name,
        lastName: updatedPartner.last_Name,
        email: updatedPartner.email,
        phone: updatedPartner.phone,
        website: updatedPartner.website_link,
        organizationName: updatedPartner.organization_name,
        businessAddress: updatedPartner.business_address,
        city: updatedPartner.city,
        state: updatedPartner.state,
        zip: updatedPartner.zip,
        businessType: updatedPartner.business_type,
        stripePublishableKey: updatedPartner.stripePublishableKey,
        stripeSecretKey: updatedPartner.stripeSecretKey,
        stripeWebhookSecret: updatedPartner.stripeWebhookSecret,
      }
    });

  } catch (error) {
    console.error('❌ UPDATE PROFILE: Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 