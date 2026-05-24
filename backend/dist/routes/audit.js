"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuditEntry_1 = __importDefault(require("../models/AuditEntry"));
const router = (0, express_1.Router)();
// GET /api/audit/:userId
router.get('/:userId', async (req, res) => {
    try {
        const userId = String(req.params.userId);
        const entries = await AuditEntry_1.default.find({ user_id: userId }).sort({ date: -1 });
        res.json({ data: entries });
    }
    catch (err) {
        console.error('[audit GET]', err);
        res.status(500).json({ message: 'Server error' });
    }
});
// POST /api/audit/:userId
router.post('/:userId', async (req, res) => {
    try {
        const { action, actor, detail, date } = req.body;
        const entry = await AuditEntry_1.default.create({
            user_id: String(req.params.userId),
            action,
            actor,
            detail,
            date: date ? new Date(date) : new Date(),
        });
        res.status(201).json({ data: entry });
    }
    catch (err) {
        console.error('[audit POST]', err);
        res.status(500).json({ message: 'Server error' });
    }
});
// DELETE /api/audit/:entryId
router.delete('/entry/:entryId', async (req, res) => {
    try {
        await AuditEntry_1.default.findByIdAndDelete(req.params.entryId);
        res.json({ message: 'Deleted' });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=audit.js.map