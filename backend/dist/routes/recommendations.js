"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ETFRecommendation_1 = __importDefault(require("../models/ETFRecommendation"));
const RebalancingAlert_1 = __importDefault(require("../models/RebalancingAlert"));
const router = (0, express_1.Router)();
// POST /api/recommendations/save
router.post('/save', async (req, res) => {
    try {
        const { userId, etfs } = req.body;
        await ETFRecommendation_1.default.deleteMany({ user_id: userId });
        const saved = await ETFRecommendation_1.default.insertMany(etfs.map((e) => ({ ...e, user_id: userId })));
        res.json({ data: saved, message: 'Saved' });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
});
// GET /api/recommendations/performance/:userId
router.get('/performance/:userId', async (req, res) => {
    try {
        const etfs = await ETFRecommendation_1.default.find({ user_id: req.params.userId });
        // Generate mock performance data if no actual data exists
        if (etfs.length === 0) {
            const now = Date.now();
            const day = 86400000;
            const data = Array.from({ length: 90 }, (_, i) => {
                const base = 250000;
                const noise = Math.sin(i * 0.4) * 8000 + i * 1200;
                return {
                    date: new Date(now - (89 - i) * day).toISOString().split('T')[0],
                    value: Math.round(base + noise),
                    benchmark: Math.round(base + i * 900 + Math.sin(i * 0.3) * 3000),
                };
            });
            res.json({ data });
            return;
        }
        res.json({ data: etfs });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
});
// GET /api/rebalancingAlerts/:userId
router.get('/:userId', async (req, res) => {
    try {
        const alerts = await RebalancingAlert_1.default.find({ user_id: req.params.userId }).sort({ createdAt: -1 });
        res.json({ data: alerts });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
});
// POST /api/rebalancingAlerts/:id/dismiss
router.post('/:id/dismiss', async (req, res) => {
    try {
        await RebalancingAlert_1.default.findByIdAndUpdate(req.params.id, { dismissed: true });
        res.json({ message: 'Dismissed' });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=recommendations.js.map