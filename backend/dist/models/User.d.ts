import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    email: string;
    password: string;
    role: 'client' | 'advisor';
    data_from: string;
    advisorId?: mongoose.Types.ObjectId;
    companyInformation?: mongoose.Types.ObjectId;
    investingQuestionnaire?: mongoose.Types.ObjectId;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    comparePassword(candidate: string): Promise<boolean>;
}
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, mongoose.DefaultSchemaOptions> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUser>;
export default _default;
