import mongoose, { Schema, Document, ObjectId } from "mongoose"

export interface Classification extends Document {
    user_id: ObjectId;
    transaction_id: string;
    memo: string;
    amount: number;
    date: string;
    proposed_account_type: string;
    confidence: number;
    source: "rules" | "llm" | "manual";
    status: "pending" | "approved" | "rejected";
    corrected_account_type: string | null;
}

const ClassificationSchema: Schema = new Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    transaction_id: { type: String, required: true },
    memo: { type: String, default: "" },
    amount: { type: Number, default: 0 },
    date: { type: String, default: "" },
    proposed_account_type: { type: String, required: true },
    confidence: { type: Number, required: true },
    source: { type: String, enum: ["rules", "llm", "manual"], default: "rules" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    corrected_account_type: { type: String, default: null },
}, { timestamps: true });

ClassificationSchema.index({ user_id: 1, transaction_id: 1 }, { unique: true });

const ClassificationModel = mongoose.model<Classification>("Classification", ClassificationSchema);
export default ClassificationModel;
