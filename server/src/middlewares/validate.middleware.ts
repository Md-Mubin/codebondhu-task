import { Request, Response, NextFunction } from 'express';

// Placeholder validator middleware. Accepts a function that returns { valid: boolean, errors?: any }
export const validate = (fn: (body: any) => { valid: boolean; errors?: any }) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = fn(req.body);
        if (!result.valid) return res.status(400).json({ success: false, error: 'validation failed', details: result.errors });
        return next();
    };
};

export default validate;
