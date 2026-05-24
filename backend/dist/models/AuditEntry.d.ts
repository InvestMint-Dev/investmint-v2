import mongoose, { Document } from 'mongoose';
export interface IAuditEntry extends Document {
    user_id: string;
    date: Date;
    action: string;
    actor: string;
    detail: string;
}
declare const _default: mongoose.Model<IAuditEntry, {}, {}, {}, mongoose.Document<unknown, {}, IAuditEntry, {}, mongoose.DefaultSchemaOptions> & IAuditEntry & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IAuditEntry>;
export default _default;
