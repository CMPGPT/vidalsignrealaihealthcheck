import dbConnect from "@/lib/dbConnect";
import PartnerUser, { IPartnerUser } from "@/models/PartnerUser";
import bcrypt from "bcryptjs";
import { doubleDecrypt, doubleEncrypt } from "@/lib/encryption";
import mongoose from "mongoose";

export async function authorizeUser(credentials: any) {
  console.log('🔍 AUTH DEBUG: ========== Starting Authorization ==========');
  console.log('🔍 AUTH DEBUG: Email provided:', credentials?.email);
  console.log('🔍 AUTH DEBUG: Password provided:', !!credentials?.password);
  console.log('🔍 AUTH DEBUG: Password length:', credentials?.password?.length);

  if (!credentials?.email || !credentials?.password) {
    console.log('❌ AUTH DEBUG: Missing email or password');
    throw new Error("Email and password are required");
  }

  try {
    console.log('🔍 AUTH DEBUG: Connecting to database...');
    await dbConnect();
    console.log('✅ AUTH DEBUG: Database connected successfully');
  } catch (error) {
    console.error('❌ AUTH DEBUG: Database connection failed:', error);
    throw new Error("Database connection failed");
  }

  // First try direct email lookup (for non-encrypted emails)
  console.log('🔍 AUTH DEBUG: Step 1 - Direct email lookup');
  let user = await PartnerUser.findOne({ email: credentials.email });
  console.log('🔍 AUTH DEBUG: Direct lookup result:', user ? 'FOUND USER' : 'NOT FOUND');

  // If not found, try encrypted email lookup
  if (!user) {
    console.log('🔍 AUTH DEBUG: Step 2 - Encrypted email lookup');
    try {
      const encryptedEmail = doubleEncrypt(credentials.email);
      console.log('🔍 AUTH DEBUG: Encrypted email:', encryptedEmail);
      user = await PartnerUser.findOne({ email: encryptedEmail });
      console.log('🔍 AUTH DEBUG: Encrypted lookup result:', user ? 'FOUND USER' : 'NOT FOUND');
    } catch (error) {
      console.error('❌ AUTH DEBUG: Encryption failed:', error);
    }
  }

  // If still not found, try to find by decrypting emails
  if (!user) {
    console.log('🔍 AUTH DEBUG: Step 3 - Decrypting all emails');
    const allUsers = await PartnerUser.find();
    console.log('🔍 AUTH DEBUG: Total users in database:', allUsers.length);
    
    for (const potentialUser of allUsers) {
      try {
        // Try to decrypt the email
        const decryptedEmail = doubleDecrypt(potentialUser.email);
        console.log('🔍 AUTH DEBUG: Decrypted email:', decryptedEmail);
        console.log('🔍 AUTH DEBUG: Comparing with:', credentials.email);
        
        if (decryptedEmail === credentials.email) {
          user = potentialUser;
          console.log('✅ AUTH DEBUG: MATCH FOUND! User found via decryption');
          break;
        }
      } catch (e) {
        console.log('⚠️ AUTH DEBUG: Failed to decrypt email for user:', potentialUser._id);
        continue;
      }
    }
  }

  if (!user) {
    console.log('❌ AUTH DEBUG: NO USER FOUND with email:', credentials.email);
    throw new Error("Invalid email or password");
  }

  console.log('✅ AUTH DEBUG: User found!');
  console.log('🔍 AUTH DEBUG: User ID:', user._id);
  console.log('🔍 AUTH DEBUG: User unique_id:', user.unique_id);

  // Verify password
  try {
    console.log('🔍 AUTH DEBUG: Step 4 - Verifying password');
    const isValid = await bcrypt.compare(credentials.password, user.password);
    console.log('🔍 AUTH DEBUG: Password verification result:', isValid);
    
    if (!isValid) {
      console.log('❌ AUTH DEBUG: PASSWORD MISMATCH');
      throw new Error("Invalid email or password");
    }

    // Get user name (handle both encrypted and non-encrypted names)
    console.log('🔍 AUTH DEBUG: Step 5 - Getting user names');
    let firstName = user.first_Name;
    let lastName = user.last_Name;
    
    try {
      firstName = doubleDecrypt(user.first_Name);
      lastName = doubleDecrypt(user.last_Name);
      console.log('✅ AUTH DEBUG: Names decrypted successfully');
    } catch (e) {
      console.log('⚠️ AUTH DEBUG: Using original names (not encrypted)');
    }

    const result = {
      id: (user as any)._id.toString(),
      name: `${firstName} ${lastName}`,
      email: credentials.email,
      unique_id: user.unique_id,
      partnerId: (user as any)._id.toString(), // Add the MongoDB _id as partnerId
    };

    console.log('🎉 AUTH DEBUG: Authorization successful!');
    console.log('🔍 AUTH DEBUG: Returning user:', { ...result, name: result.name });
    console.log('🔍 AUTH DEBUG: ========== Authorization Complete ==========');

    return result;
  } catch (e) {
    console.error('❌ AUTH DEBUG: Password verification error:', e);
    throw new Error("Invalid email or password");
  }
}
