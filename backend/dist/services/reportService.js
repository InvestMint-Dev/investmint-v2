"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
// @ts-nocheck
const Report_1 = __importDefault(require("../models/Report"));
const excel_1 = require("../utils/excel");
const mongoose_1 = __importDefault(require("mongoose"));
class ReportsService {
    async createReport(report) {
        try {
            const res = await Report_1.default.create(report);
            if (!res) {
                throw new Error(`Failed to create ${report.model_type} Report for ${report.user_id}.`);
            }
            return res.toObject();
        }
        catch (error) {
            throw new Error(`createReport: ${error}`);
        }
    }
    async getReport(userId, type, startDate = null, endDate = null) {
        try {
            let result;
            if (startDate == null || endDate == null) {
                result = await Report_1.default.findOne({ user_id: new mongoose_1.default.Types.ObjectId(userId), model_type: type }).sort({ createdAt: -1 });
            }
            else {
                result = await Report_1.default.findOne({ user_id: new mongoose_1.default.Types.ObjectId(userId), model_type: type, start_date: { $lte: new Date(startDate) } }).sort({ createdAt: -1 });
            }
            if (!result) {
                throw new Error(`Couldn't get ${type} report for ${userId}.`);
            }
            return result.toObject();
        }
        catch (error) {
            throw new Error(`getReport: ${error}`);
        }
    }
    async getForecastReport(userId, startDate, endDate, accountTypes) {
        try {
            const reports = await Report_1.default.find({
                user_id: userId,
                model_type: "FORECAST",
            }).sort({ createdAt: -1 });
            if (!reports) {
                throw new Error(`Mongoose error in finding forecast reports for ${userId}`);
            }
            let upperDateBound = new Date(endDate);
            let lowerDateBound = new Date(startDate);
            let forecastLength = (0, excel_1.daysBetweenDates)(lowerDateBound, upperDateBound);
            const mergedValues = accountTypes
                .filter(type => type !== "TOTAL")
                .reduce((acc, type) => ({
                ...acc,
                [type === "VOLATILITY" ? "TOTAL" : type]: Array.from({ length: forecastLength }, () => NaN)
            }), {});
            for (let report of reports) {
                if (!(0, excel_1.datesOverlap)(report.start_date, report.end_date, lowerDateBound, upperDateBound)) {
                    continue;
                }
                const reportLength = (0, excel_1.daysBetweenDates)(report.start_date, report.end_date);
                let startIndex = report.start_date > lowerDateBound ? (0, excel_1.daysBetweenDates)(lowerDateBound, report.start_date) - 1 : 0;
                let reportStart = report.start_date < lowerDateBound ? (0, excel_1.daysBetweenDates)(lowerDateBound, report.start_date) - 1 : 0;
                if (report.data && report.data instanceof Map) {
                    while (startIndex < forecastLength && reportStart < reportLength) {
                        for (let accountType of accountTypes) {
                            if (accountType == "TOTAL") {
                                continue;
                            }
                            let key = accountType == "VOLATILITY" ? "TOTAL" : accountType;
                            if (isNaN(mergedValues[key][startIndex]) && report.data.get(key)?.[reportStart] !== undefined) {
                                mergedValues[key][startIndex] = report.data.get(key)[reportStart];
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
            return mergedValues;
        }
        catch (error) {
            throw new Error(`getForecastReport: ${error}`);
        }
    }
    async updateReport(report) {
        try {
            const res = await Report_1.default.findOneAndUpdate({ user_id: new mongoose_1.default.Types.ObjectId(report.user_id), model_type: report.model_type }, report, { new: true });
            if (!res) {
                throw new Error(`Couldn't update ${report.model_type} report for ${report.user_id}`);
            }
            return res.toObject();
        }
        catch (error) {
            throw new Error(`updateReport: ${error}`);
        }
    }
}
exports.ReportsService = ReportsService;
//# sourceMappingURL=reportService.js.map