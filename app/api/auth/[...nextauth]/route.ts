import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { authorizeUser } from "@/lib/auth";
import dbConnect from '@/lib/dbConnect';
import PartnerUser from '@/models/PartnerUser';
import { v4 as uuidv4 } from 'uuid';

const handler = NextAuth({
  // Use environment variables for configuration
  debug: false, // Set to true if you want debug logs
  
  providers: [
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log('🔍 NEXTAUTH DEBUG: ========== Authorize Called ==========');
        console.log('🔍 NEXTAUTH DEBUG: Credentials received:', { 
          email: credentials?.email, 
          passwordProvided: !!credentials?.password 
        });
        console.log('🔍 NEXTAUTH DEBUG: Environment - NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
        console.log('🔍 NEXTAUTH DEBUG: Environment - NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);
        
        try {
          const result = await authorizeUser(credentials);
          console.log('✅ NEXTAUTH DEBUG: Authorization successful:', result);
          return result;
        } catch (error) {
          console.error('❌ NEXTAUTH DEBUG: Authorization failed:', error);
          return null;
        }
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('🔍 NEXTAUTH DEBUG: ========== SignIn Callback ==========');
      console.log('🔍 NEXTAUTH DEBUG: User:', user);
      console.log('🔍 NEXTAUTH DEBUG: Account:', account);
      console.log('🔍 NEXTAUTH DEBUG: Profile:', profile);
      console.log('🔍 NEXTAUTH DEBUG: Using URL:', process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL);
      
      await dbConnect();
      // For OAuth, ensure user exists in PartnerUser and has unique_id
      if (account?.provider === 'google' || account?.provider === 'facebook') {
        console.log('🔍 NEXTAUTH DEBUG: OAuth login detected');
        let partnerUser = await PartnerUser.findOne({ email: user.email });
        if (!partnerUser) {
          // Create new partner user with unique_id
          partnerUser = await PartnerUser.create({
            unique_id: uuidv4(),
            first_Name: (profile as any)?.given_name || (profile as any)?.first_name || (profile as any)?.name?.split(' ')[0] || 'GoogleUser',
            last_Name: (profile as any)?.family_name || (profile as any)?.last_name || (profile as any)?.name?.split(' ')[1] || '',
            state: '',
            organization_name: '',
            email: user.email,
            password: uuidv4(), // random password, not used
          });
        } else if (!partnerUser.unique_id) {
          partnerUser.unique_id = uuidv4();
          await partnerUser.save();
        }
      } else {
        console.log('🔍 NEXTAUTH DEBUG: Credentials login detected');
      }
      
      console.log('✅ NEXTAUTH DEBUG: SignIn callback returning true');
      return true;
    },
    async jwt({ token, user }) {
      console.log('🔍 NEXTAUTH DEBUG: ========== JWT Callback ==========');
      console.log('🔍 NEXTAUTH DEBUG: Token:', token);
      console.log('🔍 NEXTAUTH DEBUG: User:', user);
      console.log('🔍 NEXTAUTH DEBUG: JWT using URL:', process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL);
      
      await dbConnect();
      
      // If user object exists (first login), store the unique_id and partnerId in token
      if (user && (user as any).unique_id) {
        console.log('🔍 NEXTAUTH DEBUG: Storing unique_id from user object:', (user as any).unique_id);
        token.unique_id = (user as any).unique_id;
        token.partnerId = (user as any).partnerId || (user as any).id; // Store the MongoDB _id as partnerId
        token.email = user.email;
        token.name = user.name;
      }
      
      // If token doesn't have unique_id but has email, try to find it in database
      if (!token.unique_id && token.email) {
        console.log('🔍 NEXTAUTH DEBUG: Looking for user with email:', token.email);
        
        // Try to find user (handle encrypted emails)
        let partnerUser = await PartnerUser.findOne({ email: token.email });
        
        if (!partnerUser) {
          console.log('🔍 NEXTAUTH DEBUG: Direct lookup failed, trying encrypted email');
          try {
            const { doubleEncrypt } = await import('@/lib/encryption');
            const encryptedEmail = doubleEncrypt(token.email);
            partnerUser = await PartnerUser.findOne({ email: encryptedEmail });
          } catch (error) {
            console.log('🔍 NEXTAUTH DEBUG: Encryption failed, trying to decrypt all emails');
            // Try to find by decrypting all emails
            const allUsers = await PartnerUser.find();
            const { doubleDecrypt } = await import('@/lib/encryption');
            
            for (const potentialUser of allUsers) {
              try {
                const decryptedEmail = doubleDecrypt(potentialUser.email);
                if (decryptedEmail === token.email) {
                  partnerUser = potentialUser;
                  break;
                }
              } catch (e) {
                continue;
              }
            }
          }
        }
        
        if (partnerUser) {
          token.unique_id = partnerUser.unique_id;
          token.partnerId = (partnerUser as any)._id.toString(); // Store the MongoDB _id as partnerId
          console.log('✅ NEXTAUTH DEBUG: Added unique_id and partnerId to token:', partnerUser.unique_id, (partnerUser as any)._id.toString());
        } else {
          console.log('❌ NEXTAUTH DEBUG: Could not find user in database');
        }
      }

      if (user && (user as any).userType === 'admin') {
        token.userType = 'admin';
      }
      
      console.log('🔍 NEXTAUTH DEBUG: Final token:', { email: token.email, unique_id: token.unique_id });
      return token;
    },
    async session({ session, token }) {
      console.log('🔍 NEXTAUTH DEBUG: ========== Session Callback ==========');
      console.log('🔍 NEXTAUTH DEBUG: Session:', session);
      console.log('🔍 NEXTAUTH DEBUG: Token:', token);
      console.log('🔍 NEXTAUTH DEBUG: Session using URL:', process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL);
      
      if (session.user) {
        (session.user as any).unique_id = token.unique_id;
        (session.user as any).partnerId = token.partnerId; // Add partnerId to session
        (session.user as any).userType = token.userType;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Always respect the callbackUrl if provided
      if (url && url.includes("callbackUrl=")) {
        const cbUrl = decodeURIComponent(url.split("callbackUrl=").pop()?.split("&")[0] || "");
        if (cbUrl.startsWith("/")) return cbUrl;
        if (cbUrl.startsWith("http")) return cbUrl;
      }
      // If logging out, go to /admin/login
      if (url && url.endsWith("/admin/login")) return "/admin/login";
      // If logging in, go to /admin
      if (url && url.endsWith("/admin")) return "/admin";
      // Fallback to baseUrl
      return baseUrl || "/admin/login";
    },
  },
});

export { handler as GET, handler as POST };
