export type BrowserEnv = Pick<typeof process.env, "NODE_ENV" | "ADMIN_USERS">;

export const getEnv = (): BrowserEnv => {
  if (typeof window !== "undefined") {
    return (window as unknown as { __env: BrowserEnv }).__env || ({} as BrowserEnv);
  }
  return process.env;
};
