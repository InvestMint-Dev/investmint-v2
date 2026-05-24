"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Account_1 = __importDefault(require("../models/Account"));
class AccountService {
    async createAccount(account) {
        let acc;
        try {
            acc = await Account_1.default.findOne({ user_id: account.user_id, account_id: account.account_id });
            if (acc) {
                this.updateAccount(account);
                return acc.toObject();
            }
            acc = await Account_1.default.create(account);
            if (!acc) {
                throw new Error(`Mongoose failed to create account`);
            }
            return { id: acc._id.toString(), object: acc.toObject() };
        }
        catch (error) {
            throw new Error(`createAccount: ${error}`);
        }
    }
    async updateAccount(account) {
        let acc;
        try {
            const filter = { 'user_id': account.user_id };
            const query = account;
            const options = { new: true };
            acc = await Account_1.default.findOneAndUpdate(filter, query, options);
            if (!acc) {
                throw new Error(`Mongoose failed to update account`);
            }
            return { id: acc._id.toString(), object: acc.toObject() };
        }
        catch (error) {
            throw new Error(`updateAccount: ${error}`);
        }
    }
    async getAccountByName(userId, accountName) {
        let acc;
        try {
            acc = await Account_1.default.findOne({ user_id: userId, account_name: accountName });
            if (!acc) {
                throw new Error(`Mongoose failed to find account: ${accountName}`);
            }
            const acc_return = acc.toObject();
            return { id: acc._id.toString(), object: acc_return };
        }
        catch (error) {
            throw new Error(`getAccountByName: ${error}`);
        }
    }
    async getAccountById(userId, accountId) {
        let acc;
        try {
            acc = await Account_1.default.findOne({ user_id: userId, account_id: accountId });
            if (!acc) {
                throw new Error(`Mongoose failed to find account with id: ${accountId}`);
            }
            return { id: acc._id.toString(), object: acc.toObject() };
        }
        catch (error) {
            throw new Error(`getAccountById: ${error}`);
        }
    }
    async getAccounts(userId) {
        let acc;
        try {
            acc = await Account_1.default.find({ user_id: userId });
            if (!acc) {
                throw new Error(`Mongoose failed to get account`);
            }
            return acc;
        }
        catch (error) {
            throw new Error(`getAccounts: ${error}`);
        }
    }
    async getLastAcccountDate(userId) {
        try {
            const lastEntry = await Account_1.default.find({ user_id: new mongoose_1.default.Types.ObjectId(userId) }).sort({ updated_at: -1 }).limit(1);
            if (!lastEntry[0]) {
                return new Date('2000-01-01T00:00:00Z');
            }
            return lastEntry[0]?.updated_at;
        }
        catch (error) {
            throw new Error(`getLastAcccountDate: ${error}`);
        }
    }
}
exports.AccountService = AccountService;
//# sourceMappingURL=accountService.js.map