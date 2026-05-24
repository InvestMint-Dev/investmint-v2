import mongoose, {Schema, Document, ObjectId} from "mongoose"

export type models = "STL_TREND" | "STL_SEASONAL" | "STL_RESID" | "ARIMA" | "ARIMA_UPPER" | "ARIMA_LOWER" | "LSTM" | "BALANCE" | "VOLATILITY" | "FORECAST" | "IDLE_CAPITAL" | "FORECAST_DRIVERS"

export interface Report extends Document{
    user_id: string;
    model_type: models;
    start_date: Date;
    end_date: Date;
    data: { [key: string]: number[] };
}

export type ReportDTO = {
    user_id: string;
    model_type: models;
    start_date: Date;
    end_date: Date;
    data: { [key: string]: number[] };
}
const baseOptions = {
    timestamps: true
}

const ReportSchema: Schema = new Schema({
    user_id: { type: String, required: true },
    model_type: {
        type: String,
        required: true
    },
    start_date: {
        type: Date,
        required: true,
    }, 
    end_date: {
        type: Date,
        required: true,
    },
    data: {
        type: Map,
        of: [ Number ],
        required: true,
    },

}, baseOptions);

ReportSchema.set("toObject", {
    virtuals: true,
    versionKey: false,
    transform: (_doc: any, ret: Record<string, unknown>) => {
      delete ret._id;
      delete ret.createdAt;
      delete ret.updatedAt;
    },
});

const ReportModel = mongoose.model<Report>("Report", ReportSchema)

export default ReportModel