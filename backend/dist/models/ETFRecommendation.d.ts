import mongoose, { Document } from 'mongoose';
export interface IETFRecommendation extends Document {
    user_id: mongoose.Types.ObjectId;
    ticker: string;
    name: string;
    yield: number;
    returns1y: number;
    returns3y: number;
    volatility: number;
    expenseRatio: number;
    currency: string;
    category: string;
    recommended: boolean;
}
declare const _default: mongoose.Model<IETFRecommendation, {}, {}, {}, mongoose.Document<unknown, {}, IETFRecommendation, {}, mongoose.DefaultSchemaOptions> & IETFRecommendation & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IETFRecommendation>;
export default _default;
