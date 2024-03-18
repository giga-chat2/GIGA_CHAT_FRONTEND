import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import TwitterProvider from "next-auth/providers/twitter";

export const authOptions={
  providers : [
    GoogleProvider({
      clientId :process.env.NEXT_GOOGLE_ID as string,
      clientSecret:process.env.NEXT_GOOGLE_CLIENT_SECRET as string
    }),
    GithubProvider({
      clientId:process.env.NEXT_GITHUB_ID as string,
      clientSecret:process.env.NEXT_GITHUB_SECRET as string
    }),
    TwitterProvider({
      clientId:process.env.NEXT_TWITTER_ID as string,
      clientSecret:process.env.NEXT_TWITTER_SECRET as string,
      version:"2.0"
    }),
    
  ]
}


const handler = NextAuth(authOptions)
export {handler as GET , handler as POST}