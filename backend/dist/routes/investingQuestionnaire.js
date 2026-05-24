"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const InvestingQuestionnaire_1 = __importDefault(require("../models/InvestingQuestionnaire"));
const User_1 = __importDefault(require("../models/User"));
const router = (0, express_1.Router)();
// POST /api/investingQuestionnaire/:userId
router.post('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        let q = await InvestingQuestionnaire_1.default.findOne({ user_id: userId });
        if (q) {
            Object.assign(q, req.body);
            await q.save();
        }
        else {
            q = await InvestingQuestionnaire_1.default.create({ ...req.body, user_id: userId });
            await User_1.default.findByIdAndUpdate(userId, { investingQuestionnaire: q._id });
        }
        res.json({ data: q, message: 'Saved' });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
});
// GET /api/investingQuestionnaire/:userId
router.get('/:userId', async (req, res) => {
    try {
        const q = await InvestingQuestionnaire_1.default.findOne({ user_id: req.params.userId });
        if (!q) {
            res.status(404).json({ message: 'Not found' });
            return;
        }
        res.json({ data: q });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=investingQuestionnaire.js.map