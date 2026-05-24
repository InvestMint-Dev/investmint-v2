import mongoose, { Document } from "mongoose";
export interface Account extends Document {
    user_id: string;
    account_name: string | null;
    account_type: string | null;
    account_balance: number | null;
    account_id: string | null;
    created_at: Date | null;
    updated_at: Date | null;
    status: string | null;
    currency: string | null;
}
export type AccountDTO = {
    user_id: string;
    account_type: string | null;
    account_name: string | null;
    account_balance: number | null;
    account_id: string | null;
    created_at: Date | null;
    updated_at: Date | null;
    status: string | null;
    currency: string | null;
};
declare const AccountModel: mongoose.Model<Account, {}, {}, {}, mongoose.Document<unknown, {}, Account, {}, mongoose.DefaultSchemaOptions> & Account & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, Account>;
export default AccountModel;
