"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Classification_1 = __importDefault(require("../models/Classification"));
const router = (0, express_1.Router)();
router.post('/saveClassifications', async (req, res) => {
    const { userId, classifications } = req.body;
    if (!userId || !Array.isArray(classifications))
        return res.status(400).json({ message: 'userId and classifications array required' });
    try {
        const ops = classifications.map((c) => ({
            updateOne: {
                filter: { user_id: userId, transaction_id: c.transactionId },
                update: {
                    $setOnInsert: {
                        user_id: userId, transaction_id: c.transactionId, memo: c.memo, amount: c.amount,
                        date: c.date, proposed_account_type: c.proposedAccountType, confidence: c.confidence,
                        source: c.source, status: 'pending', corrected_account_type: null,
                    },
                },
                upsert: true,
            },
        }));
        await Classification_1.default.bulkWrite(ops);
        return res.status(200).json({ saved: classifications.length });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal Server Error', error: `${error}` });
    }
});
router.get('/getClassifications', async (req, res) => {
    const { userId, status } = req.query;
    if (!userId)
        return res.status(400).json({ message: 'userId required' });
    try {
        const filter = { user_id: userId };
        if (status)
            filter.status = status;
        const items = await Classification_1.default.find(filter).sort({ confidence: 1 }).limit(50).lean();
        return res.status(200).json(items);
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal Server Error', error: `${error}` });
    }
});
router.post('/reviewClassification', async (req, res) => {
    const { classificationId, status, correctedAccountType } = req.body;
    if (!classificationId || !status)
        return res.status(400).json({ message: 'classificationId and status required' });
    try {
        const update = { status };
        if (correctedAccountType)
            update.corrected_account_type = correctedAccountType;
        const item = await Classification_1.default.findByIdAndUpdate(classificationId, update, { new: true });
        if (!item)
            return res.status(404).json({ message: 'Classification not found' });
        return res.status(200).json(item);
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal Server Error', error: `${error}` });
    }
});
exports.default = router;
//# sourceMappingURL=classifications.js.map