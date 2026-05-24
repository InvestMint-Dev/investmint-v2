"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const crypto_1 = __importDefault(require("crypto"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// POST /api/auth/signup
router.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required' });
            return;
        }
        const existing = await User_1.default.findOne({ email });
        if (existing) {
            res.status(409).json({ message: 'Email already in use' });
            return;
        }
        const user = await User_1.default.create({ email, password });
        const token = (0, auth_1.signToken)(user._id.toString());
        res.status(201).json({
            userId: user._id,
            data_from: user.data_from,
            token,
            message: 'Account created',
        });
    }
    catch (err) {
        console.error('[signup]', err);
        res.status(500).json({ message: 'Server error' });
    }
});
// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.default.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
        const token = (0, auth_1.signToken)(user._id.toString());
        res.json({
            userId: user._id,
            data_from: user.data_from,
            role: user.role,
            token,
            message: 'Logged in',
        });
    }
    catch (err) {
        console.error('[login]', err);
        res.status(500).json({ message: 'Server error' });
    }
});
// GET /api/auth/:userId
router.get('/:userId', async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.userId).select('-password -passwordResetToken');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json({ data: user });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
});
// PUT /api/auth/update-data-from/:userId
router.put('/update-data-from/:userId', async (req, res) => {
    try {
        const { data_from } = req.body;
        await User_1.default.findByIdAndUpdate(req.params.userId, { data_from });
        res.json({ message: 'Updated' });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
});
// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User_1.default.findOne({ email });
        if (!user) {
            res.json({ message: 'If that email exists, a reset link was sent.' });
            return;
        }
        const token = crypto_1.default.randomBytes(32).toString('hex');
        user.passwordResetToken = crypto_1.default.createHash('sha256').update(token).digest('hex');
        user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
        await user.save({ validateBeforeSave: false });
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            const transporter = nodemailer_1.default.createTransport({
                service: 'Gmail',
                auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
            });
            await transporter.sendMail({
                to: email,
                subject: 'InvestMint – Reset your password',
                html: `<p>Click the link below to reset your password. It expires in 1 hour.</p><a href="${resetUrl}">${resetUrl}</a>`,
            });
        }
        res.json({ message: 'If that email exists, a reset link was sent.' });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
});
// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;
        const hashed = crypto_1.default.createHash('sha256').update(token).digest('hex');
        const user = await User_1.default.findOne({
            passwordResetToken: hashed,
            passwordResetExpires: { $gt: new Date() },
        });
        if (!user) {
            res.status(400).json({ message: 'Token is invalid or expired' });
            return;
        }
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        res.json({ message: 'Password reset successful' });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
});
// POST /api/auth/change-password
router.post('/change-password', async (req, res) => {
    try {
        const { userId, currentPassword, newPassword } = req.body;
        const user = await User_1.default.findById(userId).select('+password');
        if (!user || !(await user.comparePassword(currentPassword))) {
            res.status(401).json({ message: 'Current password is incorrect' });
            return;
        }
        user.password = newPassword;
        await user.save();
        res.json({ message: 'Password changed' });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map