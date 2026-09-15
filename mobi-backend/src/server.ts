// //MOBI/mobi-backend/src/server.ts

// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import activityRoutes from "./routes/activityRoutes";
// import speechRoutes from "./routes/speechRoutes";

// import superAdminRoutes from "./routes/super_admin/superAdmin.routes";

// import learnerRoutes from "./routes/learnerRoutes";

// import activitySessionRoutes from "./routes/activitySessionRoutes";

// import progressRoutes from "./routes/progressRoutes";

// dotenv.config();

// const app = express();
// const PORT = Number(process.env.PORT) || 5050;

// app.use(cors());
// app.use(express.json());

// app.use("/api/super-admin", superAdminRoutes);


// app.get("/", (_req, res) => {
//   res.status(200).send("MOBI backend is running");
// });

// app.get("/health", (_req, res) => {
//   res.status(200).json({
//     status: "ok",
//     message: "MOBI backend is running", 
//   });
// });

// app.use("/activities", activityRoutes);

// app.use("/speech", speechRoutes);

// app.use("/api/learners", learnerRoutes);

// app.use("/api/activity-sessions", activitySessionRoutes);

// app.use(
//   "/api/progress",
//   progressRoutes,
// );

// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`MOBI backend running on http://localhost:${PORT}`);
// });




// MOBI/mobi-backend/src/server.ts

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const PORT =
  Number(process.env.PORT) ||
  5050;

app.use(cors());

app.use(express.json());

const readyRoutePrefixes = new Set<string>();

const apiRoutePrefixes = [
  "/api/auth",
  "/api/super-admin",
  "/activities",
  "/speech",
  "/api/learners",
  "/api/activity-sessions",
  "/api/progress",
  "/api/learning-sessions",
];

app.use((req, res, next) => {
  const matchedPrefix = apiRoutePrefixes.find((prefix) =>
    req.path.startsWith(prefix),
  );

  if (
    matchedPrefix &&
    !readyRoutePrefixes.has(matchedPrefix)
  ) {
    return res.status(503).json({
      message:
        "This MOBI feature is still loading. Please try again in a moment.",
    });
  }

  return next();
});

app.get("/", (_req, res) => {
  res
    .status(200)
    .send(
      "MOBI backend is running",
    );
});

app.get(
  "/health",
  (_req, res) => {
    res.status(200).json({
      status: "ok",

      message:
        "MOBI backend is running",
    });
  },
);

async function loadRoutes() {
  console.log("Loading MOBI API routes...");

  const loadAndMountRoute = async (
    label: string,
    routePrefix: string,
    path: string,
  ) => {
    const startedAt = Date.now();
    console.log(`Loading ${label} routes...`);
    const routeModule = await import(path);
    console.log(`Loaded ${label} routes in ${Date.now() - startedAt}ms.`);
    app.use(routePrefix, routeModule.default);
    readyRoutePrefixes.add(routePrefix);
  };

  await loadAndMountRoute("auth", "/api/auth", "./routes/authRoutes");
  await loadAndMountRoute("activity", "/activities", "./routes/activityRoutes");
  await loadAndMountRoute("speech", "/speech", "./routes/speechRoutes");
  await loadAndMountRoute(
    "super admin",
    "/api/super-admin",
    "./routes/super_admin/superAdmin.routes",
  );
  await loadAndMountRoute("learner", "/api/learners", "./routes/learnerRoutes");
  await loadAndMountRoute(
    "activity session",
    "/api/activity-sessions",
    "./routes/activitySessionRoutes",
  );
  await loadAndMountRoute("progress", "/api/progress", "./routes/progressRoutes");
  await loadAndMountRoute(
    "learning session",
    "/api/learning-sessions",
    "./routes/learningSessionRoutes",
  );
  console.log("MOBI API routes ready.");
}

app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      `MOBI backend running on http://localhost:${PORT}`,
    );

    loadRoutes().catch((error) => {
      console.error("Failed to load MOBI API routes:", error);
    });
  },
);
