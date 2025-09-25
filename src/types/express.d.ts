// Extend Express Request interface
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      user?: {
        id: string;
        email?: string;
        name?: string;
      };
    }
  }
}

export {};
