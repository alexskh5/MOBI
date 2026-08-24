//mobi-backend/src/services/learner/learnerService.ts


import { supabase } from "../../config/supabase";

export async function createLearner(data: any) {
  const { data: learner, error } = await supabase
    .from("learners")
    .insert(data)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return learner;
}

/* =========================================================
   UPDATE LEARNER PROFILE PHOTO
========================================================= */

/*
  After the learner has been created, the photo is uploaded
  to Supabase Storage.

  This function saves the resulting Storage object path in:

  learners.profile_picture_url

  Although the database column is named "url", for our
  private bucket we intentionally store the Storage path.

  When displaying the photo later, the backend will convert
  this path into a temporary signed URL.
*/
export async function updateLearnerProfilePicture(
  learnerId: string,
  storagePath: string,
) {
  const {
    data: learner,
    error,
  } = await supabase
    .from("learners")
    .update({
      profile_picture_url:
        storagePath,
    })
    .eq(
      "id",
      learnerId,
    )
    .select()
    .single();

  if (error) {
    console.error(
      "Unable to update learner profile picture:",
      error,
    );

    throw error;
  }

  return learner;
}