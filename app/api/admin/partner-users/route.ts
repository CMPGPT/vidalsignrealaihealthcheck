import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import PartnerUser from '@/models/PartnerUser';
import { SecureLink } from '@/models/SecureLink';
import { doubleDecrypt } from '@/lib/encryption';

export async function GET(req: NextRequest) {
  await dbConnect();
  const users = await PartnerUser.find({}).lean();

  // For each user, count secure links
  const usersWithCounts = await Promise.all(users.map(async user => {
    function safeDecrypt(val: any) {
      try { return doubleDecrypt(val); } catch { return val; }
    }
    // Ensure partnerId is a trimmed string
    const partnerId = String(user.unique_id).trim();
    const allLinks = await SecureLink.find({ partnerId: user._id.toString() });
    const usedLinks = allLinks.filter(l => l.isUsed === true);
    console.log(`Partner: ${partnerId} | Total QR Codes: ${allLinks.length} | Redeemed: ${usedLinks.length}`);
    return {
      ...user,
      mongo_id: user._id ? user._id.toString() : undefined,
      organization_name: safeDecrypt(user.organization_name),
      business_type: safeDecrypt(user.business_type),
      email: safeDecrypt(user.email),
      first_Name: safeDecrypt(user.first_Name),
      last_Name: safeDecrypt(user.last_Name),
      state: safeDecrypt(user.state),
      city: safeDecrypt(user.city),
      website_link: safeDecrypt(user.website_link),
      phone: safeDecrypt(user.phone),
      business_address: safeDecrypt(user.business_address),
      zip: safeDecrypt(user.zip),
      totalQRCodes: allLinks.length,
      redeemed: usedLinks.length,
    };
  }));
  return NextResponse.json({ users: usersWithCounts });
} 