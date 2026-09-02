import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/server/auth/config";

export const { GET, POST } = toNextJsHandler(auth);
