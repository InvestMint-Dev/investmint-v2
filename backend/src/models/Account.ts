import mongoose, {Schema, Document, ObjectId} from "mongoose"

export interface Account extends Document{
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
}

const baseOptions = {
    timestamps: true
}

const AccountSchema: Schema = new Schema({
    user_id: { type: String, required: true },
    account_name: {
        type: String,
        default: null,
    },
    account_type: {
        type: String,
        default: null 
    }, 
    account_balance: {
        type: Number, 
        default: null 
    }, 
    account_id: {
        type: String, 
        default: null 
    },
    created_at: {
        type: Date,
        default: null 
    }, 
    updated_at: {
        type: Date,
        default: null 
    }, 
    status: {
        type: String,
        default: null 
    },
    currency: {
        type: String,
        default: null 
    },
}, baseOptions);

AccountSchema.set("toObject", {
    virtuals: true,
    versionKey: false,
    transform: (_doc: any, ret: Record<string, unknown>) => {
      delete ret._id;
      delete ret.createdAt;
      delete ret.updatedAt;
    },
});

const AccountModel = mongoose.model<Account>("Account", AccountSchema)

export default AccountModel