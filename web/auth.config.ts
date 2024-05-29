import type { AuthOptions } from "next-auth";
import Keycloak from "next-auth/providers/keycloak";
import { refreshTokenRequest } from "@/lib/oidc";
import { JWT } from "next-auth/jwt";
import logger from "@/lib/logger";

export const authOptions: AuthOptions = {
  providers: [
    Keycloak({
      clientId: process.env.AUTH_KEYCLOAK_ID ?? "",
      clientSecret: process.env.AUTH_KEYCLOAK_SECRET || "", // Add default value of an empty string
      issuer: process.env.AUTH_KEYCLOAK_ISSUER,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token?.accessToken) {
        session.accessToken = token.accessToken;
      }
      return session;
    },
    async jwt({ token, account }) {
      if (account) {
        if (account?.provider === "keycloak") {
          return {
            ...token,
            accessToken: token.accessToken,
            refreshToken: account?.refresh_token || token?.refreshToken,
          };
        }
      } else {
        if (token?.expires_in && Date.now() / 1000 < token.expires_in) {
          return token;
        }
        // if the token has expired then refresh it
        try {
          // refresh token
          if (!token?.refreshToken) return token;

          const repsonse = await refreshTokenRequest(token.refreshToken);
          const tokens = await repsonse.data;
          if (repsonse.status !== 200) throw tokens;

          return {
            ...token,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token ?? token.refresh_token,
            refresh_token_expired: tokens.refresh_expires_in ?? token.refresh_token_expired,
            expires_in: Math.floor(Date.now() / 1000 + tokens.expires_in),
            error: null,
          };
        } catch (e) {
          logger.error(e);
          return null as unknown as JWT;
        }
      }
      return token;
    },
  },
  debug: true,
  // debug: process.env.NODE_ENV === "development",
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/auth/login",
  },
};

export default authOptions;
