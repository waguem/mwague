import { AuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import { refreshTokenRequest, logoutRequest } from "@/lib/oidc";
import { JWT } from "next-auth/jwt";
export const authOptions: AuthOptions = {
  // add keycloak provider
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID ?? "",
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || "", // Add default value of an empty string
      issuer: process.env.KEYCLOAK_ISSUER,
    }),
  ],
  events: {
    async signIn(message: any) {
      console.log("signIn event", message);
    },
    async signOut({ token }) {
      await logoutRequest(token.refresh_token);
    },
  },
  callbacks: {
    async session({ session, token }) {
      if (!token) return session;
      if (session.user) {
        session.user.name = token.name ?? "";
        session.user.email = token.email ?? "";
        // update to include more fields
      }
      session.error = token.error;
      session.access_token = token.access_token;
      return session;
    },
    async jwt({ token, user, account }) {
      // Handle JWT token creation and refreshing
      if (account && user) {
        // Update token with account information
        token.access_token = account.access_token || ""; // Add default value of an empty string
        token.refresh_token = account.refresh_token || "";
        token.access_token_expired = Date.now() + ((account.expires_at ?? 0) - 15) * 1000; // Add nullish coalescing operator to provide default value of 0
        return token;
      } else {
        try {
          // Send a post request to refresh the token
          const response = await refreshTokenRequest(token.refresh_token);
          const tokens = await response.data;
          if (response.status !== 200) throw tokens;
          // Update token with refreshed information
          return {
            ...token,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token ?? token.refresh_token,
            refresh_token_expired: tokens.refresh_expires_in ?? token.refresh_token_expired,
            expires_in: Math.floor(Date.now() / 1000 + tokens.expires_in),
            error: null,
          };
        } catch (e) {
          return null as unknown as JWT;
        }
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV !== "production"
};
