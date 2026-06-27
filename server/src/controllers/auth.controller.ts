import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel } from '../modals/user.model';

const JWT_SECRET: any = process.env.JWT_SECRET;

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, error: 'email and password required' });

        const existing = await UserModel.findOne({ email });
        if (existing) return res.status(409).json({ success: false, error: 'email already registered' });

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        const user = await UserModel.create({ email, password: passwordHash, name });
        const payload = { userId: user._id };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

        return res.status(201).json({ success: true, data: { user: { id: user._id, email: user.email, name: user.name }, token } });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message || 'Server Error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, error: 'email and password required' });
        const user = await UserModel.findOne({ email });
        if (!user) return res.status(401).json({ success: false, error: 'Invalid Credentials' });

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return res.status(401).json({ success: false, error: 'Invalid Credentials' });

        const payload = { userId: user._id };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
        const userData = user.toObject() as any;
        delete userData.password;

        return res.status(200).json({ success: true, data: { token, user: userData } });
    } catch (err: any) {
        return res.status(500).json({ success: false, error: err.message || 'Server Error' });
    }
};

export default { register, login };
