import mongoose, {Schema, Document, ObjectId} from "mongoose"

export interface Transactions extends Document{
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
    balance: number
}

export type CateogryDTO = {
    type: string | null;
    account_name: string;
    account_type: string;
    total_amount: number; 
    total_amount_real: number;
}

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
    balance: number
}

const baseOptions = {
    timestamps: true
}

const TransactionSchema: Schema = new Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }, 
    transaction_id: {
        type: String,
        default: null,
    },
    created_at: {
        type: String, 
        default: null, 
    }, 
    updated_at: {
        type: String, 
        default: null, 
    },
    memo: {
        type: String, 
        default: null, 
    },
    total_amount: {
        type: Number, 
        default: null, 
    },
    total_amount_real: {
        type: Number, 
        default: null, 
    },
    account_id: {
        type: String,
        default: null, 
    },
    split_account_id: {
        type: String, 
        default: null, 
    },
    type: {
        type: String, 
        default: null, 
    },
    currency: { 
        type: String, 
        default: null, 
    },
    lineitems: {
        type: [{
            id: { type: String, default: null }, 
            total_amount: { type: Number, default: null },
            unit_quantity: { type: String, default: null },
            unit_amount: { type: String, default: null },
            account_id: { type: String, default: null },
            object_type: { type: String, default: null },
        }],
        required: true,
    },
    category: {
        type: [{
            type: { type: String, default: null }, 
            account_name: { type: String, required: true },
            account_type: { type: String, required: true },
            total_amount: { type: Number, required: true },
            total_amount_real: { type: Number, required: true },
        }],
        default: [],
    },
    balance: {
        type: Number, 
        default: null,
    }
}, baseOptions)

TransactionSchema.set("toObject", {
    virtuals: true,
    versionKey: false,
    transform: (_doc: any, ret: Record<string, unknown>) => {
      delete ret._id;
      delete ret.createdAt;
      delete ret.updatedAt;
    },
});

const TransactionsModel = mongoose.model<Transactions>("Transactions", TransactionSchema)

export default TransactionsModel

