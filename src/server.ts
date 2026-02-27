import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import uploadRoute from "./routes/upload.route";
import testRoute from "./routes/test.route";
import statusRoute from "./routes/status.route";

dotenv.config();

const app = Fastify();

app.register(cors);
app.register(multipart);

app.register(uploadRoute);
app.register(testRoute);
app.register(statusRoute);

const start = async () => {
  await connectDB();
  await app.listen({ port: 4000, host: "0.0.0.0" });
  console.log("🚀 Server running on port 4000");
};

start();