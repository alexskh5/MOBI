//MOBI/mobi-backend/src/server.ts

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import activityRoutes from "./routes/activityRoutes";
import speechRoutes from "./routes/speechRoutes";

import superAdminRoutes from "./routes/super_admin/superAdmin.routes";

import learnerRoutes from "./routes/learnerRoutes";

import activitySessionRoutes from "./routes/activitySessionRoutes";

import progressRoutes from "./routes/progressRoutes";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5050;

app.use(cors());
app.use(express.json());

app.use("/api/super-admin", superAdminRoutes);


app.get("/", (_req, res) => {
  res.status(200).send("MOBI backend is running");
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "MOBI backend is running",
  });
});

app.use("/activities", activityRoutes);

app.use("/speech", speechRoutes);

app.use("/api/learners", learnerRoutes);

app.use("/api/activity-sessions", activitySessionRoutes);

app.use(
  "/api/progress",
  progressRoutes,
);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`MOBI backend running on http://localhost:${PORT}`);
});

