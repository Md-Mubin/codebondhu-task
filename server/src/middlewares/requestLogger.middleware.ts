import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, _res: Response, next: NextFunction) => {
  // basic logging for dev
  // eslint-disable-next-line no-console
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
};

export default requestLogger;
