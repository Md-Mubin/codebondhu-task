import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../modals/user.model';

const JWT_SECRET: string | undefined = process.env.JWT_SECRET;

export const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = String(req.headers.authorization || '');
        if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ success: false, error: 'unauthorized' });

        const token = authHeader.replace(/^Bearer\s+/i, '').trim();
        if (!token) return res.status(401).json({ success: false, error: 'unauthorized' });

        if (!JWT_SECRET) return res.status(500).json({ success: false, error: 'server misconfigured' });

        const payload: any = jwt.verify(token, JWT_SECRET);
        if (!payload || !payload.userId) return res.status(401).json({ success: false, error: 'unauthorized' });

        const user = await UserModel.findById(payload.userId).select('-password').lean();
        if (!user || !user.isActive) return res.status(401).json({ success: false, error: 'unauthorized' });

        req.user = user as any;
        return next();
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message || 'Server Error' });
    }
};

export default auth;