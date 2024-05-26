import { AuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import { refreshTokenRequest } from "@/lib/oidc";
import { JWT } from "next-auth/jwt";
export const authOptions: AuthOptions = {
  // debug:process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    KeycloakProvider({
      clientId: process.env.AUTH_KEYCLOAK_ID ?? "",
      clientSecret: process.env.AUTH_KEYCLOAK_SECRET || "", // Add default value of an empty string
      issuer: process.env.AUTH_KEYCLOAK_ISSUER,
    }),
  ],
  callbacks: {
    async session({ session, token, user }) {
      console.log("session : ",session)
      console.log("token : ",token)
      console.log("user : ",user)
      if (!token) return session;
      if (session.user) {
        session.user.name = token.name ?? "";
        session.user.email = token.email ?? "";
        // update to include more fields
      }
      session.error = token.error;
      session.access_token = token.access_token;
      console.log("Session After : ",session)
      return session;
    },
    async jwt({ token, profile, account, user }) {
      if (account && user) {
        token.access_token = account.access_token || "";
        token.refresh_token = account.refresh_token || "";
        token.access_token_expired = Date.now() + ((account.expires_at ?? 0) - 15) * 1000;
        return token;
      } else {
        try {
          // refresh token
          const repsonse = await refreshTokenRequest(token.refresh_token);
          const tokens = await repsonse.data;
          if (repsonse.status !== 200) throw tokens;

          return {
            ...token,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token ?? token.refresh_token,
            refresh_token_expired: tokens.refresh_expires_in ?? token.refresh_token_expired,
            expires_in: Math.floor(Date.now() / 1000 + tokens.expires_in),
            error: null,
          };
        } catch (e) {
          console.log(e);
          return null as unknown as JWT;
        }
      }
    },
  },
};
