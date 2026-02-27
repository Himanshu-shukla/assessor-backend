import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import uploadRoute from "./routes/upload.route";
import testRoute from "./routes/test.route";
import statusRoute from "./routes/status.route";
import meetingRoutes from "./metting/meeting.route";

dotenv.config();

const app = Fastify();

app.register(cors);
app.register(multipart);

app.register(uploadRoute);
app.register(testRoute);
app.register(statusRoute);
app.register(meetingRoutes)
// Register meeting routes - add logging to confirm registration
// Register meeting routes with error handling
// fastify.register(meetingRoutes, { prefix: '/api' })
//   .after((err) => {
//     if (err) {
//       console.error('❌ Failed to register meeting routes:', err);
//     } else {
//       console.log('✅ Meeting routes registered with prefix /api');
//     }
//   });
const start = async () => {
  await connectDB();
  await app.listen({ port: 7001, host: "0.0.0.0" });
  console.log("🚀 Server running on port 4000");
};

start();