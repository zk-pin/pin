// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import NextAuth, { Account, Profile, User } from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { JWT } from "next-auth/jwt";

const prisma = new PrismaClient();

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXT_AUTH_SECRET,
  providers: [
    // TODO: validate that id and secret are valid
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID || "",
      clientSecret: process.env.TWITTER_CLIENT_SECRET || "",
      version: "2.0", // opt-in to Twitter OAuth 2.0
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // Send properties to the client, like an access_token from a provider.
      session.user = {
        ...user,
      };
      // @ts-ignore TODO:
      session.user.id = user.id;
      return session;
    },

    async jwt({
      token,
      account,
    }: {
      token: JWT;
      user?: User | undefined;
      account?: Account | undefined;
      profile?: Profile | undefined;
      isNewUser?: boolean | undefined;
    }) {
      if (account?.provider && !token[account.provider]) {
        token[account.provider] = {};
      }
      return token;
    },
  },
});
