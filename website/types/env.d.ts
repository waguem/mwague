declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production";
      ADMIN_USERS: string;
    }
  }
}

export {};
