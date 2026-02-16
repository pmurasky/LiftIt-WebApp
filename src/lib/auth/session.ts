export interface AuthSession {
  accessToken: string;
  expiresAt: number;
}

export function getAccessToken(_session: AuthSession | null): string | null {
  // Placeholder for Auth0 SDK integration.
  return _session?.accessToken ?? null;
}
