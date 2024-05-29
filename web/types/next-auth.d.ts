/* eslint-disable no-unused-vars */

import { DefaultJWT } from "next-auth/jwt";
import { DefaultSession } from "next-auth";
// Declare custom types for NextAuth modules
declare module "next-auth" {
  // Define custom session properties
  interface Session {
    user: {
      sub: string;
      email_verified: boolean;
      name: string;
      preferred_username: string;
      given_name: string;
      family_name: string;
      email: string;
      id: string;
      org_name?: string;
      telephone?: string;
    };
    error?: string | null;
    accessToken: (string & DefaultSession) | any;
  }
}

// Declare custom JWT properties
declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string & DefaultJWT;
    refreshToken: string;
    refresh_expires_in: number;
    expires_in: number;
    user: {
      sub: string;
      email_verified: boolean;
      name: string;
      family_name: string;
      email: string;
      telephone: string;
      preferred_username: string;
      org_name: string;
      given_name: string;
      id: string;
    };
    error?: string | null;
  }

  // Define custom account properties
  interface Account {
    provider: string;
    type: ProviderType;
    id: string;
    accessToken: string;
    refresh_token: string;
    idToken: string;
    expires_in: number;
    refresh_expires_in: number;
    token_type: string;
    id_token: string;
    "not-before-policy": number;
    session_state: string;
    scope: string;
  }

  // Define custom profile properties
  interface Profile {
    sub?: string;
    email_verified: boolean;
    name?: string;
    telephone: string;
    preferred_username: string;
    org_name: string;
    given_name: string;
    family_name: string;
    email?: string;
  }
}
