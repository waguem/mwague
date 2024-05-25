import { getToken } from 'next-auth/jwt'
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(async (req)=>{
    const token = await getToken({req,secret:process.env.NEXTAUTH_SECRET})
    if(!token || (token.expires_in < Date.now() / 1000)){
        console.log("Redirect to login page")
        return NextResponse.redirect(new URL("/auth/login",req.url))
    }
},{
    pages:{
        signIn:"/auth/login"
    }
})

export const config = {
    matcher: [
        "/dashboard/:path*",
    ]
}