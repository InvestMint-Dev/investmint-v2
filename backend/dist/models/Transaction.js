"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const baseOptions = {
    timestamps: true
};
const TransactionSchema = new mongoose_1.Schema({
    user_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    transaction_id: {
        type: String,
        default: null,
    },
    created_at: {
        type: String,
        default: null,
    },
    updated_at: {
        type: String,
        default: null,
    },
    memo: {
        type: String,
        default: null,
    },
    total_amount: {
        type: Number,
        default: null,
    },
    total_amount_real: {
        type: Number,
        default: null,
    },
    account_id: {
        type: String,
        default: null,
    },
    split_account_id: {
        type: String,
        default: null,
    },
    type: {
        type: String,
        default: null,
    },
    currency: {
        type: String,
        default: null,
    },
    lineitems: {
        type: [{
                id: { type: String, default: null },
                total_amount: { type: Number, default: null },
                unit_quantity: { type: String, default: null },
                unit_amount: { type: String, default: null },
                account_id: { type: String, default: null },
                object_type: { type: String, default: null },
            }],
        required: true,
    },
    category: {
        type: [{
                type: { type: String, default: null },
                account_name: { type: String, required: true },
                account_type: { type: String, required: true },
                total_amount: { type: Number, required: true },
                total_amount_real: { type: Number, required: true },
            }],
        default: [],
    },
    balance: {
        type: Number,
        default: null,
    }
}, baseOptions);
TransactionSchema.set("toObject", {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
        delete ret._id;
        delete ret.createdAt;
        delete ret.updatedAt;
    },
});
const TransactionsModel = mongoose_1.default.model("Transactions", TransactionSchema);
exports.default = TransactionsModel;
//# sourceMappingURL=Transaction.js.map