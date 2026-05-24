"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
const CompanyInformation_1 = __importDefault(require("../models/CompanyInformation"));
const ETFRecommendation_1 = __importDefault(require("../models/ETFRecommendation"));
const RebalancingAlert_1 = __importDefault(require("../models/RebalancingAlert"));
const InvestingQuestionnaire_1 = __importDefault(require("../models/InvestingQuestionnaire"));
const AuditEntry_1 = __importDefault(require("../models/AuditEntry"));
const AdvisoryActivity_1 = __importDefault(require("../models/AdvisoryActivity"));
const router = (0, express_1.Router)();
// GET /api/advisor/:advisorId/clients — all clients assigned to this advisor
router.get('/:advisorId/clients', async (req, res) => {
    try {
        const clients = await User_1.default.find({ advisorId: req.params.advisorId, $or: [{ role: 'client' }, { role: { $exists: false } }] })
            .select('-password -passwordResetToken');
        const enriched = await Promise.all(clients.map(async (client) => {
            const company = await CompanyInformation_1.default.findOne({ user_id: client._id });
            const alertCount = await RebalancingAlert_1.default.countDocuments({ user_id: client._id, dismissed: false });
            const lastAudit = await AuditEntry_1.default.findOne({ user_id: client._id.toString() }).sort({ date: -1 });
            return {
                ...client.toObject(),
                companyName: company?.companyName || null,
                activeAlerts: alertCount,
                lastActivity: lastAudit?.date || null,
            };
        }));
        res.json({ data: enriched });
    }
    catch (err) {
        console.error('[advisor clients]', err);
        res.status(500).json({ message: 'Server error' });
    }
});
// GET /api/advisor/:advisorId/client/:clientId — full detail for one client
router.get('/:advisorId/client/:clientId', async (req, res) => {
    try {
        const client = await User_1.default.findOne({ _id: req.params.clientId })
            .select('-password -passwordResetToken');
        if (!client) {
            res.status(404).json({ message: 'Client not found' });
            return;
        }
        const [company, etfs, alerts, audit, activity] = await Promise.all([
            CompanyInformation_1.default.findOne({ user_id: client._id }),
            ETFRecommendation_1.default.find({ user_id: client._id }),
            RebalancingAlert_1.default.find({ user_id: client._id }).sort({ createdAt: -1 }),
            AuditEntry_1.default.find({ user_id: client._id.toString() }).sort({ date: -1 }),
            AdvisoryActivity_1.default.find({ user_id: client._id.toString() }).sort({ date: -1 }),
        ]);
        res.json({ data: { client, company, etfs, alerts, audit, activity } });
    }
    catch (err) {
        console.error('[advisor client detail]', err);
        res.status(500).json({ message: 'Server error' });
    }
});
// PUT /api/advisor/assign — assign a client to an advisor
router.put('/assign', async (req, res) => {
    try {
        const { clientId, advisorId } = req.body;
        await User_1.default.findByIdAndUpdate(clientId, { advisorId });
        res.json({ message: 'Client assigned' });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});
// GET /api/advisor/clients/all — list all client accounts with their assigned advisor
router.get('/clients/all', async (req, res) => {
    try {
        const clients = await User_1.default.find({ $or: [{ role: 'client' }, { role: { $exists: false } }] })
            .select('email advisorId data_from companyInformation');
        const enriched = await Promise.all(clients.map(async (client) => {
            const company = await CompanyInformation_1.default.findOne({ user_id: client._id }).select('companyName');
            return { ...client.toObject(), companyName: company?.companyName || null };
        }));
        res.json({ data: enriched });
    }
    catch (err) {
        console.error('[advisor clients all]', err);
        res.status(500).json({ message: 'Server error' });
    }
});
// GET /api/advisor/all — list all advisor accounts
router.get('/all', async (req, res) => {
    try {
        const advisors = await User_1.default.find({ role: 'advisor' }).select('-password -passwordResetToken');
        res.json({ data: advisors });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});
// POST /api/advisor/create — create a new advisor account (advisor-only action)
router.post('/create', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required' });
            return;
        }
        const existing = await User_1.default.findOne({ email });
        if (existing) {
            // Already exists — just promote to advisor
            existing.role = 'advisor';
            await existing.save();
            res.json({ message: 'Existing account promoted to advisor', userId: existing._id });
            return;
        }
        const advisor = await User_1.default.create({ email, password, role: 'advisor', data_from: 'advisor' });
        res.status(201).json({ message: 'Advisor account created', userId: advisor._id });
    }
    catch (err) {
        console.error('[advisor create]', err);
        res.status(500).json({ message: 'Server error' });
    }
});
// DELETE /api/advisor/user/:userId — delete user and all associated documents
router.delete('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            res.status(400).json({ message: 'Invalid user ID' });
            return;
        }
        const objectId = new mongoose_1.default.Types.ObjectId(userId);
        const userIdStr = userId;
        await Promise.all([
            CompanyInformation_1.default.deleteMany({ user_id: objectId }),
            ETFRecommendation_1.default.deleteMany({ user_id: objectId }),
            RebalancingAlert_1.default.deleteMany({ user_id: objectId }),
            InvestingQuestionnaire_1.default.deleteMany({ user_id: objectId }),
            AuditEntry_1.default.deleteMany({ user_id: userIdStr }),
            AdvisoryActivity_1.default.deleteMany({ user_id: userIdStr }),
        ]);
        await User_1.default.findByIdAndDelete(objectId);
        res.json({ message: 'User and all associated data deleted' });
    }
    catch (err) {
        console.error('[advisor delete user]', err);
        res.status(500).json({ message: 'Server error' });
    }
});
// POST /api/advisor/promote — promote an existing user to advisor by email
router.post('/promote', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ message: 'Email is required' });
            return;
        }
        const user = await User_1.default.findOne({ email });
        if (!user) {
            res.status(404).json({ message: 'No account found with that email' });
            return;
        }
        user.role = 'advisor';
        await user.save();
        res.json({ message: 'User promoted to advisor', userId: user._id });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=advisor.js.map