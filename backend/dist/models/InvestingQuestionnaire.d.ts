import mongoose, { Document } from 'mongoose';
export interface IInvestingQuestionnaire extends Document {
    user_id: mongoose.Types.ObjectId;
    investingQ1: string;
    investingQ2: string;
    investingQ2CashAmount?: string;
    investingQ2BusinessDuration?: string;
    investingQ2AverageCashPerYear?: string;
    investingQ3: string;
    investingQ4: string;
    investingQ4CashBackDate?: string;
    investingQ4CashBackDuration?: string;
    investingQ5: string;
    investingQ6: string;
    investingQ7: string;
    investingQ8: string;
    payableCycleDays: number;
}
declare const _default: mongoose.Model<IInvestingQuestionnaire, {}, {}, {}, mongoose.Document<unknown, {}, IInvestingQuestionnaire, {}, mongoose.DefaultSchemaOptions> & IInvestingQuestionnaire & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IInvestingQuestionnaire>;
export default _default;
