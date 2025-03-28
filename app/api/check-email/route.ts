import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import PartnerUser from '@/models/PartnerUser';
import { doubleEncrypt } from '@/lib/encryption'; // Adjust path based on your setup

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ exists: false }, { status: 400 });
  }

  await dbConnect();
  const encryptedEmail = doubleEncrypt(email);

  const user = await PartnerUser.findOne({ email: encryptedEmail });

  return NextResponse.json({ exists: !!user });
}
