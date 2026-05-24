import mongoose, { Document } from 'mongoose';
export interface IAdvisoryActivity extends Document {
    user_id: string;
    date: Date;
    type: 'Review' | 'Recommendation' | 'Policy' | 'Note';
    title: string;
    advisor: string;
    status: 'complete' | 'scheduled' | 'cancelled';
    notes?: string;
}
declare const _default: mongoose.Model<IAdvisoryActivity, {}, {}, {}, mongoose.Document<unknown, {}, IAdvisoryActivity, {}, mongoose.DefaultSchemaOptions> & IAdvisoryActivity & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IAdvisoryActivity>;
export default _default;
