"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AdvisoryActivity_1 = __importDefault(require("../models/AdvisoryActivity"));
const router = (0, express_1.Router)();
// GET /api/advisoryActivity/:userId
router.get('/:userId', async (req, res) => {
    try {
        const userId = String(req.params.userId);
        const activities = await AdvisoryActivity_1.default.find({ user_id: userId }).sort({ date: -1 });
        res.json({ data: activities });
    }
    catch (err) {
        console.error('[advisoryActivity GET]', err);
        res.status(500).json({ message: 'Server error' });
    }
});
// POST /api/advisoryActivity/:userId
router.post('/:userId', async (req, res) => {
    try {
        const { type, title, advisor, status, notes, date } = req.body;
        const activity = await AdvisoryActivity_1.default.create({
            user_id: String(req.params.userId),
            type,
            title,
            advisor,
            status: status || 'scheduled',
            notes,
            date: date ? new Date(date) : new Date(),
        });
        res.status(201).json({ data: activity });
    }
    catch (err) {
        console.error('[advisoryActivity POST]', err);
        res.status(500).json({ message: 'Server error' });
    }
});
// PATCH /api/advisoryActivity/entry/:id
router.patch('/entry/:id', async (req, res) => {
    try {
        const activity = await AdvisoryActivity_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ data: activity });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=advisoryActivity.js.map