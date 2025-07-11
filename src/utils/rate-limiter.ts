/**
 * Rate Limiter Implementation
 * Controls API request rates to prevent exceeding service limits
 */

export interface RateLimiterConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
}

interface RequestRecord {
  timestamp: number;
}

export class RateLimiter {
  private config: RateLimiterConfig;
  private minuteRequests: RequestRecord[] = [];
  private hourRequests: RequestRecord[] = [];

  constructor(config: RateLimiterConfig) {
    this.config = config;
  }

  async waitForAvailableSlot(): Promise<void> {
    const now = Date.now();
    
    // Clean old requests
    this.cleanOldRequests(now);

    // Check if we can make a request
    if (this.canMakeRequest()) {
      this.recordRequest(now);
      return;
    }

    // Calculate wait time
    const waitTime = this.calculateWaitTime(now);
    if (waitTime > 0) {
      await this.sleep(waitTime);
      return this.waitForAvailableSlot();
    }
  }

  private canMakeRequest(): boolean {
    return this.minuteRequests.length < this.config.requestsPerMinute &&
           this.hourRequests.length < this.config.requestsPerHour;
  }

  private cleanOldRequests(now: number): void {
    const oneMinuteAgo = now - 60 * 1000;
    const oneHourAgo = now - 60 * 60 * 1000;

    this.minuteRequests = this.minuteRequests.filter(req => req.timestamp > oneMinuteAgo);
    this.hourRequests = this.hourRequests.filter(req => req.timestamp > oneHourAgo);
  }

  private recordRequest(timestamp: number): void {
    const record = { timestamp };
    this.minuteRequests.push(record);
    this.hourRequests.push(record);
  }

  private calculateWaitTime(now: number): number {
    if (this.minuteRequests.length >= this.config.requestsPerMinute) {
      const oldestRequest = this.minuteRequests[0];
      return (oldestRequest.timestamp + 60 * 1000) - now;
    }

    if (this.hourRequests.length >= this.config.requestsPerHour) {
      const oldestRequest = this.hourRequests[0];
      return (oldestRequest.timestamp + 60 * 60 * 1000) - now;
    }

    return 0;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStatus(): { minuteRequests: number; hourRequests: number; } {
    const now = Date.now();
    this.cleanOldRequests(now);
    
    return {
      minuteRequests: this.minuteRequests.length,
      hourRequests: this.hourRequests.length
    };
  }
}

// Legacy compatibility export
export const rateLimiter = new RateLimiter({
  requestsPerMinute: 60,
  requestsPerHour: 1000
});
