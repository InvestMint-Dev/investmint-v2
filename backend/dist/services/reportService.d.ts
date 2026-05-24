import { Report, ReportDTO, models } from "../models/Report";
import mongoose from "mongoose";
export declare class ReportsService {
    createReport(report: ReportDTO): Promise<Report & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getReport(userId: string, type: models, startDate?: null, endDate?: null): Promise<any>;
    getForecastReport(userId: string, startDate: string, endDate: string, accountTypes: string[]): Promise<{}>;
    updateReport(report: ReportDTO): Promise<any>;
}
