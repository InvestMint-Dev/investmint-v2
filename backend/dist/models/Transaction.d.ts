import mongoose, { Document } from "mongoose";
export interface Transactions extends Document {
    user_id: string;
    transaction_id: string;
    created_at: Date | String | null;
    updated_at: Date | String | null;
    memo: string | null;
    total_amount: number | null;
    total_amount_real: number | null;
    account_id: string | null;
    split_account_id: string | null;
    type: string | null;
    currency: string | null;
    lineitems: {
        id: string | null;
        total_amount: number | null;
        unit_quantity: number | null;
        unit_amount: number | null;
        account_id: string | null;
        object_type: string | null;
    }[] | null;
    category: {
        type: string | null;
        account_type: string | null;
        account_name: string | null;
        total_amount: number | null;
        total_amount_real: number | null;
    }[] | null;
    balance: number;
}
export type CateogryDTO = {
    type: string | null;
    account_name: string;
    account_type: string;
    total_amount: number;
    total_amount_real: number;
};
export type TransactionsDTO = {
    user_id: string;
    transaction_id: string;
    created_at: Date | String | null;
    updated_at: Date | String | null;
    memo: string | null;
    total_amount: number | null;
    total_amount_real: number | null;
    account_id: string | null;
    split_account_id: string | null;
    type: string | null;
    currency: string | null;
    lineitems: {
        id: string | null;
        total_amount: number | null;
        unit_quantity: number | null;
        unit_amount: number | null;
        account_id: string | null;
        object_type: string | null;
    }[] | null;
    category: {
        type: string | null;
        account_type: string | null;
        account_name: string | null;
        total_amount: number | null;
        total_amount_real: number | null;
    }[] | null;
    balance: number;
};
declare const TransactionsModel: mongoose.Model<Transactions, {}, {}, {}, mongoose.Document<unknown, {}, Transactions, {}, mongoose.DefaultSchemaOptions> & Transactions & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, Transactions>;
export default TransactionsModel;
