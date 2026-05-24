import ReportModel, { Report, ReportDTO, models } from "../models/Report";
import { daysBetweenDates, datesOverlap } from "../utils/excel";
import mongoose from "mongoose";
export class ReportsService {
    async createReport(report: ReportDTO) {
        try {
            const res = await ReportModel.create(report)
            if (!res) {
                throw new Error(`Failed to create ${report.model_type} Report for ${report.user_id}.`)
            }
            return res.toObject()
        } catch(error: any) {
            throw new Error(`createReport: ${error}`)
        }
    }
    async getReport(userId: string, type: models, startDate = null, endDate = null) {
        try {
            let result;
            if (startDate == null || endDate == null) {
                result = await ReportModel.findOne({user_id: new mongoose.Types.ObjectId(userId), model_type: type}).sort({createdAt: -1})
            } else {
                result = await ReportModel.findOne({user_id: new mongoose.Types.ObjectId(userId), model_type: type, start_date: {$lte: new Date(startDate)}}).sort({createdAt: -1})
            }
            if (!result) {
                throw new Error(`Couldn't get ${type} report for ${userId}.`)
            }
            return result.toObject()
        } catch(error: any) {
            throw new Error(`getReport: ${error}`)
        }
    }

    async getForecastReport(userId: string, startDate: string, endDate: string, accountTypes: string[]) {
        try {
            const reports = await ReportModel.find({
                user_id: userId,
                model_type: "FORECAST",
            }).sort({ createdAt: -1 });

            if (!reports) {
                throw new Error(`Mongoose error in finding forecast reports for ${userId}`)
            }

            
            let upperDateBound = new Date(endDate)
            let lowerDateBound = new Date(startDate)
            let forecastLength = daysBetweenDates(lowerDateBound, upperDateBound)

            const mergedValues = accountTypes
                .filter(type => type !== "TOTAL")
                .reduce((acc, type) => ({
                    ...acc,
                    [type === "VOLATILITY" ? "TOTAL" : type]: Array.from({ length: forecastLength }, () => NaN)
                }), {});

            for (let report of reports) {
                if (!datesOverlap(report.start_date, report.end_date, lowerDateBound, upperDateBound)) {continue}
                const reportLength = daysBetweenDates(report.start_date, report.end_date);
                let startIndex = report.start_date > lowerDateBound ? daysBetweenDates(lowerDateBound, report.start_date) - 1 : 0;
                let reportStart = report.start_date < lowerDateBound ? daysBetweenDates(lowerDateBound, report.start_date) - 1 : 0;
            
                if (report.data && report.data instanceof Map) {
                    while (startIndex < forecastLength && reportStart < reportLength) {
                        for (let accountType of accountTypes) {
                            if (accountType == "TOTAL") {continue}
                            let key = accountType == "VOLATILITY" ? "TOTAL" : accountType
                            if (isNaN(mergedValues[key][startIndex]) && report.data.get(key)?.[reportStart] !== undefined) {
                                mergedValues[key][startIndex] = report.data.get(key)[reportStart]
                            }
                        }
                        startIndex++;
                        reportStart++;
                    }
                }
            }

            for (let key in mergedValues) {
                mergedValues[key] = mergedValues[key].map(value => isNaN(value) ? 0 : value);
            }

            return mergedValues
            
        } catch(error: any) {
            throw new Error(`getForecastReport: ${error}`);
        }
    }

    async updateReport(report: ReportDTO) {
        try {
            const res = await ReportModel.findOneAndUpdate({user_id: new mongoose.Types.ObjectId(report.user_id), model_type: report.model_type}, report, {new: true})
            if (!res) {
                throw new Error(`Couldn't update ${report.model_type} report for ${report.user_id}`)
            }
            return res.toObject()
        } catch(error: any) {
            throw new Error(`updateReport: ${error}`)
        }
    }
}
