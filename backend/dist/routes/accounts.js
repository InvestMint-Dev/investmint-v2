"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const accountService_1 = require("../services/accountService");
const Account_1 = __importDefault(require("../models/Account"));
const excel_1 = require("../utils/excel");
const router = (0, express_1.Router)();
const accountService = new accountService_1.AccountService();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
router.post('/addAccountExcel', upload.single('data'), async (req, res) => {
    const { userId } = req.body;
    if (!req.file)
        return res.status(400).json({ message: 'No file uploaded' });
    const data = (0, excel_1.parseExcelFile)(req.file.buffer);
    try {
        for (const acc of data) {
            const account = {
                user_id: userId,
                account_type: acc.account_type,
                account_name: acc.account_name,
                currency: acc.currency,
                account_balance: acc.account_balance || null,
                account_id: acc.account_id || crypto.randomUUID(),
                created_at: acc.created_at || null,
                updated_at: acc.updated_at || null,
                status: acc.status || null,
            };
            await accountService.createAccount(account);
        }
        return res.status(200).json({ message: 'Accounts added successfully' });
    }
    catch (error) {
        console.error('[addAccountExcel]', error);
        return res.status(500).json({ message: 'Internal Server Error', error: `${error}` });
    }
});
router.post('/getAccounts', async (req, res) => {
    const { userId } = req.body;
    try {
        const accounts = await accountService.getAccounts(userId);
        return res.status(200).json({ data: accounts });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal Server Error', error: `${error}` });
    }
});
router.put('/updateAccount', async (req, res) => {
    const { userId, account_id, account_name, account_type, account_balance, currency, status } = req.body;
    if (!userId || !account_id)
        return res.status(400).json({ message: 'userId and account_id are required' });
    try {
        const account = {
            user_id: userId, account_id,
            account_name: account_name ?? null,
            account_type: account_type ?? null,
            account_balance: account_balance != null ? parseFloat(account_balance) : null,
            currency: currency ?? null,
            status: status ?? null,
            created_at: null,
            updated_at: new Date(),
        };
        const result = await accountService.updateAccount(account);
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal Server Error', error: `${error}` });
    }
});
router.delete('/deleteAccount', async (req, res) => {
    const { userId, account_id } = req.body;
    if (!userId || !account_id)
        return res.status(400).json({ message: 'userId and account_id are required' });
    try {
        await Account_1.default.deleteOne({ user_id: userId, account_id });
        return res.status(200).json({ message: 'Account deleted' });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal Server Error', error: `${error}` });
    }
});
exports.default = router;
//# sourceMappingURL=accounts.js.map