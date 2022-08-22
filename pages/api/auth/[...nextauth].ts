// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import NextAuth from "next-auth"
import TwitterProvider from "next-auth/providers/twitter"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    // TODO: validate that id and secret are valid
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID || '',
      clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
      version: "2.0", // opt-in to Twitter OAuth 2.0
    }),
  ],
})

