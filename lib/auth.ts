import dbConnect from "@/lib/dbConnect";
import PartnerUser, { IPartnerUser } from "@/models/PartnerUser";
import bcrypt from "bcryptjs";
import { doubleDecrypt } from "@/lib/encryption";
import mongoose from "mongoose";

export async function authorizeUser(credentials: any) {
  if (!credentials?.email || !credentials?.password) {
    throw new Error("Email and password are required");
  }

  await dbConnect();

  // First try direct email lookup (for non-encrypted emails)
  let user = await PartnerUser.findOne({ email: credentials.email });

  // If not found, try to find by decrypting emails
  if (!user) {
    const allUsers = await PartnerUser.find();
    
    for (const potentialUser of allUsers) {
      try {
        // Try to decrypt the email
        const decryptedEmail = doubleDecrypt(potentialUser.email);
        
        if (decryptedEmail === credentials.email) {
          user = potentialUser;
          break;
        }
      } catch (e) {
        // Skip if decryption fails for any user
        continue;
      }
    }
  }

  if (!user) {
    console.log("No user found with email:", credentials.email);
    throw new Error("Invalid email or password");
  }

  // Verify password
  try {
    const isValid = await bcrypt.compare(credentials.password, user.password);
    if (!isValid) {
      console.log("Invalid password for user:", credentials.email);
      throw new Error("Invalid email or password");
    }

    // Get user name (handle both encrypted and non-encrypted names)
    let firstName = user.first_Name;
    let lastName = user.last_Name;
    
    try {
      firstName = doubleDecrypt(user.first_Name);
      lastName = doubleDecrypt(user.last_Name);
    } catch (e) {
      // If decryption fails, use the original values
    }

    return {
      id: (user as any)._id.toString(),
      name: `${firstName} ${lastName}`,
      email: credentials.email,
      unique_id: user.unique_id,
    };
  } catch (e) {
    console.error("Error during password verification:", e);
    throw new Error("Invalid email or password");
  }
}
