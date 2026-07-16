import { JwtPayload } from 'jsonwebtoken';
import type { SenderContext } from '../middleware/auth.js';

declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload; 
      sender?: SenderContext;
    }
  }
}
