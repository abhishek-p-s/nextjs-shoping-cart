import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./db/db-connect";
import { compareSync } from "bcrypt-ts";
import type { NextAuthConfig } from "next-auth";

export const config ={
providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "<email>" },
        password: {
          label: "Password",
          type: "password",
          placeholder: "<password>",
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });
        const isMatch = compareSync(
          credentials.password as string,
          user?.password || ""
        );
        if (user && isMatch) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, user, trigger, token }: any) {
      session.user.id = token.sub;
      if(trigger === "update" ){
        session.user.name = user.name;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
} satisfies NextAuthConfig


export const { handlers, signIn, signOut, auth } = NextAuth(config);
