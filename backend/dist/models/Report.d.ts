import mongoose, { Document } from "mongoose";
export type models = "STL_TREND" | "STL_SEASONAL" | "STL_RESID" | "ARIMA" | "ARIMA_UPPER" | "ARIMA_LOWER" | "LSTM" | "BALANCE" | "VOLATILITY" | "FORECAST" | "IDLE_CAPITAL" | "FORECAST_DRIVERS";
export interface Report extends Document {
    user_id: string;
    model_type: models;
    start_date: Date;
    end_date: Date;
    data: {
        [key: string]: number[];
    };
}
export type ReportDTO = {
    user_id: string;
    model_type: models;
    start_date: Date;
    end_date: Date;
    data: {
        [key: string]: number[];
    };
};
declare const ReportModel: mongoose.Model<Report, {}, {}, {}, mongoose.Document<unknown, {}, Report, {}, mongoose.DefaultSchemaOptions> & Report & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, Report>;
export default ReportModel;
