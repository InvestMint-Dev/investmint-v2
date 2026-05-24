"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.signToken = signToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'investmint-dev-secret';
function requireAuth(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
        res.status(401).json({ message: 'No token provided' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    }
    catch {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
}
function signToken(userId) {
    return jsonwebtoken_1.default.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
}
//# sourceMappingURL=auth.js.map