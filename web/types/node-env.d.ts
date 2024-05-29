// eslint-disable-next-line
declare namespace NodeJS {
  export interface ProcessEnv {
    AUTH_KEYCLOAK_ID: string;
    AUTH_KEYCLOAK_SECRET: string;
    AUTH_KEYCLOAK_ISSUER: string;
    AUTH_SECRET: string;
    NEXT_PUBLIC_API_BASE_URL: string;
    WEB_DOMAIN: string;
    NODE_ENV: "development" | "production";
    OPENAPI_INPUT: string;
    DATABASE_URL: string;
  }
}
