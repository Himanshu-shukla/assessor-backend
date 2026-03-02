import dotenv from "dotenv";
dotenv.config();

import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import { connectDB } from "./config/db";
import uploadRoute from "./routes/upload.route";
import testRoute from "./routes/test.route";
import statusRoute from "./routes/status.route";
import meetingRoutes from "./metting/meeting.route";
import analysisRoute from "./routes/analysis.route";



const app = Fastify();

app.register(cors, {
  origin: true, // allow frontend domain
  credentials: true,
});

app.register(multipart);

// 🔥 Register all routes under /api prefix
app.register(async function (api) {
  api.register(uploadRoute);
  api.register(testRoute);
  api.register(statusRoute);
  api.register(meetingRoutes);
  api.register(analysisRoute);
}, { prefix: "/api" });

const start = async () => {
  await connectDB();
  await app.listen({ port: 7001, host: "0.0.0.0" });
  console.log("🚀 Server running on port 7001");
};

start();