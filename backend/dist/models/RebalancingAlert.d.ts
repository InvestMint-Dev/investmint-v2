import mongoose, { Document } from 'mongoose';
export interface IRebalancingAlert extends Document {
    user_id: mongoose.Types.ObjectId;
    asset: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
    dismissed: boolean;
}
declare const _default: mongoose.Model<IRebalancingAlert, {}, {}, {}, mongoose.Document<unknown, {}, IRebalancingAlert, {}, mongoose.DefaultSchemaOptions> & IRebalancingAlert & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IRebalancingAlert>;
export default _default;
