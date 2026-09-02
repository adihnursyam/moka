import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

import { database } from "@/server/db/client";
import * as dbSchema from "@/server/db/schema";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? process.env.BASE_URL ?? "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(database, {
    provider: "sqlite",
    camelCase: true,
    schema: {
      user: dbSchema.authUsers,
      session: dbSchema.authSessions,
      account: dbSchema.authAccounts,
      verification: dbSchema.authVerifications,
    },
  }),
  emailAndPassword: { enabled: false },
  socialProviders: googleClientId && googleClientSecret ? {
    google: { clientId: googleClientId, clientSecret: googleClientSecret, prompt: "select_account" },
  } : {},
  plugins: [nextCookies()],
});
