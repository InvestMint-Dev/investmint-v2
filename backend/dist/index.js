"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const companyInformation_1 = __importDefault(require("./routes/companyInformation"));
const investingQuestionnaire_1 = __importDefault(require("./routes/investingQuestionnaire"));
const recommendations_1 = __importDefault(require("./routes/recommendations"));
const recommendations_2 = __importDefault(require("./routes/recommendations"));
const dataCollection_1 = __importDefault(require("./routes/dataCollection"));
const audit_1 = __importDefault(require("./routes/audit"));
const advisoryActivity_1 = __importDefault(require("./routes/advisoryActivity"));
const advisor_1 = __importDefault(require("./routes/advisor"));
const accounts_1 = __importDefault(require("./routes/accounts"));
const transactions_1 = __importDefault(require("./routes/transactions"));
const reports_1 = __importDefault(require("./routes/reports"));
const analysis_1 = __importDefault(require("./routes/analysis"));
const classifications_1 = __importDefault(require("./routes/classifications"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8000;
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/companyInformation', companyInformation_1.default);
app.use('/api/investingQuestionnaire', investingQuestionnaire_1.default);
app.use('/api/recommendations', recommendations_1.default);
app.use('/api/rebalancingAlerts', recommendations_2.default);
app.use('/api/dataCollection', dataCollection_1.default);
app.use('/api/audit', audit_1.default);
app.use('/api/advisoryActivity', advisoryActivity_1.default);
app.use('/api/advisor', advisor_1.default);
app.use('/', accounts_1.default);
app.use('/', transactions_1.default);
app.use('/', reports_1.default);
app.use('/', analysis_1.default);
app.use('/', classifications_1.default);
// Connect to MongoDB and start server
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/investmint-v2';
mongoose_1.default
    .connect(MONGO_URI)
    .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
        console.log(`🚀 InvestMint V2 backend running on port ${PORT}`);
    });
})
    .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});
exports.default = app;
//# sourceMappingURL=index.js.map