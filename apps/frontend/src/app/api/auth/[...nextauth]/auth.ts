import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import TwitterProvider from "next-auth/providers/twitter";
import FacebookProvider from "next-auth/providers/facebook";

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
      clientId:'ODBmODJnbmNQbTVlUk1JM0dfQ2E6MTpjaQ',
      clientSecret:'fwy93lHFybjubOi1koHF3pmWzoQ8MbVPLUb0CrT0xULF-tg1bd',
      version:"2.0"
    }),
    FacebookProvider({
      clientId:'805763111466139',
      clientSecret:'2f98a79e7202c96c1050b664ab10875b'
    })
    
  ]
}
