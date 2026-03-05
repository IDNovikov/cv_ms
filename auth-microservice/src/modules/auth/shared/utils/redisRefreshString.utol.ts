export function redisRefreshString(id: string): string;

export function redisRefreshString(id: string, deviceId: string): string;

export function redisRefreshString(id: string, deviceId?: string): string {
  if (!id && !deviceId) return `refreshToken`;
  if (!deviceId) return `refreshToken:${id}`;
  return `refreshToken:${id}:${deviceId}`;
}
