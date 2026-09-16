//mobi-backend/src/config/openai.ts
import dotenv from "dotenv";
import type OpenAI from "openai";

dotenv.config();

let openai: OpenAI | null = null;

export async function getOpenAI() {
    if (openai) {
        return openai;
    }

    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
        throw new Error("Missing OPENAI_API_KEY in dotenv");
    }

    const { default: OpenAIClient } = await import("openai");

    openai = new OpenAIClient ({
        apiKey,
    });

    return openai;
}
