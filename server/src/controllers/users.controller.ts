import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { UserModel } from '../modals/user.model';

export const createUser = async (req: Request, res: Response) => {
    try {
        const { email, password, name, role } = req.body;
        if (!email || !password || !role) return res.status(400).json({ success: false, error: 'All Fields required' });
        const existing = await UserModel.findOne({ email });
        if (existing) return res.status(409).json({ success: false, error: 'Email already exists' });
        if(role === 'admin') return res.status(403).json({ success: false, error: 'Cannot create admin user' });
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await UserModel.create({ email, password: passwordHash, name, role });
        return res.status(201).json({ success: true, data: { id: user._id, email: user.email, name: user.name, role: user.role } });
    } catch (err: any) {
        return res.status(400).json({ success: false, error: err.message || 'Server Error' });
    }
};

export const listUsers = async (_req: Request, res: Response) => {
    const users = await UserModel.find({ role: { $ne: 'admin' } }).select('-password').lean();
    return res.status(200).json({ success: true, data: users });
};

export const getUser = async (req: Request, res: Response) => {
    const u = await UserModel.findById(req.params.id).select('-password').lean();
    if (!u) return res.status(404).json({ success: false, error: 'not found' });
    return res.status(200).json({ success: true, data: u });
};

export const updateUser = async (req: Request, res: Response) => {
    const currentUserId = (req.user as any)?._id;
    const targetUserId = req.params.id;
    if (req.body.password) delete req.body.password; // password change should be separate
    // Prevent users from modifying their own role to prevent privilege escalation
    if (currentUserId && targetUserId === currentUserId && req.body.role) {
        return res.status(403).json({ success: false, error: 'Cannot modify own role' });
    }
    const updated = await UserModel.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    if (!updated) return res.status(404).json({ success: false, error: 'not found' });
    return res.status(200).json({ success: true, data: updated });
};

export const deleteUser = async (req: Request, res: Response) => {
    const updated = await UserModel.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).select('-password');
    if (!updated) return res.status(404).json({ success: false, error: 'not found' });
    return res.status(204).json({ success: true, data: null });
};

export default { createUser, listUsers, getUser, updateUser, deleteUser };
