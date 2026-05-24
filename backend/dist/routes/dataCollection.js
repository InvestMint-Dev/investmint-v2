"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ETFRecommendation_1 = __importDefault(require("../models/ETFRecommendation"));
const InvestingQuestionnaire_1 = __importDefault(require("../models/InvestingQuestionnaire"));
const router = (0, express_1.Router)();
// Default ETF universe for recommendations
const ETF_UNIVERSE = [
    { ticker: 'ZAG', name: 'BMO Aggregate Bond Index ETF', yield: 3.8, returns1y: 4.2, returns3y: 3.1, volatility: 4.5, expenseRatio: 0.09, currency: 'CAD', category: 'Fixed Income' },
    { ticker: 'VSB', name: 'Vanguard Short-Term Bond', yield: 4.1, returns1y: 3.8, returns3y: 2.9, volatility: 3.2, expenseRatio: 0.11, currency: 'CAD', category: 'Fixed Income' },
    { ticker: 'ZST', name: 'BMO Short-Term Bond', yield: 4.3, returns1y: 3.5, returns3y: 2.7, volatility: 2.8, expenseRatio: 0.14, currency: 'CAD', category: 'Fixed Income' },
    { ticker: 'XIC', name: 'iShares Core S&P/TSX ETF', yield: 2.5, returns1y: 11.2, returns3y: 9.8, volatility: 12.4, expenseRatio: 0.06, currency: 'CAD', category: 'Canadian Equity' },
    { ticker: 'XEI', name: 'iShares S&P/TSX Comp High Div', yield: 5.2, returns1y: 8.1, returns3y: 7.3, volatility: 11.8, expenseRatio: 0.22, currency: 'CAD', category: 'Canadian Equity' },
    { ticker: 'VFV', name: 'Vanguard S&P 500 Index ETF', yield: 1.4, returns1y: 22.1, returns3y: 18.3, volatility: 15.2, expenseRatio: 0.09, currency: 'CAD', category: 'US Equity' },
    { ticker: 'XUS', name: 'iShares Core S&P 500', yield: 1.2, returns1y: 22.4, returns3y: 18.5, volatility: 15.1, expenseRatio: 0.10, currency: 'CAD', category: 'US Equity' },
    { ticker: 'CASH', name: 'Purpose Cash Management ETF', yield: 5.1, returns1y: 5.1, returns3y: 3.8, volatility: 0.5, expenseRatio: 0.15, currency: 'CAD', category: 'Cash' },
    { ticker: 'CSAV', name: 'CI High Interest Savings ETF', yield: 5.0, returns1y: 5.0, returns3y: 3.6, volatility: 0.3, expenseRatio: 0.14, currency: 'CAD', category: 'Cash' },
    { ticker: 'XEF', name: 'iShares Core MSCI EAFE ETF', yield: 2.8, returns1y: 8.4, returns3y: 6.2, volatility: 13.1, expenseRatio: 0.22, currency: 'CAD', category: 'International' },
    { ticker: 'ZDI', name: 'BMO International Dividend', yield: 4.1, returns1y: 7.2, returns3y: 5.8, volatility: 12.0, expenseRatio: 0.44, currency: 'CAD', category: 'International' },
];
function scoreETFs(questionnaire) {
    const riskMap = { conservative: 1, moderate: 2, aggressive: 3 };
    const horizonMap = { within_3m: 1, '3m_1y': 2, '1y_3y': 3, over_3y: 4 };
    const risk = riskMap[questionnaire?.investingQ3] || 2;
    const horizon = horizonMap[questionnaire?.investingQ4] || 2;
    return ETF_UNIVERSE.map((etf) => {
        let score = 0;
        if (risk === 1)
            score += (etf.volatility < 5 ? 3 : etf.volatility < 12 ? 1 : 0);
        if (risk === 2)
            score += (etf.volatility < 10 ? 2 : etf.volatility < 16 ? 1 : 0);
        if (risk === 3)
            score += (etf.returns1y > 15 ? 3 : etf.returns1y > 8 ? 2 : 1);
        if (horizon <= 2)
            score += (etf.category === 'Cash' || etf.category === 'Fixed Income' ? 2 : 0);
        if (horizon >= 3)
            score += (etf.category === 'Canadian Equity' || etf.category === 'US Equity' ? 1 : 0);
        score += etf.yield > 4 ? 1 : 0;
        score += etf.expenseRatio < 0.12 ? 1 : 0;
        return { ...etf, score };
    }).sort((a, b) => b.score - a.score).map((etf, i) => ({
        ...etf,
        recommended: i < 5,
    }));
}
// GET /api/dataCollection/run-etf-script?userId=xxx
router.get('/run-etf-script', async (req, res) => {
    try {
        const { userId } = req.query;
        const cached = await ETFRecommendation_1.default.find({ user_id: userId });
        if (cached.length > 0) {
            res.json({ data: cached });
            return;
        }
        const questionnaire = await InvestingQuestionnaire_1.default.findOne({ user_id: userId });
        const etfs = scoreETFs(questionnaire);
        await ETFRecommendation_1.default.insertMany(etfs.map((e) => ({ ...e, user_id: userId })));
        res.json({ data: etfs });
    }
    catch {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=dataCollection.js.map