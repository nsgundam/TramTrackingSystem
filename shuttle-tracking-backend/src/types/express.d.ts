import { JwtPayload } from 'jsonwebtoken';
import type { SenderContext, SenderIdentity } from '../middleware/auth.js';
import type { AdminPrincipal } from '../middleware/auth.js';

declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload; 
      admin?: AdminPrincipal;
      senderIdentity?: SenderIdentity;
      sender?: SenderContext;
      requestId?: string;
    }
  }
}
