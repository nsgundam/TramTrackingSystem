import { JwtPayload } from 'jsonwebtoken';
import type { SenderContext } from '../middleware/auth.js';
import type { AdminPrincipal } from '../middleware/auth.js';

declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload; 
      admin?: AdminPrincipal;
      sender?: SenderContext;
      requestId?: string;
    }
  }
}
