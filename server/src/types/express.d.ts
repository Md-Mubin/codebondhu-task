import { IUser } from '../modals/user.model';

declare global {
  namespace Express {
    interface Request {
      user?: IUser | null;
    }
  }
}

export {};
