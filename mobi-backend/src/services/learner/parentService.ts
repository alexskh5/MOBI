// mobi-backend/src/services/learner/parentService.ts


import { supabase } from "../../config/supabase";

interface CreateParentData {
  center_id: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  email: string;
  phone_number?: string | null;
  home_address?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  authorized_for_updates?: boolean;
}

interface LinkParentData {
  parent_id: string;
  learner_id: string;
  relationship: string;
  is_primary_guardian?: boolean;
  can_view_progress?: boolean;
  can_guide_activities?: boolean;
}

export async function createParent(data: CreateParentData) {
  const { data: parent, error } = await supabase
    .from("center_parents")
    .insert(data)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return parent;
}

export async function linkParentToLearner(data: LinkParentData) {
  const { data: relationship, error } = await supabase
    .from("parent_learners")
    .insert(data)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return relationship;
}