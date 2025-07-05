import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { authorizeUser } from "@/lib/auth";
import dbConnect from '@/lib/dbConnect';
import PartnerUser from '@/models/PartnerUser';
import { v4 as uuidv4 } from 'uuid';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        return await authorizeUser(credentials);
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
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }) {
      await dbConnect();
      // For OAuth, ensure user exists in PartnerUser and has unique_id
      if (account?.provider === 'google' || account?.provider === 'facebook') {
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
      }
      return true;
    },
    async jwt({ token, user }) {
      await dbConnect();
      if (user && user.email) {
        const partnerUser = await PartnerUser.findOne({ email: user.email });
        if (partnerUser) {
          token.unique_id = partnerUser.unique_id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).unique_id = token.unique_id;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Always redirect to /partners after login
      if (url.includes('/login') || url.includes('/signup') || url === baseUrl + '/') {
        return baseUrl + '/partners';
      }
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
});

export { handler as GET, handler as POST };
