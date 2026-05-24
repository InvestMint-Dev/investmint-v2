"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Transaction_1 = __importDefault(require("../models/Transaction"));
const reportService_1 = require("./reportService");
const reportService = new reportService_1.ReportsService();
class TransactionsService {
    constructor() {
        this.accountTypeEffect = {
            "ACCOUNTS_PAYABLE": -1,
            "ACCOUNTS_RECEIVABLE": -1,
            "CREDIT_CARD": -1,
            "FIXED_ASSET": -1,
            "LIABILITY": -1,
            "EQUITY": -1,
            "REVENUE": 1,
            "EXPENSE": -1,
            "OTHER": 1
        };
        // async deleteByDate(userId: string, date: Date) {
        //     try {
        //         await TransactionsModel.deleteMany({'user_id': new mongoose.Types.ObjectId(userId), 'date': date})
        //     } catch(error: unknown) {
        //         throw new Error(`Failed to delete transaction. Reason: ${error}`)
        //     }
        // }
        // async getTransactions(userId: string, startDate: Date, authInfo: QuickbooksAuthDTO = null) {
        //     if (!authInfo) {
        //         authInfo = await authService.getAuthInfo(userId)
        //     }
        //     await this.deleteByDate(userId, startDate)
        //     const access_token: string = authInfo.access_token
        //     const realmId: string = authInfo.realMld
        //     const end_date: string = new Date().toISOString().split('T')[0];
        //     const start_date: string = startDate.toISOString().split('T')[0];
        //     try {
        //         const URL: string = `${process.env.BASE_API_URL}${realmId}/reports/TransactionList?start_date=${start_date}&end_date=${end_date}&source_account_type=Bank&minorversion=73`;
        //         const response = await fetch(URL, {
        //             method: 'GET',
        //             headers: {
        //                 Authorization: `Bearer ${access_token}`,
        //                 'Accept': 'application/json',
        //             },
        //         });
        //         if (!response.ok) {
        //             const errorData = await response.json();
        //             throw new Error(`Failed to fetch transactions: ${errorData?.Fault?.Error[0]?.Message || response.statusText}`);
        //         }
        //         const data = await response.json();
        //         return data;
        //     } catch(error: unknown){
        //         throw new Error(`Failed to fetch trasnaction data. Reason: ${error}`)
        //     }
        // }
    }
    async createTransaction(transaction) {
        let trans;
        try {
            trans = await Transaction_1.default.findOne({ user_id: transaction.user_id, trasnaction_id: transaction.transaction_id });
            if (trans && trans.transaction_id != null) {
                await this.updateTransaction(transaction);
                return trans.toObject();
            }
            trans = await Transaction_1.default.create(transaction);
            if (!trans) {
                throw new Error(`Mongoose failed to create transaction: ${transaction.transaction_id}`);
            }
            return trans.toObject();
        }
        catch (error) {
            throw new Error(`createTransaction: ${error}`);
        }
    }
    async updateTransaction(newTrasnaction) {
        try {
            const filter = { 'user_id': new mongoose_1.default.Types.ObjectId(newTrasnaction.user_id), 'transaction_id': newTrasnaction.transaction_id };
            const options = { new: true };
            let trans = await Transaction_1.default.findOneAndUpdate(filter, newTrasnaction, options);
            if (!trans) {
                throw new Error(`Failed to update transaction number ${newTrasnaction.transaction_id}`);
            }
            return trans;
        }
        catch (error) {
            throw new Error(`updateTransaction: ${error}`);
        }
    }
    async getTransactions(userId) {
        let transactions;
        try {
            transactions = await Transaction_1.default.find({ user_id: userId });
            if (!transactions) {
                throw new Error(`Mongoose failed to get trasnactions`);
            }
            return transactions;
        }
        catch (error) {
            throw new Error(`getTransactions: ${error}`);
        }
    }
    async getTransactionsByDate(userId, date) {
        try {
            const transactions = await Transaction_1.default.find({ user_id: userId, created_at: date.toISOString() });
            return transactions.map(trans => trans.toObject());
        }
        catch (error) {
            throw new Error(`getTransactionsByDate: ${error}`);
        }
    }
    async addCategory(userId, id, category) {
        try {
            let trans = await Transaction_1.default.findOne({ "transaction_id": id, user_id: userId });
            if (trans) {
                await Transaction_1.default.findOneAndUpdate({ "transaction_id": id }, { $push: { category: category } });
            }
        }
        catch (error) {
            throw new Error(`addCategory: ${error}`);
        }
    }
    async reportOutliers(userId, transactionInfo, categoryDayTotal, category, date) {
        try {
            // get average of last 3 days
            const report = await reportService.getReport(userId, 'VOLATILITY');
            const startDate = report.start_date;
            if (!(report.data instanceof Map)) {
                throw new Error("report.data is not a Map instance");
            }
            const transDate = new Date(date);
            const daysDifference = Math.ceil((transDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
            if (daysDifference <= 3) {
                throw Error("Not enough data to mark outliers");
            }
            const accountValues = report.data.get(category);
            const average = -1 * (accountValues[daysDifference - 1] + accountValues[daysDifference - 2] + accountValues[daysDifference - 3]) / 3;
            const distributedAmount = (average - categoryDayTotal) / transactionInfo["total"][0];
            // replace values and update total amount
            for (let key in transactionInfo) {
                if (key == "total") {
                    continue;
                }
                const transaction = await Transaction_1.default.findOne({ user_id: userId, transaction_id: key });
                let adjustTransTotalValue = 0;
                for (let val of transactionInfo[key]) {
                    adjustTransTotalValue += (transaction.category[val].total_amount - distributedAmount);
                    transaction.category[val].total_amount = distributedAmount;
                }
                transaction.total_amount -= this.accountTypeEffect[category] * adjustTransTotalValue;
                await this.updateTransaction(transaction);
            }
        }
        catch (error) {
            throw new Error(`Failed to report outliers. Reason: ${error}`);
        }
    }
    async deleteOutliers(userId, transactionInfo, category) {
        try {
            for (let key in transactionInfo) {
                if (key == "total") {
                    continue;
                }
                const transaction = await Transaction_1.default.findOne({ user_id: userId, transaction_id: key });
                let adjustTransTotalValue = 0;
                for (let val in transactionInfo[key]) {
                    adjustTransTotalValue += (transaction.category[val].total_amount_real - transaction.category[val].total_amount);
                    transaction.category[val].total_amount = transaction.category[val].total_amount_real;
                }
                transaction.total_amount += this.accountTypeEffect[category] * adjustTransTotalValue;
                await this.updateTransaction(transaction);
            }
        }
        catch (error) {
            throw new Error(`Failed to delete outliers. Reason: ${error}`);
        }
    }
}
exports.TransactionsService = TransactionsService;
//# sourceMappingURL=transactionsService.js.map