 import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import PartnerUser from '@/models/PartnerUser';
import { doubleDecrypt } from '@/lib/encryption';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('🔍 PARTNER CONTACT: Fetching contact info for userId:', userId);

    await dbConnect();

    // Try multiple search strategies to find the partner user
    let partnerUser = null;
    
    // First try by unique_id (direct match)
    partnerUser = await PartnerUser.findOne({ unique_id: userId });
    
    // If not found, try by email (case-insensitive regex)
    if (!partnerUser) {
      partnerUser = await PartnerUser.findOne({ email: { $regex: new RegExp(userId, 'i') } });
    }
    
    // If still not found, try by _id (if userId is an ObjectId)
    if (!partnerUser && userId.match(/^[0-9a-fA-F]{24}$/)) {
      partnerUser = await PartnerUser.findById(userId);
    }
    
    if (!partnerUser) {
      console.log('❌ PARTNER CONTACT: Partner user not found for userId:', userId);
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    console.log('✅ PARTNER CONTACT: Partner user found:', partnerUser._id);
    console.log('📧 PARTNER CONTACT: Email field:', partnerUser.email ? 'Present (encrypted)' : 'Not found');
    console.log('📞 PARTNER CONTACT: Phone field:', partnerUser.phone ? 'Present (encrypted)' : 'Not found');

    // Decrypt contact information
    let email = '';
    let phone = '';

    try {
      // Try to decrypt email
      email = partnerUser.email ? doubleDecrypt(partnerUser.email) : '';
    } catch (e) {
      // If decryption fails, use the original value
      email = partnerUser.email || '';
    }

    try {
      // Try to decrypt phone
      phone = partnerUser.phone ? doubleDecrypt(partnerUser.phone) : '';
    } catch (e) {
      // If decryption fails, use the original value
      phone = partnerUser.phone || '';
    }

    // If email is still encrypted (starts with encrypted pattern), try to decrypt it
    if (email && email.length > 50) {
      try {
        email = doubleDecrypt(email);
      } catch (e) {
        // Keep the encrypted email if decryption fails
      }
    }

    console.log('✅ PARTNER CONTACT: Contact info decrypted successfully');

    return NextResponse.json({ 
      success: true,
      contact: {
        email: email,
        phone: phone
      }
    });

  } catch (error) {
    console.error('❌ PARTNER CONTACT: Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact information' }, 
      { status: 500 }
    );
  }
} 