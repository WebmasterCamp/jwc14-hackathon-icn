import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import type { Role } from "@/generated/prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      role: Role;
      isProvider: boolean;
      image?: string | null;
    };
  }

  interface User {
    role: Role;
    isProvider: boolean;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
    isProvider: boolean;
    email?: string;
    name?: string | null;
    picture?: string | null;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Trust host configuration - critical for cookie setting
  trustHost: true,

  // Session cookies use Auth.js defaults: httpOnly, sameSite=lax, and (in
  // production) the Secure flag with the `__Secure-` name prefix. For the Secure
  // cookie to be issued, AUTH_URL MUST be an https:// origin in production.

  // Enable debug mode in development
  debug: process.env.NODE_ENV === "development",

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isProvider: user.isProvider,
          image: user.avatar,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (!existingUser) {
            // Create new user from Google OAuth, together with the matching
            // Customer profile row. Without the Customer row, customer-scoped
            // queries would see `customerId: undefined` and (pre-fix) leak data;
            // creating it here keeps the profile invariant that every CUSTOMER
            // has a Customer row.
            const newUser = await prisma.$transaction(async (tx) => {
              const createdUser = await tx.user.create({
                data: {
                  email: user.email!,
                  name: user.name,
                  avatar: user.image,
                  emailVerified: new Date(),
                  role: "USER", // OAuth users are customers (USER)
                },
              });

              await tx.customer.create({
                data: {
                  userId: createdUser.id,
                  // Placeholder profile — the user completes these in their
                  // dashboard. schoolType is a required enum with no neutral
                  // value, so it defaults to PRIMARY until edited.
                  schoolName: createdUser.name ?? "",
                  schoolType: "PRIMARY",
                },
              });

              return createdUser;
            });
            user.id = newUser.id;
            user.role = newUser.role;
            user.isProvider = newUser.isProvider;
          } else {
            user.id = existingUser.id;
            user.role = existingUser.role;
            user.isProvider = existingUser.isProvider;
          }
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger }) {
      // Initial sign in - add user data to token
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.isProvider = user.isProvider;
        token.email = user.email ?? undefined;
        token.name = user.name;
        token.picture = user.image;
      }

      // Refresh user data from database on update trigger
      // Note: This only runs on explicit session updates, not on every request
      if (trigger === "update" && token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.isProvider = dbUser.isProvider;
            token.name = dbUser.name;
            token.picture = dbUser.avatar;
          }
        } catch (error) {
          console.error("Error refreshing user data:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      // Populate session with token data
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.isProvider = token.isProvider;
        session.user.email = token.email as string;
        session.user.name = token.name as string | null;
        session.user.image = token.picture as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    // Shortened from 30 days. With the JWT strategy the token can't be revoked
    // server-side and role/identity is only refreshed on an explicit `update`
    // trigger (see jwt callback), so a stale or revoked session — e.g. a demoted
    // admin — persists until the token expires. A 7-day window bounds that risk.
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // keep the JWT lifetime aligned with the session
  },
});
