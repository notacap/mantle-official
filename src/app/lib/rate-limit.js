import { checkRateLimit } from '@vercel/firewall';

// Each ID must have a matching "@vercel/firewall" rule in the Vercel dashboard
// (Firewall → Configure → New Rule). The dashboard rule sets the actual
// threshold and window; without it, requests are never limited.
export const RATE_LIMITS = {
  formSubmit: 'form-submit', // contact, newsletter, review forms
  payment: 'payment',        // PayPal create/capture, BOGO validation
};

// Returns a 429 Response when the caller is over the limit, otherwise null.
// Fails open (returns null) on timeouts or errors so a limiter outage — or
// local dev, where there is no Vercel firewall — never blocks real customers.
export async function enforceRateLimit(request, rateLimitId) {
  try {
    const { rateLimited } = await checkRateLimit(rateLimitId, { request, timeout: 500 });
    if (!rateLimited) return null;

    return new Response(
      JSON.stringify({
        error: 'Too many requests',
        message: 'Please wait a moment and try again.',
      }),
      {
        status: 429,
        headers: { 'Content-Type': 'application/json', 'Retry-After': '60' },
      }
    );
  } catch (error) {
    console.warn(`Rate-limit check failed for "${rateLimitId}", allowing request:`, error?.message);
    return null;
  }
}
