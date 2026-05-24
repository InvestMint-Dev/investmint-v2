"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
router.post('/runPythonScript', async (req, res) => {
    try {
        const { userId, dataFrom } = req.body;
        const pythonExecutable = process.env.NODE_ENV === 'production'
            ? 'python3'
            : path_1.default.resolve(__dirname, '../../../cash-flow-backend/backend/venv/bin/python3');
        const scriptPath = path_1.default.join(__dirname, '../python-script/app/analysis.py');
        const pythonProcess = (0, child_process_1.spawn)(pythonExecutable, [scriptPath, userId, dataFrom]);
        let outputData = '';
        let stderrData = '';
        let responseHandled = false;
        const timeout = setTimeout(() => {
            if (!responseHandled) {
                responseHandled = true;
                pythonProcess.kill();
                res.status(408).json({ error: 'Python script execution timed out' });
            }
        }, 600000);
        pythonProcess.stdout.on('data', (data) => { outputData += data.toString(); });
        pythonProcess.stderr.on('data', (data) => { stderrData += data.toString(); console.error('Python stderr:', data.toString()); });
        pythonProcess.on('close', (code) => {
            clearTimeout(timeout);
            if (responseHandled)
                return;
            responseHandled = true;
            if (code !== 0)
                return res.status(400).json({ error: `Python script failed with code ${code}`, stderr: stderrData });
            try {
                return res.status(200).json(JSON.parse(outputData));
            }
            catch {
                return res.status(200).json({ message: outputData.trim() || 'Analysis completed' });
            }
        });
        pythonProcess.on('error', (error) => {
            clearTimeout(timeout);
            if (responseHandled)
                return;
            responseHandled = true;
            console.error('Python process error:', error);
            res.status(500).json({ message: 'Failed to start Python process', error: `${error}` });
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: `${error}` });
    }
});
exports.default = router;
//# sourceMappingURL=analysis.js.map