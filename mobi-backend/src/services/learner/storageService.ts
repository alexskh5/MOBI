// mobi-backend/src/services/learner/storageService.ts

import { supabase } from "../../config/supabase";

/* =========================================================
   CONFIGURATION
========================================================= */

/*
  Private Supabase Storage bucket used for learner photos.

  IMPORTANT:
  Keep this bucket PRIVATE because learner profile images
  should not be publicly accessible.
*/
const LEARNER_PHOTO_BUCKET =
  "learner-profile-photos";

/* =========================================================
   HELPERS
========================================================= */

/*
  Converts the MIME type into a suitable file extension.

  Example:

  image/jpeg -> jpg
  image/png  -> png
  image/webp -> webp
*/
function getImageExtension(
  mimeType: string,
): string {
  switch (mimeType) {
    case "image/png":
      return "png";

    case "image/webp":
      return "webp";

    case "image/gif":
      return "gif";

    case "image/jpeg":
    case "image/jpg":
    default:
      return "jpg";
  }
}

/* =========================================================
   UPLOAD LEARNER PROFILE PHOTO
========================================================= */

/*
  Uploads the learner's profile photo into Supabase Storage.

  Storage structure:

  learner-profile-photos/
      center-id/
          learner-id/
              profile-timestamp.jpg

  We return the STORAGE PATH rather than a public URL because
  the bucket is private.

  Later, when learner information is fetched, the backend can
  create a short-lived signed URL for displaying the image.
*/
export async function uploadLearnerProfilePhoto(
  file: Express.Multer.File,
  centerId: string,
  learnerId: string,
): Promise<string> {
  const extension =
    getImageExtension(
      file.mimetype,
    );

  const filePath =
    `${centerId}/${learnerId}/profile-${Date.now()}.${extension}`;

  const {
    data,
    error,
  } = await supabase.storage
    .from(LEARNER_PHOTO_BUCKET)
    .upload(
      filePath,
      file.buffer,
      {
        contentType:
          file.mimetype,

        /*
          We generate unique filenames, so we should not
          overwrite existing objects accidentally.
        */
        upsert: false,
      },
    );

  if (error) {
    console.error(
      "Unable to upload learner profile photo:",
      error,
    );

    throw error;
  }

  /*
    data.path is the permanent object path inside the bucket.

    Example:

    centerUUID/learnerUUID/profile-123456789.jpg
  */
  return data.path;
}

/* =========================================================
   CREATE SIGNED PHOTO URL
========================================================= */

/*
  Private files cannot be opened directly.

  This function generates a temporary URL that the frontend
  can use when displaying a learner's photo.

  Default lifetime:
  1 hour = 3600 seconds.
*/
export async function createLearnerPhotoSignedUrl(
  storagePath: string,
  expiresInSeconds = 3600,
): Promise<string> {
  const {
    data,
    error,
  } = await supabase.storage
    .from(LEARNER_PHOTO_BUCKET)
    .createSignedUrl(
      storagePath,
      expiresInSeconds,
    );

  if (error) {
    console.error(
      "Unable to create learner photo signed URL:",
      error,
    );

    throw error;
  }

  return data.signedUrl;
}