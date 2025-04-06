import dbConnect from "@/lib/dbConnect";
import PartnerUser from "@/models/PartnerUser";
import bcrypt from "bcryptjs";
import { doubleDecrypt } from "@/lib/encryption";

export async function authorizeUser(credentials: any) {
  await dbConnect();

  const allUsers = await PartnerUser.find();

  for (const user of allUsers) {
    try {
      const decryptedEmail = doubleDecrypt(user.email);

      if (decryptedEmail === credentials.email) {
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error("Invalid password");

        return {
          // @ts-ignore
          id: user._id.toString(),
          name: `${doubleDecrypt(user.first_Name)} ${doubleDecrypt(user.last_Name)}`,
          email: decryptedEmail,
        };
      }
    } catch (e) {
      // Skip if decryption fails for any user
      continue;
    }
  }

  throw new Error("No user found");
}
