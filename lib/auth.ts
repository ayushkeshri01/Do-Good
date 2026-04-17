import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  // Suppress noisy [auth][error] JWTSessionError logs caused by stale cookies
  logger: {
    error: (error: any) => {
      if (
        error?.name === "JWTSessionError" ||
        error?.message?.includes("JWTSessionError") ||
        error?.message?.includes("JWEInvalid")
      ) {
        // Silently ignore — stale cookie, NextAuth already returns null session
        return;
      }
      console.error("[auth][error]", error);
    },
    warn: (code: any) => {
      console.warn("[auth][warn]", code);
    },
    debug: () => {},
  },
  providers: [
    Credentials({
      name: "Password Logging",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }
        
        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({ 
          where: { email },
          select: {
            id: true,
            email: true,
            password: true,
            role: true,
            banned: true,
            banReason: true
          }
        });
        
        if (!user) {
           throw new Error("Invalid login credentials");
        }

        if (!user.password) {
           throw new Error("User has no password structured. Please reset your password.");
        }

        const passesCheck = await bcrypt.compare(password, user.password);

        if (!passesCheck) {
           throw new Error("Invalid login credentials");
        }

        if (user.banned) {
          throw new Error(`Banned:${user.banReason || "You have been banned"}`);
        }

        return user;
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
        if (user) {
           token.id = user.id;
           token.role = user.role;
        }
        return token;
    },
    async session({ session, token }) {
      if (token?.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub as string },
          select: {
            id: true,
            role: true,
            points: true,
            adminMessage: true,
          },
        });
        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.role = dbUser.role;
          session.user.points = dbUser.points;
          session.user.adminMessage = dbUser.adminMessage;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
