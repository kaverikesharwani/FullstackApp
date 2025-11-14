import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth({
  // Matches the pages config in `[...nextauth]`
  pages: {
    signIn: "/login",
    error: "/error",
  },
})

export const config = {
    matcher : [
        "/((?!_next/static|_next/image|favicon.ico|public/).*)",
    ]
}