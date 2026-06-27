import { Request, Response, NextFunction } from 'express';

export const rbac = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) return res.status(401).json({ success: false, error: 'unauthorized' });

        const role = String((req.user as any).role || '').toLowerCase();
        if (!role) return res.status(403).json({ success: false, error: 'forbidden' });
        
        const normalizedAllowedRoles = allowedRoles.map((item) => item.toLowerCase());
        if (normalizedAllowedRoles.includes(role)) return next();

        return res.status(403).json({ success: false, error: 'forbidden' });
    };
};

export default rbac;