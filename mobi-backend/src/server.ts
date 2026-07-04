//MOBI/mobi-backend/src/server.ts

// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import { supabase } from "./config/supabase";
// import activityRoutes from "./routes/activityRoutes"
// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5050;

// app.use(cors());
// app.use(express.json());

// app.get("/", (_req, res) => {
//   res.send("MOBI backend is running. Go to /health to test JSON.");
// });

// app.get("/health", async (_req, res) => {
//   res.json({
//     status: "ok",
//     message: "MOBI backend is running",
//   });
// });

// app.get("/activities", async (_req, res) => {
//   const { data, error } = await supabase
//     .from("activities")
//     .select("*")
//     .order("created_at", { ascending: false });

//   if (error) {
//     return res.status(500).json({ error: error.message });
//   }

//   res.json(data);
// });

// app.post("/activities", async (req, res) => {
//   const {
//     title,
//     description,
//     activity_type,
//     speech_ladder_level,
//     max_attempts,
//     estimated_minutes,
//     thumbnail_url,
//     ai_voice_gender,
//     ai_voice_speed,
//     steps,
//   } = req.body;

//   const { data: activity, error: activityError } = await supabase
//     .from("activities")
//     .insert({
//       title,
//       description,
//       activity_type,
//       speech_ladder_level,
//       max_attempts,
//       estimated_minutes,
//       thumbnail_url,
//       ai_voice_gender,
//       ai_voice_speed,
//       status: "published",
//       uploaded_by: "Center Admin",
//     })
//     .select()
//     .single();

//   if (activityError) {
//     return res.status(500).json({ error: activityError.message });
//   }

//   if (Array.isArray(steps) && steps.length > 0) {
//     const stepRows = steps.map((step: any, index: number) => ({
//       activity_id: activity.id,
//       step_order: index + 1,
//       step_type: step.step_type,
//       prompt: step.prompt || null,
//       media_url: step.media_url || null,
//       expected_answers: step.expected_answers || null,
//       ai_feedback_rules: step.feedback_rules || {},
//       tone: step.tone || null,
//       metadata: step.metadata || {},
//     }));

//     const { error: stepsError } = await supabase
//       .from("activity_steps")
//       .insert(stepRows);

//     if (stepsError) {
//       return res.status(500).json({ error: stepsError.message });
//     }
//   }

//   res.status(201).json({
//     message: "Activity created successfully",
//     activity,
//   });
// });

// app.use("/activities", activityRoutes);

// app.listen(PORT, () => {
//   console.log(`MOBI backend running on http://localhost:${PORT}`);
// });


import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import activityRoutes from "./routes/activityRoutes";
import speechRoutes from "./routes/speechRoutes";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5050;

app.use(cors());
app.use(express.json());

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

app.listen(PORT, "0.0.0.0", () => {
  console.log(`MOBI backend running on http://localhost:${PORT}`);
});