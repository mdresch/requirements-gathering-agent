// src/utils/retry.ts
// Generic retry utility with exponential backoff and support for Retry-After

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 5,
  initialDelay = 1000,
  maxDelay = 25000,
  jitter = true
): Promise<T> {
  let attempt = 0;
  let delay = initialDelay;
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (err: any) {
      // Check for HTTP 429 or explicit retryAfter/retryDelay
      const status = err.status || err.code;
      if (status === 429 || status === 'TooManyRequests') {
        // Prefer Retry-After header or error property
        const retryAfter =
          (typeof err.retryAfter === 'number' && err.retryAfter > 0)
            ? err.retryAfter
            : (typeof err.retryDelay === 'number' && err.retryDelay > 0)
              ? err.retryDelay
              : delay;
        if (typeof err.message === 'string') {
          console.warn(`⚠️ Retryable error (rate limit): ${err.message}`);
        }
        await new Promise(res => setTimeout(res, retryAfter));
        delay = Math.min(delay * 2, maxDelay); // Exponential backoff
      } else {
        if (typeof err.message === 'string') {
          console.warn(`⚠️ Retryable error: ${err.message}`);
        }
        // Add jitter to avoid thundering herd
        if (jitter) {
          delay = Math.floor(delay * (0.85 + Math.random() * 0.3));
        }
        await new Promise(res => setTimeout(res, delay));
        delay = Math.min(delay * 2, maxDelay);
      }
    }
    attempt++;
  }
  throw new Error(`Max retries (${maxRetries}) exceeded in withRetry`);
}
