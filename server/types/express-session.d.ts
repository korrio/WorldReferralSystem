import 'express-session';
import { User } from '@shared/auth-schema';

declare module 'express-session' {
  interface SessionData {
    user?: User;
  }
}