import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import PartnerUser from '@/models/PartnerUser';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { doubleEncrypt } from '@/lib/encryption';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      first_Name,
      last_Name,
      email,
      password,
      state,
      organization_name,
      website_link
    } = body;

    // Validate required fields
    if (!email || !password || !first_Name || !last_Name || !state || !organization_name) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();

    // Check if user exists (check encrypted email)
    const existingUsers = await PartnerUser.find();
    const isEmailExists = existingUsers.some((user) => {
      try {
        const decryptedEmail = user.email; // Already encrypted, compare after decrypting if needed
        return decryptedEmail === doubleEncrypt(email); // match double-encrypted email
      } catch {
        return false;
      }
    });

    if (isEmailExists) {
      return NextResponse.json({ message: "User already exists" }, { status: 409 });
    }

    // Hash password (never decryptable)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save encrypted fields
    const user = new PartnerUser({
      unique_id: uuidv4(),
      first_Name: doubleEncrypt(first_Name),
      last_Name: doubleEncrypt(last_Name),
      email: doubleEncrypt(email),
      password: hashedPassword,
      state: doubleEncrypt(state),
      organization_name: doubleEncrypt(organization_name),
      website_link: website_link ? doubleEncrypt(website_link) : undefined,
    });

    await user.save();

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });

  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
