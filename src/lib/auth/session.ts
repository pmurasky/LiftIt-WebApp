import { auth0 } from "../auth0";

/**
 * Returns the Auth0 access token for the current server-side request.
 *
 * Use this inside Server Components, Route Handlers, and Server Actions to
 * obtain the Bearer token that must be forwarded to the Java backend.
 *
 * Returns null when the user has no active session (not logged in or session
 * has expired).
 */
export async function getAccessToken(): Promise<string | null> {
  const session = await auth0.getSession();
  return session?.tokenSet.accessToken ?? null;
}
