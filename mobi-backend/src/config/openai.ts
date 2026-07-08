//mobi-backend/src/config/openai.ts
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY in dotenv");
}

export const openai = new OpenAI ({
    apiKey,
});