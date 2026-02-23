import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectDB();
        const user = await User.findOne({ email: credentials.email });
        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        if (!user.isActive) {
          throw new Error("Your account has been deactivated. Please contact the administrator.");
        }

        // Return the user object with the id as a string
        return { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // Ensure that token.id is available and added to the session
      if (token?.id) {
        session.user.id = token.id;  // Store the user ID in the session
      }
      session.user.role = token.role;
      return session;
    },
    
    async jwt({ token, user }) {
      if (user) {
        // Store the user ID in the JWT token when the user logs in
        token.id = user.id; // Ensure the user ID is added to the token
        token.role = user.role;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };