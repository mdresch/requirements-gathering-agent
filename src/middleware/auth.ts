import { Request, Response, NextFunction } from 'express';
export default function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // Placeholder: allow all requests
  next();
}
