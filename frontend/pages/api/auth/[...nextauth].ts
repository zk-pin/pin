// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import NextAuth from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";
import prisma from "@utils/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXT_AUTH_SECRET,
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID || "",
      clientSecret: process.env.TWITTER_CLIENT_SECRET || "",
      version: "2.0", // opt-in to Twitter OAuth 2.0
    }),
  ],
  callbacks: {
    async session({
      session,
      user,
      token,
    }: {
      session: any;
      user: any;
      token: any;
    }) {
      // Send properties to the client, like an access_token from a provider.
      session.user = {
        ...user,
      };
      // @ts-ignore TODO:
      session.user.id = user.id;
      session.token = token;
      return session;
    },
  },
};

export default NextAuth(authOptions);
