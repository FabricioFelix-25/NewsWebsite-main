export function getLoginDestination(from: unknown): string {
  // Only return to the editorial area of this application; never follow an external URL.
  return typeof from === 'string' && /^\/admin(?:\/|$)/.test(from) && !/[\\\r\n]/.test(from) ? from : '/admin';
}
