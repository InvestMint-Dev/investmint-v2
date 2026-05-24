import mongoose, { Document, ObjectId } from "mongoose";
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
declare const ClassificationModel: mongoose.Model<Classification, {}, {}, {}, mongoose.Document<unknown, {}, Classification, {}, mongoose.DefaultSchemaOptions> & Classification & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, Classification>;
export default ClassificationModel;
