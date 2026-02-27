"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    await mongoose_1.default.connect(process.env.DATABASE_URL);
    console.log("✅ MongoDB Connected");
};
exports.connectDB = connectDB;
//# sourceMappingURL=db.js.map