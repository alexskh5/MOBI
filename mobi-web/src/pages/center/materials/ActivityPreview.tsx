// MOBI/mobi-web/src/pages/center/materials/ActivityPreview.tsx

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CenterLayout from "../../../layouts/CenterLayout";
import { getActivityById } from "../../../services/activityApi";

interface ActivityStep {
  id: string;
  step_order: number;
  step_type: string;
  instruction: string | null;
  prompt: string | null;
  expected_answers: string[] | null;
  accepted_variations: string[] | null;
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

  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <CenterLayout>
      {() => (
        <div className="bg-[#E4C9E5]/80 h-full rounded-[30px] p-8 inter overflow-y-auto">
          <button
            onClick={() => navigate("/center/materials")}
            className="mb-5 bg-white px-5 py-2 rounded-xl shadow"
          >
            ← Back to Materials
          </button>

          {loading && <p className="text-lg font-semibold">Loading...</p>}

          {error && <p className="text-red-600 font-semibold">{error}</p>}

          {!loading && activity && (
            <div className="bg-white rounded-[30px] shadow-md overflow-hidden">
              <img
                src={activity.thumbnail_url || fallbackImage}
                alt={activity.title}
                className="w-full h-72 object-cover"
              />

              <div className="p-8">
                <h1 className="text-5xl font-medium itim mb-3">
                  {activity.title}
                </h1>

                <p className="text-gray-600 mb-6">
                  {activity.description || "No description provided."}
                </p>

                <div className="grid grid-cols-4 gap-4 mb-8">
                  <Info label="Type" value={activity.activity_type} />
                  <Info label="Level" value={activity.speech_ladder_level} />
                  <Info label="Attempts" value={String(activity.max_attempts)} />
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
                    value={new Date(activity.created_at).toLocaleDateString()}
                  />
                </div>

                <h2 className="text-3xl font-medium itim mb-4">
                  Activity Timeline
                </h2>

                <div className="space-y-4">
                  {activity.activity_steps?.map((step) => (
                    <div
                      key={step.id}
                      className="border border-[#E59BE7] rounded-2xl p-5"
                    >
                      <p className="font-bold text-[#9021c4] mb-2">
                        Step {step.step_order}: {step.step_type}
                      </p>

                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Instruction:</strong>{" "}
                        {step.instruction || "None"}
                      </p>

                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Prompt:</strong> {step.prompt || "None"}
                      </p>

                      <p className="text-sm text-gray-600">
                        <strong>Expected Answers:</strong>{" "}
                        {step.expected_answers?.length
                          ? step.expected_answers.join(", ")
                          : "None"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </CenterLayout>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#F5EEF6] rounded-2xl p-4 shadow-sm">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-bold">{value}</p>
    </div>
  );
}

export default ActivityPreview;