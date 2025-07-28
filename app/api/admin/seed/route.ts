import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import AdminUser from '@/models/AdminUser';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }
    const existing = await AdminUser.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: 'Admin user already exists.' }, { status: 409 });
    }
    const user = await AdminUser.create({ email, password, userType: 'admin' });
    return NextResponse.json({ success: true, user: { email: user.email, id: user._id } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
} 