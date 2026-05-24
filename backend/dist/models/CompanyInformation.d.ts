import mongoose, { Document } from 'mongoose';
export interface ICompanyInformation extends Document {
    user_id: mongoose.Types.ObjectId;
    companyName: string;
    email: string;
    phoneNumber: string;
    streetAddress: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
    authPersonnel: {
        firstName: string;
        lastName: string;
        phoneNumber: string;
    }[];
    companyBankAccounts: {
        bank: string;
        accountNumber: string;
        bankerName: string;
        currency: string;
        currentInterestRate: string;
    }[];
    investmentAdvisors?: {
        broker: string;
        investmentAccountNumber: string;
        advisorName: string;
        investmentCurrency: string;
        investmentInterestRate: string;
    }[];
}
declare const _default: mongoose.Model<ICompanyInformation, {}, {}, {}, mongoose.Document<unknown, {}, ICompanyInformation, {}, mongoose.DefaultSchemaOptions> & ICompanyInformation & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ICompanyInformation>;
export default _default;
