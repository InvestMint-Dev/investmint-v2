import mongoose from "mongoose";
import { Transactions, TransactionsDTO, CateogryDTO } from "../models/Transaction";
export declare class TransactionsService {
    accountTypeEffect: {
        ACCOUNTS_PAYABLE: number;
        ACCOUNTS_RECEIVABLE: number;
        CREDIT_CARD: number;
        FIXED_ASSET: number;
        LIABILITY: number;
        EQUITY: number;
        REVENUE: number;
        EXPENSE: number;
        OTHER: number;
    };
    createTransaction(transaction: TransactionsDTO): Promise<any>;
    updateTransaction(newTrasnaction: TransactionsDTO): Promise<TransactionsDTO>;
    getTransactions(userId: string): Promise<TransactionsDTO[]>;
    getTransactionsByDate(userId: string, date: Date): Promise<(Transactions & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    addCategory(userId: string, id: string, category: CateogryDTO): Promise<void>;
    reportOutliers(userId: string, transactionInfo: {
        string: number[];
    }, categoryDayTotal: number, category: string, date: Date): Promise<void>;
    deleteOutliers(userId: string, transactionInfo: {
        string: number[];
    }, category: string): Promise<void>;
}
