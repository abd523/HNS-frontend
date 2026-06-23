// lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    // Points to the catch-all API route we built earlier
    baseURL: process.env.NEXT_PUBLIC_APP_URL || window.location.origin
});