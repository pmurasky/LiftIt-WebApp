import { Auth0Client } from "@auth0/nextjs-auth0/server";

/**
 * Singleton Auth0 client used throughout the application on the server side.
 *
 * Configuration is loaded from environment variables:
 *   AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_SECRET
 *
 * See .env.example for the full list of required variables.
 */
export const auth0 = new Auth0Client();
