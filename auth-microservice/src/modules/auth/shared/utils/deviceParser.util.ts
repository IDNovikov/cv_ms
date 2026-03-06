export function DeviceParser(userAgent: string) {
  const ua = (userAgent || '').toLowerCase();

  if (!ua) return 'Desktop';
  if (ua.includes('iphone') || ua.includes('android')) return 'Mobile';
  if (ua.includes('ipad') || ua.includes('tablet')) return 'Tablet';

  return 'Desktop';
}
