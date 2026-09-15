import { randomUUID } from "crypto";
import { supabaseAdmin } from "../config/supabase";

const ACTIVITY_ASSETS_BUCKET = "activity-assets";
const SIGNED_URL_SECONDS = 60 * 60 * 24 * 7;
const MAX_FILE_SIZE_BYTES = 1024 * 1024 * 50;

const ALLOWED_ACTIVITY_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/m4a",
  "audio/x-m4a",
  "audio/wav",
  "audio/x-wav",
  "audio/webm",
  "audio/ogg",
  "audio/aac",
  "application/pdf",
];

export type ActivityAssetCategory =
  | "thumbnail"
  | "step-media"
  | "prompt-audio"
  | "regulation";

function getExtension(file: Express.Multer.File) {
  const nameExtension = file.originalname.split(".").pop();

  if (nameExtension && nameExtension !== file.originalname) {
    return nameExtension.toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  const mimeExtension = file.mimetype.split("/").pop();
  return mimeExtension?.replace(/[^a-z0-9]/g, "") || "bin";
}

function isAllowedFileForCategory(
  file: Express.Multer.File,
  category: ActivityAssetCategory,
) {
  const mimeType = file.mimetype || "";

  if (category === "thumbnail") {
    return mimeType.startsWith("image/");
  }

  if (category === "prompt-audio") {
    return mimeType.startsWith("audio/");
  }

  return (
    mimeType.startsWith("image/") ||
    mimeType.startsWith("video/") ||
    mimeType.startsWith("audio/") ||
    mimeType === "application/pdf"
  );
}

async function ensureActivityAssetsBucket() {
  const { data: bucket } = await supabaseAdmin.storage.getBucket(
    ACTIVITY_ASSETS_BUCKET,
  );

  if (bucket) {
    const { error } = await supabaseAdmin.storage.updateBucket(
      ACTIVITY_ASSETS_BUCKET,
      {
        public: false,
        fileSizeLimit: MAX_FILE_SIZE_BYTES,
        allowedMimeTypes: ALLOWED_ACTIVITY_MIME_TYPES,
      },
    );

    if (error) {
      throw error;
    }

    return;
  }

  const { error } = await supabaseAdmin.storage.createBucket(
    ACTIVITY_ASSETS_BUCKET,
    {
      public: false,
      fileSizeLimit: MAX_FILE_SIZE_BYTES,
      allowedMimeTypes: ALLOWED_ACTIVITY_MIME_TYPES,
    },
  );

  if (error && !error.message.toLowerCase().includes("already exists")) {
    throw error;
  }
}

export async function uploadActivityAsset({
  file,
  centerId,
  category,
}: {
  file: Express.Multer.File;
  centerId: string;
  category: ActivityAssetCategory;
}) {
  if (!isAllowedFileForCategory(file, category)) {
    throw new Error("This file type is not allowed for that upload field.");
  }

  await ensureActivityAssetsBucket();

  const extension = getExtension(file);
  const path = [
    centerId,
    category,
    `${Date.now()}-${randomUUID()}.${extension}`,
  ].join("/");

  const { error } = await supabaseAdmin.storage
    .from(ACTIVITY_ASSETS_BUCKET)
    .upload(path, file.buffer, {
      contentType: file.mimetype || "application/octet-stream",
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data, error: signedUrlError } = await supabaseAdmin.storage
    .from(ACTIVITY_ASSETS_BUCKET)
    .createSignedUrl(path, SIGNED_URL_SECONDS);

  if (signedUrlError) {
    throw signedUrlError;
  }

  return {
    bucket: ACTIVITY_ASSETS_BUCKET,
    path,
    url: data.signedUrl,
    mimeType: file.mimetype,
    size: file.size,
    originalName: file.originalname,
    category,
  };
}
