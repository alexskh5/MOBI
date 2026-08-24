import { useEffect, useState } from "react";
import { CheckCircle2, Play, Send, X } from "lucide-react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import CenterLayout from "../../../layouts/CenterLayout";
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

type ReviewAction = "approve" | "changes" | null;

const fallbackImage =
  "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=500";

function ActivityPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const locationState = location.state as
    | {
        fromNotification?: boolean;
        reviewMode?: boolean;
        notificationId?: string;
      }
    | null;

  const isReviewMode =
    locationState?.fromNotification === true ||
    locationState?.reviewMode === true ||
    searchParams.get("from") === "notification" ||
    searchParams.get("review") === "true";

  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isPlayPreviewOpen, setIsPlayPreviewOpen] = useState(false);

  const [reviewFeedback, setReviewFeedback] = useState("");
  const [submittingAction, setSubmittingAction] =
    useState<ReviewAction>(null);

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
    if (isReviewMode) {
      navigate("/center/notifications");
      return;
    }

    navigate("/center/materials");
  };

  const handleApproveAndPublish = async () => {
    if (!activity) return;

    try {
      setSubmittingAction("approve");

      // BACKEND LATER:
      // await approveActivity(activity.id, {
      //   feedback: reviewFeedback,
      //   status: "published",
      // });

      console.log("Approve activity:", {
        activityId: activity.id,
        feedback: reviewFeedback,
        status: "published",
      });

      alert("Activity approved and published.");

      navigate("/center/notifications");
    } catch (err) {
      console.error(err);
      alert("Failed to approve activity.");
    } finally {
      setSubmittingAction(null);
    }
  };

  const handleRequestChanges = async () => {
    if (!activity) return;

    if (!reviewFeedback.trim()) {
      alert("Please write feedback before requesting changes.");
      return;
    }

    try {
      setSubmittingAction("changes");

      // BACKEND LATER:
      // await requestActivityChanges(activity.id, {
      //   feedback: reviewFeedback,
      //   status: "needs_revision",
      // });

      console.log("Request changes:", {
        activityId: activity.id,
        feedback: reviewFeedback,
        status: "needs_revision",
      });

      alert("Change request sent to the therapist.");

      navigate("/center/notifications");
    } catch (err) {
      console.error(err);
      alert("Failed to send change request.");
    } finally {
      setSubmittingAction(null);
    }
  };

  return (
    <CenterLayout>
      {() => (
        <div className="bg-[#E4C9E5]/80 h-full rounded-[30px] p-8 inter overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-5xl font-medium itim">Activity Preview</h1>

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

          {loading && <p className="text-lg font-semibold">Loading...</p>}

          {error && <p className="text-red-600 font-semibold">{error}</p>}

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
                        {activity.description || "No description provided."}
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
                    <Info label="Type" value={activity.activity_type} />
                    <Info label="Level" value={activity.speech_ladder_level} />
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
                      value={new Date(activity.created_at).toLocaleDateString()}
                    />
                  </div>

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
                      ))
                    ) : (
                      <p className="text-gray-500">
                        No activity steps added yet.
                      </p>
                    )}
                  </div>

                  {isReviewMode && (
                    <div className="mt-8 border-t border-[#E6C5E6] pt-7">
                      <div className="bg-[#F8F1FA] rounded-[26px] p-6">
                        <h2 className="text-3xl font-medium itim mb-2">
                          Center Review
                        </h2>

                        <p className="text-sm text-gray-600 mb-5">
                          Add feedback for the therapist before approving or
                          requesting changes.
                        </p>

                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Comments / Feedback
                        </label>

                        <textarea
                          value={reviewFeedback}
                          onChange={(e) =>
                            setReviewFeedback(e.target.value)
                          }
                          placeholder="Write your comments, suggestions, or required changes here..."
                          className="
                            w-full
                            min-h-36
                            resize-none
                            rounded-2xl
                            border
                            border-[#E6C5E6]
                            bg-white
                            p-4
                            outline-none
                            text-sm
                            focus:border-[#965DEB]
                            focus:ring-2
                            focus:ring-[#965DEB]/20
                          "
                        />

                        <div className="mt-6 flex flex-wrap gap-4">
                          <button
                            onClick={handleApproveAndPublish}
                            disabled={submittingAction !== null}
                            className="
                              flex
                              items-center
                              justify-center
                              gap-2
                              bg-[#9021C4]
                              text-white
                              px-6
                              py-3
                              rounded-xl
                              font-semibold
                              hover:bg-[#7B18A8]
                              transition
                              disabled:opacity-60
                              disabled:cursor-not-allowed
                            "
                          >
                            <CheckCircle2 size={18} />
                            {submittingAction === "approve"
                              ? "Approving..."
                              : "Approve & Publish"}
                          </button>

                          <button
                            onClick={handleRequestChanges}
                            disabled={submittingAction !== null}
                            className="
                              flex
                              items-center
                              justify-center
                              gap-2
                              bg-white
                              border
                              border-[#9021C4]
                              text-[#9021C4]
                              px-6
                              py-3
                              rounded-xl
                              font-semibold
                              hover:bg-[#F5EEF6]
                              transition
                              disabled:opacity-60
                              disabled:cursor-not-allowed
                            "
                          >
                            <Send size={18} />
                            {submittingAction === "changes"
                              ? "Sending..."
                              : "Request Changes"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
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