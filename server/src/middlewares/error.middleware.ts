import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
    // simple centralized error handler
    // eslint-disable-next-line no-console
    console.error(err);
    const status = err.status || 500;
    const message = err.message || 'internal server error';
    res.status(status).json({ success: false, error: message });
};

export default errorHandler;
