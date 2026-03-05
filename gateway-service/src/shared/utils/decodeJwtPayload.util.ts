export type JwtPayload = Record<string, unknown>;

export function decodeJwtPayload(token?: string): JwtPayload | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const json = Buffer.from(padded, 'base64').toString('utf8');
    const payload = JSON.parse(json) as JwtPayload;
    return payload && typeof payload === 'object' ? payload : null;
  } catch {
    return null;
  }
}
