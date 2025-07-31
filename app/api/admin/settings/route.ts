import { NextRequest, NextResponse } from 'next/server';
import AdminUser from '@/models/AdminUser';

export async function GET(request: NextRequest) {
  try {
    // Get current admin user settings
    const adminUser = await AdminUser.findOne({ userType: 'admin' });
    
    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'Admin user not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        email: adminUser.email,
        password: adminUser.password, // Return actual password from MongoDB
        openaiApiKey: adminUser.openaiApiKey || '',
        mistralApiKey: adminUser.mistralApiKey || ''
      }
    });

  } catch (error) {
    console.error('Get admin settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admin settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, newPassword, openaiApiKey, mistralApiKey } = body;

    // Find admin user
    const adminUser = await AdminUser.findOne({ userType: 'admin' });
    
    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'Admin user not found' },
        { status: 404 }
      );
    }

    // Update email if provided
    if (email && email !== adminUser.email) {
      // Check if email is already taken by another user
      const existingUser = await AdminUser.findOne({ email, _id: { $ne: adminUser._id } });
      if (existingUser) {
        return NextResponse.json(
          { success: false, error: 'Email is already in use' },
          { status: 400 }
        );
      }
      adminUser.email = email;
    }

    // Update password if provided (store as plain text, no hashing)
    if (newPassword && newPassword.trim() !== '') {
      // Validate password length
      if (newPassword.length < 8) {
        return NextResponse.json(
          { success: false, error: 'Password must be at least 8 characters' },
          { status: 400 }
        );
      }

      // Store password as plain text (no hashing)
      adminUser.password = newPassword;
    }

    // Update API keys
    if (openaiApiKey !== undefined) {
      adminUser.openaiApiKey = openaiApiKey;
    }
    
    if (mistralApiKey !== undefined) {
      adminUser.mistralApiKey = mistralApiKey;
    }

    // Save changes
    await adminUser.save();

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        email: adminUser.email,
        password: adminUser.password, // Return actual password after update
        openaiApiKey: adminUser.openaiApiKey || '',
        mistralApiKey: adminUser.mistralApiKey || ''
      }
    });

  } catch (error) {
    console.error('Update admin settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
} 