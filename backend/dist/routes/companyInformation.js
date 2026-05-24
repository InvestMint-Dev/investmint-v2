"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CompanyInformation_1 = __importDefault(require("../models/CompanyInformation"));
const User_1 = __importDefault(require("../models/User"));
const router = (0, express_1.Router)();
// POST /api/companyInformation/:userId — create or update
router.post('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        let company = await CompanyInformation_1.default.findOne({ user_id: userId });
        if (company) {
            Object.assign(company, req.body);
            await company.save();
        }
        else {
            company = await CompanyInformation_1.default.create({ ...req.body, user_id: userId });
            await User_1.default.findByIdAndUpdate(userId, { companyInformation: company._id });
        }
        res.json({ data: company, message: 'Saved' });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
});
// PATCH /api/companyInformation/:userId — update personnel and accounts
router.patch('/:userId', async (req, res) => {
    try {
        const company = await CompanyInformation_1.default.findOneAndUpdate({ user_id: req.params.userId }, { $set: req.body }, { new: true, upsert: true });
        res.json({ data: company, message: 'Updated' });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
});
// GET /api/companyInformation/:userId
router.get('/:userId', async (req, res) => {
    try {
        const company = await CompanyInformation_1.default.findOne({ user_id: req.params.userId });
        if (!company) {
            res.status(404).json({ message: 'Not found' });
            return;
        }
        res.json({ data: company });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=companyInformation.js.map