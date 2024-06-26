/* eslint-disable no-unused-vars */

import { DefaultJWT } from "next-auth/jwt";
import { DefaultSession } from "next-auth";
// Declare custom types for NextAuth modules
declare module "next-auth" {
  // Define custom session properties
  interface Session {
    user: {
      name: string;
      email: string;
      roles: string[];
      officeId: string;
      organizationId: string;
    };
    error?: string | null;
    accessToken: (string & DefaultSession) | any;
  }
}

// Declare custom JWT properties
declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    refreshToken: string;
    refresh_expires_in: number;
    expires_in: number;
    user: {
      name: string;
      family_name: string;
      email: string;
      preferred_username: string;
      organizationId: string;
      officeId: string;
      given_name: string;
      id: string;
      roles: string[];
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
