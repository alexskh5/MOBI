import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import { execFile } from "child_process";
import { db } from "./db";

dotenv.config();

const app = express();

app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());

const upload = multer({ dest: "uploads/" });

const PYTHON_PATH =
  process.env.PYTHON_PATH || "/Users/samalexies/Desktop/mobi-backend/venv/bin/python";

function normalizeText(text: string) {
  return text.toLowerCase().replace(/[^\w\s]/g, "").trim();
}

function getMatchScore(transcript: string, expectedAnswers: string[]) {
  const normalizedTranscript = normalizeText(transcript);
  if (!normalizedTranscript) return 0;

  let bestScore = 0;

  for (const answer of expectedAnswers) {
    const normalizedAnswer = normalizeText(answer);
    if (!normalizedAnswer) continue;

    if (normalizedTranscript === normalizedAnswer) {
      bestScore = Math.max(bestScore, 1);
    } else if (
      normalizedTranscript.includes(normalizedAnswer) ||
      normalizedAnswer.includes(normalizedTranscript)
    ) {
      bestScore = Math.max(bestScore, 0.85);
    }
  }

  return bestScore;
}

app.get("/", (_req, res) => {
  res.send("MOBI backend is running");
});

app.get("/api/test-db", async (_req, res) => {
  try {
    const result = await db.query("SELECT NOW()");
    res.json({
      message: "Database connected",
      time: result.rows[0].now,
    });
  } catch (error) {
    res.status(500).json({
      message: "Database connection failed",
      error,
    });
  }
});

// ============= SEARCH ENDPOINTS - MUST BE BEFORE /:id ROUTES =============
app.get("/api/activities/search", async (req, res) => {
  try {
    const { q } = req.query;
    console.log("Search activities with query:", q);
    
    if (!q || typeof q !== 'string' || q.trim() === '') {
      const result = await db.query(
        "SELECT * FROM activities ORDER BY created_at DESC"
      );
      return res.json(result.rows);
    }
    
    const searchTerm = `%${q.trim().toLowerCase()}%`;
    
    const result = await db.query(
      `SELECT * FROM activities 
       WHERE LOWER(title) LIKE $1 
          OR LOWER(category) LIKE $1 
          OR LOWER(level) LIKE $1
          OR LOWER(difficulty) LIKE $1
          OR LOWER(target_answers) LIKE $1
       ORDER BY created_at DESC`,
      [searchTerm]
    );
    
    console.log(`Found ${result.rows.length} activities`);
    res.json(result.rows);
  } catch (error) {
    console.error("Search activities error:", error);
    res.status(500).json({ message: "Failed to search activities", error });
  }
});

app.get("/api/learners/search", async (req, res) => {
  try {
    const { q } = req.query;
    console.log("Search learners with query:", q);
    
    if (!q || typeof q !== 'string' || q.trim() === '') {
      const result = await db.query(
        "SELECT * FROM learners ORDER BY created_at DESC"
      );
      return res.json(result.rows);
    }
    
    const searchTerm = `%${q.trim().toLowerCase()}%`;
    
    const result = await db.query(
      `SELECT * FROM learners 
       WHERE LOWER(first_name) LIKE $1 
          OR LOWER(last_name) LIKE $1 
          OR LOWER(CONCAT(first_name, ' ', last_name)) LIKE $1
          OR LOWER(diagnosis) LIKE $1
          OR LOWER(guardian_first_name) LIKE $1
          OR LOWER(guardian_last_name) LIKE $1
          OR CAST(age AS TEXT) LIKE $1
       ORDER BY created_at DESC`,
      [searchTerm]
    );
    
    console.log(`Found ${result.rows.length} learners`);
    res.json(result.rows);
  } catch (error) {
    console.error("Search learners error:", error);
    res.status(500).json({ message: "Failed to search learners", error });
  }
});

// ============= ACTIVITY ENDPOINTS =============

app.post("/api/activities", async (req, res) => {
  try {
    console.log("=== RECEIVED ACTIVITY DATA ===");
    console.log(JSON.stringify(req.body, null, 2));
    
    const {
      title,
      level,
      category,
      difficulty,
      target_answers,
      acceptable_answers,
      next_activity,
      teach_prompt,
      teach_tone,
      teach_image_url,
      ask_prompt,
      max_attempts,
      hint1,
      hint2,
      hint3,
      correct_prompt,
      correct_tone,
      correct_image_url,
      reward,
      support_prompt,
      support_tone,
      support_image_url,
      failed_action,
      activity_image_url,
    } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }
    if (!level) {
      return res.status(400).json({ message: "Level is required" });
    }
    if (!target_answers) {
      return res.status(400).json({ message: "Target answers are required" });
    }

    console.log("All required fields present, attempting to insert...");

    const result = await db.query(
      `
      INSERT INTO activities (
        title, level, category, difficulty, target_answers,
        acceptable_answers, next_activity, teach_prompt, teach_tone,
        teach_image_url, ask_prompt, max_attempts, hint1, hint2, hint3,
        correct_prompt, correct_tone, correct_image_url, reward,
        support_prompt, support_tone, support_image_url, failed_action,
        activity_image_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
      RETURNING *
      `,
      [
        title, level, category || null, difficulty || null, target_answers,
        acceptable_answers || null, next_activity || null, teach_prompt || null,
        teach_tone || null, teach_image_url || null, ask_prompt || null,
        max_attempts ? Number(max_attempts) : 3, hint1 || null, hint2 || null,
        hint3 || null, correct_prompt || null, correct_tone || null,
        correct_image_url || null, reward || null, support_prompt || null,
        support_tone || null, support_image_url || null, failed_action || null,
        activity_image_url || null
      ]
    );

    console.log("Activity created successfully:", result.rows[0]);

    res.status(201).json({
      message: "Activity created successfully",
      activity: result.rows[0],
    });
  } catch (error: any) {
    console.error("=== ERROR DETAILS ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Failed to create activity",
      error: error.message,
    });
  }
});

// Get all activities
app.get("/api/activities", async (_req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM activities ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Fetch activities error:", error);
    res.status(500).json({
      message: "Failed to fetch activities",
      error,
    });
  }
});

// Get single activity by ID - MUST COME AFTER search route
app.get("/api/activities/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Fetch activity with id:", id);
    
    const result = await db.query(
      "SELECT * FROM activities WHERE id = $1",
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Activity not found" });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Fetch activity error:", error);
    res.status(500).json({ message: "Failed to fetch activity" });
  }
});

app.put("/api/activities/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, level, category, difficulty, target_answers,
      acceptable_answers, next_activity, teach_prompt, teach_tone,
      teach_image_url, ask_prompt, max_attempts, hint1, hint2, hint3,
      correct_prompt, correct_tone, correct_image_url, reward,
      support_prompt, support_tone, support_image_url, failed_action,
      activity_image_url
    } = req.body;

    const result = await db.query(
      `UPDATE activities 
       SET title = $1, level = $2, category = $3, difficulty = $4,
           target_answers = $5, acceptable_answers = $6, next_activity = $7,
           teach_prompt = $8, teach_tone = $9, teach_image_url = $10,
           ask_prompt = $11, max_attempts = $12, hint1 = $13, hint2 = $14,
           hint3 = $15, correct_prompt = $16, correct_tone = $17,
           correct_image_url = $18, reward = $19, support_prompt = $20,
           support_tone = $21, support_image_url = $22, failed_action = $23,
           activity_image_url = $24
       WHERE id = $25 RETURNING *`,
      [
        title, level, category, difficulty, target_answers,
        acceptable_answers, next_activity, teach_prompt, teach_tone,
        teach_image_url, ask_prompt, max_attempts, hint1, hint2, hint3,
        correct_prompt, correct_tone, correct_image_url, reward,
        support_prompt, support_tone, support_image_url, failed_action,
        activity_image_url, id
      ]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Activity not found" });
    }
    
    res.json({ message: "Activity updated successfully", activity: result.rows[0] });
  } catch (error) {
    console.error("Update activity error:", error);
    res.status(500).json({ message: "Failed to update activity" });
  }
});

app.delete("/api/activities/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      "DELETE FROM activities WHERE id = $1 RETURNING id",
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Activity not found" });
    }
    
    res.json({ message: "Activity deleted successfully" });
  } catch (error) {
    console.error("Delete activity error:", error);
    res.status(500).json({ message: "Failed to delete activity" });
  }
});

app.post("/api/speech/check", upload.single("audio"), async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "No audio uploaded." });
  }

  const targetAnswers = String(req.body.targetAnswers || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const acceptableAnswers = String(req.body.acceptableAnswers || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const allExpectedAnswers = [...targetAnswers, ...acceptableAnswers];

  if (allExpectedAnswers.length === 0) {
    fs.unlinkSync(file.path);
    return res.status(400).json({
      message: "No target or acceptable answers provided.",
    });
  }

  execFile(
    PYTHON_PATH,
    ["python/transcribe.py", file.path],
    (error, stdout, stderr) => {
      try {
        fs.unlinkSync(file.path);

        if (error) {
          return res.status(500).json({
            message: "Whisper failed to transcribe audio.",
            error: stderr || error.message,
          });
        }

        const whisperResult = JSON.parse(stdout);

        if (whisperResult.error) {
          return res.status(500).json({
            message: "Whisper returned an error.",
            error: whisperResult.error,
          });
        }

        const transcript = String(whisperResult.transcript || "");
        const transcriptConfidence = Number(whisperResult.confidence || 0);
        const answerMatchScore = getMatchScore(transcript, allExpectedAnswers);

        const isCorrect = transcriptConfidence >= 0.7 && answerMatchScore >= 0.8;

        return res.json({
          transcript,
          transcriptConfidence,
          answerMatchScore,
          isCorrect,
          feedback: !transcriptConfidence
            ? "I could not hear clearly. Let's try again."
            : isCorrect
            ? "Great job!"
            : "That's okay. Let's try again.",
        });
      } catch (parseError) {
        console.error("Speech check parse error:", parseError);
        console.error("stdout:", stdout);

        return res.status(500).json({
          message: "Speech check failed while parsing Whisper result.",
        });
      }
    }
  );
});

// ============= LEARNER CRUD ENDPOINTS =============

// Get all learners
app.get("/api/learners", async (_req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM learners ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Fetch learners error:", error);
    res.status(500).json({
      message: "Failed to fetch learners",
      error,
    });
  }
});

// Get single learner by ID - MUST COME AFTER search route
app.get("/api/learners/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      "SELECT * FROM learners WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Learner not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Fetch learner error:", error);
    res.status(500).json({
      message: "Failed to fetch learner",
      error,
    });
  }
});

app.post("/api/learners", async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      birthday,
      diagnosis,
      profile_picture_url,
      bio_description,
      guardian_first_name,
      guardian_last_name,
      guardian_phone,
      guardian_email,
    } = req.body;

    if (!first_name || !last_name || !birthday || !diagnosis || 
        !guardian_first_name || !guardian_last_name || !guardian_phone || !guardian_email) {
      return res.status(400).json({ 
        message: "Missing required fields",
      });
    }

    const result = await db.query(
      `
      INSERT INTO learners (
        first_name, last_name, birthday, diagnosis, profile_picture_url,
        bio_description, guardian_first_name, guardian_last_name, 
        guardian_phone, guardian_email
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
      `,
      [
        first_name, last_name, birthday, diagnosis, profile_picture_url || null,
        bio_description || null, guardian_first_name, guardian_last_name,
        guardian_phone, guardian_email
      ]
    );

    res.status(201).json({
      message: "Learner enrolled successfully",
      learner: result.rows[0],
    });
  } catch (error: any) {

  console.error("Create learner error:", error);

  // PostgreSQL unique constraint error
  if (error.code === '23505') {
    return res.status(409).json({
      message: 'Learner already enrolled.',
    });
  }

  res.status(500).json({
    message: "Failed to enroll learner",
    error,
  });
}
});

app.put("/api/learners/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      birthday,
      diagnosis,
      profile_picture_url,
      bio_description,
      guardian_first_name,
      guardian_last_name,
      guardian_phone,
      guardian_email,
    } = req.body;

    const result = await db.query(
      `
      UPDATE learners 
      SET 
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        birthday = COALESCE($3, birthday),
        diagnosis = COALESCE($4, diagnosis),
        profile_picture_url = COALESCE($5, profile_picture_url),
        bio_description = COALESCE($6, bio_description),
        guardian_first_name = COALESCE($7, guardian_first_name),
        guardian_last_name = COALESCE($8, guardian_last_name),
        guardian_phone = COALESCE($9, guardian_phone),
        guardian_email = COALESCE($10, guardian_email),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *
      `,
      [
        first_name, last_name, birthday, diagnosis, profile_picture_url || null,
        bio_description || null, guardian_first_name, guardian_last_name,
        guardian_phone, guardian_email, id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Learner not found" });
    }

    res.json({
      message: "Learner updated successfully",
      learner: result.rows[0],
    });
  } catch (error) {
    console.error("Update learner error:", error);
    res.status(500).json({
      message: "Failed to update learner",
      error,
    });
  }
});

app.delete("/api/learners/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      "DELETE FROM learners WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Learner not found" });
    }

    res.json({ message: "Learner deleted successfully" });
  } catch (error) {
    console.error("Delete learner error:", error);
    res.status(500).json({
      message: "Failed to delete learner",
      error,
    });
  }
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 5001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`MOBI backend running on http://0.0.0.0:${PORT}`);
});