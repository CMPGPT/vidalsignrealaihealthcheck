import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/dbConnect';
import PartnerUser from '@/models/PartnerUser';
import { doubleEncrypt, doubleDecrypt } from '@/lib/encryption';

export async function PUT(req: NextRequest) {
  try {
    console.log('🔍 UPDATE PROFILE: Starting profile update');
    
    // Get the user's token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.email) {
      console.log('❌ UPDATE PROFILE: No token or email found');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ UPDATE PROFILE: Token found for email:', token.email);

    const body = await req.json();
    const {
      firstName,
      lastName,
      phone,
      website,
      organizationName,
      businessAddress,
      city,
      state,
      zip,
      businessType
    } = body;

    console.log('🔍 UPDATE PROFILE: Received data:', {
      firstName,
      lastName,
      phone,
      website: website ? 'provided' : 'not provided',
      organizationName,
      city,
      state
    });

    await dbConnect();

    // Find the user (handle encrypted emails)
    let user = await PartnerUser.findOne({ email: token.email });
    
    if (!user) {
      console.log('🔍 UPDATE PROFILE: Direct lookup failed, trying encrypted email');
      try {
        const encryptedEmail = doubleEncrypt(token.email);
        user = await PartnerUser.findOne({ email: encryptedEmail });
      } catch (error) {
        console.log('🔍 UPDATE PROFILE: Encryption failed, trying to decrypt all emails');
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
      console.log('❌ UPDATE PROFILE: User not found');
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    console.log('✅ UPDATE PROFILE: User found:', user._id);

    // Prepare update data (encrypt sensitive fields)
    const updateData: any = {};

    if (firstName) {
      updateData.first_Name = doubleEncrypt(firstName);
    }
    if (lastName) {
      updateData.last_Name = doubleEncrypt(lastName);
    }
    if (phone) {
      updateData.phone = doubleEncrypt(phone);
    }
    if (website) {
      updateData.website_link = doubleEncrypt(website);
    }
    if (organizationName) {
      updateData.organization_name = doubleEncrypt(organizationName);
    }
    if (businessAddress) {
      updateData.business_address = doubleEncrypt(businessAddress);
    }
    if (city) {
      updateData.city = doubleEncrypt(city);
    }
    if (state) {
      updateData.state = doubleEncrypt(state);
    }
    if (zip) {
      updateData.zip = doubleEncrypt(zip);
    }
    if (businessType) {
      updateData.business_type = doubleEncrypt(businessType);
    }

    console.log('🔍 UPDATE PROFILE: Updating fields:', Object.keys(updateData));

    // Update the user
    const updatedUser = await PartnerUser.findByIdAndUpdate(
      user._id,
      updateData,
      { new: true }
    );

    if (!updatedUser) {
      console.log('❌ UPDATE PROFILE: Failed to update user');
      return NextResponse.json({ message: 'Failed to update profile' }, { status: 500 });
    }

    console.log('✅ UPDATE PROFILE: Profile updated successfully');

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      success: true 
    }, { status: 200 });

  } catch (error) {
    console.error('❌ UPDATE PROFILE: Error:', error);
    return NextResponse.json(
      { message: 'Failed to update profile' }, 
      { status: 500 }
    );
  }
} 