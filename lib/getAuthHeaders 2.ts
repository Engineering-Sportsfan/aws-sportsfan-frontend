/**
 * getAuthHeaders.ts
 *
 * Reads the current NextAuth session (server-side) and returns the
 * x-user-* headers the backend uses to identify the caller.
 *
 * Call this inside any Next.js API-route handler (App Router) before
 * proxying a request to the backend so that auth is forwarded correctly
 * even though the two services live on different Vercel domains.
 */
import { auth } from "@/lib/auth.config";

export async function getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {};
    try {
        const session = await auth();
        if (session?.user) {
            const user = session.user as {
                email?: string | null;
                role?: string;
                userId?: string;
                name?: string | null;
            };

            if (user.email) {
                headers["x-user-email"] = user.email;
            }
            if (user.name) {
                headers["x-user-name"] = user.name;
            }
            const userId = (user as Record<string, unknown>)["userId"] as string | undefined;
            headers["x-user-id"] = userId || user.email || "unknown";
            headers["x-user-role"] = ((user as Record<string, unknown>)["role"] as string | undefined) || "user";
        }
    } catch (err) {
        // Non-fatal – the backend will simply treat the caller as unauthenticated
        console.error("[getAuthHeaders] Failed to read NextAuth session:", err);
    }
    return headers;
}
