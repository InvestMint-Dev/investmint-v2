import mongoose from "mongoose";
import AccountModel, {Account, AccountDTO} from "../models/Account";

export class AccountService {
    async createAccount(account: AccountDTO): 
    Promise<{ id: string; object: AccountDTO }> {
        let acc: Account | null
        try {
            acc = await AccountModel.findOne({user_id: account.user_id, account_id: account.account_id})
            if (acc) {
                this.updateAccount(account)
                return acc.toObject()
            }
            acc = await AccountModel.create(account)
            if (!acc) {
                throw new Error(`Mongoose failed to create account`)
            }
            return { id: acc._id.toString(), object: acc.toObject() }
        } catch(error: unknown) {
            throw new Error(`createAccount: ${error}`)
        }
    }
    async updateAccount(account: AccountDTO): 
    Promise<{ id: string; object: AccountDTO }> {
        let acc:Account | null
        try {
            const filter = {'user_id': account.user_id}
            const query = account
            const options = {new: true}
            acc = await AccountModel.findOneAndUpdate(filter, query, options)

            if (!acc) {
                throw new Error(`Mongoose failed to update account`)
            }

            return { id: acc._id.toString(), object: acc.toObject() }

        } catch(error: unknown) {
            throw new Error(`updateAccount: ${error}`)
        }
    }
    async getAccountByName(userId: string, accountName: string): 
    Promise<{ id: string; object: AccountDTO }> {
        let acc: Account | null
        try {
            acc = await AccountModel.findOne({user_id: userId, account_name: accountName})

            if (!acc) {
                throw new Error(`Mongoose failed to find account: ${accountName}`)
            }

            const acc_return: AccountDTO = acc.toObject()
            return {id: acc._id.toString(), object: acc_return}
        } catch(error: unknown) {
            throw new Error(`getAccountByName: ${error}`)
        }
    }

    async getAccountById(userId: string, accountId: string): 
    Promise<{ id: string; object: AccountDTO }> {
        let acc: Account | null
        try {
            acc = await AccountModel.findOne({user_id: userId, account_id: accountId})

            if (!acc) {
                throw new Error(`Mongoose failed to find account with id: ${accountId}`)
            }

            return {id: acc._id.toString(), object: acc.toObject()}
        } catch(error: unknown) {
            throw new Error(`getAccountById: ${error}`)
        }
    }

    async getAccounts(userId: string) {
        let acc: Account[] | null
        try {
            acc = await AccountModel.find({user_id: userId})

            if (!acc) {
                throw new Error(`Mongoose failed to get account`)
            }

            return acc
        } catch(error: unknown) {
            throw new Error(`getAccounts: ${error}`)
        }
    }

    async getLastAcccountDate(userId: string): Promise<Date> {
        try {
            const lastEntry: any = await AccountModel.find({user_id: new mongoose.Types.ObjectId(userId)}).sort({updated_at: -1}).limit(1);
            if (!lastEntry[0]) {
                return new Date('2000-01-01T00:00:00Z'); 
            }
            return lastEntry[0]?.updated_at
        } catch(error: unknown) {
            throw new Error(`getLastAcccountDate: ${error}`)

        }
    }

}