import { Account, AccountDTO } from "../models/Account";
export declare class AccountService {
    createAccount(account: AccountDTO): Promise<{
        id: string;
        object: AccountDTO;
    }>;
    updateAccount(account: AccountDTO): Promise<{
        id: string;
        object: AccountDTO;
    }>;
    getAccountByName(userId: string, accountName: string): Promise<{
        id: string;
        object: AccountDTO;
    }>;
    getAccountById(userId: string, accountId: string): Promise<{
        id: string;
        object: AccountDTO;
    }>;
    getAccounts(userId: string): Promise<Account[]>;
    getLastAcccountDate(userId: string): Promise<Date>;
}
