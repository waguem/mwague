import type { AuthOptions } from "next-auth";
import Keycloak from "next-auth/providers/keycloak";
import { refreshTokenRequest, logoutRequest } from "@/lib/oidc";
import { JWT } from "next-auth/jwt";
import { decodeToken } from "./lib/utils/index";

export const authOptions: AuthOptions = {
  providers: [
    Keycloak({
      clientId: process.env.AUTH_KEYCLOAK_ID ?? "",
      clientSecret: process.env.AUTH_KEYCLOAK_SECRET || "", // Add default value of an empty string
      issuer: process.env.AUTH_KEYCLOAK_ISSUER,
    }),
  ],
  events: {
    async signOut({ token }) {
      await logoutRequest(token.refreshToken);
    },
  },
  callbacks: {
    async session({ session, token }) {
      if (token?.accessToken) {
        session.accessToken = token.accessToken;
        session.user = token.user;
      }
      return session;
    },
    //@ts-ignore
    async jwt({ token, account }) {
      if (account) {
        if (account?.provider === "keycloak") {
          // decode access token
          const decoded = decodeToken(account?.access_token!);
          return {
            ...token,
            accessToken: account?.access_token || token?.accessToken,
            refreshToken: account?.refresh_token || token?.refreshToken,
            user: {
              email: decoded.email,
              name: decoded.name,
              preferred_username: decoded.preferred_username,
              given_name: decoded.given_name,
              family_name: decoded.family_name,
              officeId: decoded.officeId,
              organizationId: decoded.organizationId,
              roles: decoded.realm_access?.roles ?? [],
            },
          };
        }
      } else {
        if (token?.expires_in && Date.now() / 1000 < token.expires_in) {
          return token;
        }
        // if the token has expired then refresh it
        try {
          // refresh token
          if (!token?.refreshToken) return {} as JWT;
          const repsonse = await refreshTokenRequest(token.refreshToken);
          const tokens = await repsonse.data;
          if (repsonse.status !== 200) throw tokens;

          const decoded = decodeToken(tokens!.access_token!);
          return {
            ...token,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token ?? token.refresh_token,
            refresh_token_expired: tokens.refresh_expires_in ?? token.refresh_token_expired,
            expires_in: Math.floor(Date.now() / 1000 + tokens.expires_in),
            error: null,
            user: {
              email: decoded.email,
              name: decoded.name,
              officeId: decoded.officeId,
              organizationId: decoded.organizationId,
              preferred_username: decoded.preferred_username,
              given_name: decoded.given_name,
              family_name: decoded.family_name,
              roles: decoded.realm_access?.roles ?? [],
            },
          };
        } catch (e) {
          console.error(e);
          return {} as unknown as JWT;
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
