export function DeviceParser(userAgent: string) {
  const ua = (userAgent || '').toLowerCase();
  if (ua.includes('iphone')) return 'iOS Phone';
  if (ua.includes('ipad')) return 'iOS Tablet';
  if (ua.includes('android') && ua.includes('mobile')) return 'Android Phone';
  if (ua.includes('android')) return 'Android Tablet';
  if (ua.includes('windows')) return 'Windows Desktop';
  if (ua.includes('mac os') || ua.includes('macintosh')) return 'Mac Desktop';
  if (ua.includes('linux')) return 'Linux Desktop';
  return 'Desktop';
}
