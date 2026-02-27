"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const multipart_1 = __importDefault(require("@fastify/multipart"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./config/db");
const upload_route_1 = __importDefault(require("./routes/upload.route"));
const test_route_1 = __importDefault(require("./routes/test.route"));
const status_route_1 = __importDefault(require("./routes/status.route"));
dotenv_1.default.config();
const app = (0, fastify_1.default)();
app.register(cors_1.default);
app.register(multipart_1.default);
app.register(upload_route_1.default);
app.register(test_route_1.default);
app.register(status_route_1.default);
const start = async () => {
    await (0, db_1.connectDB)();
    await app.listen({ port: 4000, host: "0.0.0.0" });
    console.log("🚀 Server running on port 4000");
};
start();
//# sourceMappingURL=server.js.map