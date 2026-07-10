import { useEffect, useState } from "react";
import { Play, X } from "lucide-react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import TherapistLayout from "../../../layouts/TherapistLayout";
import { getActivityById } from "../../../services/activityApi";
import ActivityPlayPreviewModal from "../../../components/center/materials/preview/ActivityPlayPreviewModal";

interface ActivityStep {
  id: string;
  step_order: number;
  step_type: string;
  instruction: string | null;
  prompt: string | null;
  expected_answers: string[] | null;
  accepted_variations: string[] | null;

  question?: string | null;
  lesson?: string | null;
  correct_feedback?: string | null;
  wrong_feedback?: string | null;
  media?: any[] | null;
  choices?: any[] | null;
  topics?: string[] | null;
  materials_needed?: string[] | null;
  image_url?: string | null;
  media_url?: string | null;
}

interface Activity {
  id: string;
  title: string;
  description: string | null;
  activity_type: string;
  speech_ladder_level: string;
  max_attempts: number;
  estimated_minutes: number;
  allow_skip: boolean;
  thumbnail_url: string | null;
  ai_voice_gender: string | null;
  ai_voice_speed: string | null;
  uploaded_by: string | null;
  created_at: string;
  activity_steps: ActivityStep[];
}

const fallbackImage =
  "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=500";

function ActivityPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const locationState = location.state as
    | {
        fromNotification?: boolean;
        centerFeedback?: string;
        activityStatus?: string;
      }
    | null;

  const fromNotification =
    locationState?.fromNotification === true;

  const [activity, setActivity] =
    useState<Activity | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isPlayPreviewOpen, setIsPlayPreviewOpen] =
    useState(false);

  useEffect(() => {
    async function loadActivity() {
      try {
        if (!id) return;

        const data = await getActivityById(id);
        setActivity(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load activity.");
      } finally {
        setLoading(false);
      }
    }

    loadActivity();
  }, [id]);

  const handlePlayPreview = () => {
    setIsPlayPreviewOpen(true);
  };

  const handleClose = () => {
    if (fromNotification) {
      navigate("/therapist/notifications");
      return;
    }

    navigate("/therapist/materials");
  };

  return (
    <TherapistLayout>
      {() => (
        <div className="bg-[#E4C9E5]/80 h-full rounded-[30px] p-8 inter overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-5xl font-medium itim">
              Activity Preview
            </h1>

            <button
              onClick={handleClose}
              className="
                w-11 h-11 flex items-center justify-center
                bg-[#F5EEF6] rounded-xl shadow-md
                hover:bg-[#EBD7EC] transition
              "
            >
              <X size={20} className="text-[#7A5D7F]" />
            </button>
          </div>

          {loading && (
            <p className="text-lg font-semibold">
              Loading...
            </p>
          )}

          {error && (
            <p className="text-red-600 font-semibold">
              {error}
            </p>
          )}

          {!loading && activity && (
            <>
              <div className="bg-white rounded-[30px] shadow-md overflow-hidden">
                <img
                  src={activity.thumbnail_url || fallbackImage}
                  alt={activity.title}
                  className="w-full h-72 object-cover"
                />

                <div className="p-8">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
                    <div>
                      <h1 className="text-5xl font-medium itim">
                        {activity.title}
                      </h1>

                      <p className="text-gray-600 mt-3">
                        {activity.description ||
                          "No description provided."}
                      </p>
                    </div>

                    <button
                      onClick={handlePlayPreview}
                      className="
                        shrink-0 flex items-center justify-center gap-2
                        bg-[#965DEB] text-white px-5 py-3 rounded-2xl
                        font-semibold shadow-md hover:bg-[#8248D6] transition
                      "
                    >
                      <Play size={18} fill="white" />
                      Play Preview
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                    <Info
                      label="Type"
                      value={activity.activity_type}
                    />

                    <Info
                      label="Level"
                      value={activity.speech_ladder_level}
                    />

                    <Info
                      label="Attempts"
                      value={String(activity.max_attempts)}
                    />

                    <Info
                      label="Minutes"
                      value={`${activity.estimated_minutes} min`}
                    />

                    <Info
                      label="Skip Allowed"
                      value={activity.allow_skip ? "Yes" : "No"}
                    />

                    <Info
                      label="AI Voice"
                      value={`${activity.ai_voice_gender || "girl"} / ${
                        activity.ai_voice_speed || "moderate"
                      }`}
                    />

                    <Info
                      label="Uploaded By"
                      value={activity.uploaded_by || "Center Admin"}
                    />

                    <Info
                      label="Created"
                      value={new Date(
                        activity.created_at
                      ).toLocaleDateString()}
                    />
                  </div>

                  {fromNotification && (
                    <div className="mb-8 rounded-[26px] bg-[#F8F1FA] border border-[#E6C5E6] p-6">
                      <h2 className="text-3xl font-medium itim mb-2">
                        Center Feedback
                      </h2>

                      <p className="text-sm text-gray-600 mb-4">
                        Review the center admin&apos;s feedback before
                        editing or resubmitting this activity.
                      </p>

                      <div className="bg-white rounded-2xl p-4 shadow-sm">
                        <p className="text-sm font-semibold mb-1">
                          Status:
                        </p>

                        <p className="text-sm text-[#9021C4] font-semibold mb-4">
                          {locationState?.activityStatus ||
                            "Changes requested"}
                        </p>

                        <p className="text-sm font-semibold mb-1">
                          Comments / Feedback:
                        </p>

                        <p className="text-sm text-gray-700 leading-relaxed">
                          {locationState?.centerFeedback ||
                            "No feedback message provided yet."}
                        </p>
                      </div>
                    </div>
                  )}

                  <h2 className="text-3xl font-medium itim mb-4">
                    Activity Timeline
                  </h2>

                  <div className="space-y-4">
                    {activity.activity_steps?.length ? (
                      activity.activity_steps.map((step) => (
                        <div
                          key={step.id}
                          className="border border-[#E59BE7] rounded-2xl p-5"
                        >
                          <p className="font-bold text-[#9021C4] mb-2">
                            Step {step.step_order}:{" "}
                            {step.step_type}
                          </p>

                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Instruction:</strong>{" "}
                            {step.instruction || "None"}
                          </p>

                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Prompt:</strong>{" "}
                            {step.prompt || "None"}
                          </p>

                          <p className="text-sm text-gray-600">
                            <strong>Expected Answers:</strong>{" "}
                            {step.expected_answers?.length
                              ? step.expected_answers.join(", ")
                              : "None"}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">
                        No activity steps added yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <ActivityPlayPreviewModal
                open={isPlayPreviewOpen}
                activity={activity}
                fallbackImage={fallbackImage}
                onClose={() => setIsPlayPreviewOpen(false)}
              />
            </>
          )}
        </div>
      )}
    </TherapistLayout>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="bg-[#F5EEF6] rounded-2xl p-4 shadow-sm">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-bold">{value}</p>
    </div>
  );
}

export default ActivityPreview;