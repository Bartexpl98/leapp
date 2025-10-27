import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { dbConnect } from "@/app/lib/mongoose";
import { findUserByEmailOrPhone, createUser } from "@/app/services/authService";
import { hashPassword, comparePassword } from "@/app/services/passwordService";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,           // ✅ v4 secret
  session: { strategy: "jwt" },
  pages: { signIn: "/signin" },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Email + Password",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        gdprConsent: { label: "GDPR Consent", type: "checkbox" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email.trim().toLowerCase();
        const gdprConsent =
          credentials.gdprConsent === "on" ||
          credentials.gdprConsent === "true" ||
          credentials.gdprConsent === "1";

        await dbConnect();

        let user = await findUserByEmailOrPhone(email);

        // Create on first login 
        if (!user) {
          if (!gdprConsent) return null;
          const hashed = await hashPassword(credentials.password);
          user = await createUser({
            email,
            passwordHash: hashed,
            authProvider: "password",
            gdprConsent: { accepted: true, acceptedAt: new Date(), version: "1.0" },
            profileCompleted: false,
          });
        } else {
          const valid = await comparePassword(credentials.password, user.passwordHash!);
          if (!valid) return null;
        }

        // Minimal user object for JWT
        return { id: user._id.toString(), email: user.email, name: user.name ?? undefined };
      },
    }),
  ],
  callbacks: {
    // Ensure email (and id/name) are stored into the JSON WebToekn
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    // mirrors token onto session.user so session.user.email is there
    async session({ session, token }) {
      if (session.user) {
        if (token?.id) session.user.id = token.id as string;
        if (token?.email) session.user.email = token.email as string;
        if (token?.name) session.user.name = token.name as string;
      }
      return session;
    },
    
    //ensures db user exists
    async signIn({ user }) {
      await dbConnect();
      if (user?.email) {
        const existing = await findUserByEmailOrPhone(user.email);
        if (!existing) {
          await createUser({
            email: user.email,
            name: user.name ?? undefined,
            authProvider: "password",
          });
        }
      }
      return true;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
