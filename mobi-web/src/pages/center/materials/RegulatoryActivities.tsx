import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  PlayCircle,
  Search,
  Upload,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import CenterLayout from "../../../layouts/CenterLayout";
import {
  createActivity,
  getActivities,
  uploadActivityAsset,
} from "../../../services/activityApi";

type ActivityData = {
  id: string;
  title: string;
  description: string | null;
  uploaded_by: string | null;
  created_at: string;
  thumbnail_url: string | null;
  activity_type: string;
};

const REGULATORY_ACTIVITY_TYPE = "Regulatory Activity";

function RegulatoryActivities() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadActivities();
  }, []);

  async function loadActivities() {
    try {
      setLoading(true);
      setError("");
      const data = await getActivities();
      setActivities(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load regulatory activities.");
    } finally {
      setLoading(false);
    }
  }

  const regulatoryActivities = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return activities
      .filter((activity) => activity.activity_type === REGULATORY_ACTIVITY_TYPE)
      .filter((activity) => {
        if (!search) {
          return true;
        }

        return (
          activity.title.toLowerCase().includes(search) ||
          (activity.description?.toLowerCase().includes(search) ?? false)
        );
      });
  }, [activities, searchTerm]);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleSave = async () => {
    try {
      if (!title.trim()) {
        alert("Please add a title.");
        return;
      }

      if (!selectedFile) {
        alert("Please upload a regulatory video, audio, image, or activity file.");
        return;
      }

      setSaving(true);

      const asset = await uploadActivityAsset(selectedFile, "regulation");

      await createActivity({
        title: title.trim(),
        description: description.trim() || null,
        activity_type: REGULATORY_ACTIVITY_TYPE,
        speech_ladder_level: "word",
        max_attempts: 1,
        estimated_minutes: 3,
        allow_skip: true,
        success_required_count: 1,
        thumbnail_url:
          selectedFile.type.startsWith("image/")
            ? asset.url
            : null,
        ai_voice_gender: "girl",
        ai_voice_speed: "moderate",
        status: "published",
        uploaded_by: "Center Admin",
        access_scope: "center_library",
        learner_ids: [],
        delivery_mode: "guided_off_screen",
        attention_demand: "low",
        sensory_load: "low",
        movement_level:
          selectedFile.type.startsWith("video/") ? "active" : "light",
        interaction_mode: "movement",
        topic_tags: ["regulation"],
        visual_support_level: "standard",
        communication_mode: "spoken_words",
        assistance_level: "some_assistance",
        sensory_features: [],
        steps: [
          {
            step_order: 1,
            step_type: "regulation",
            instruction: "Use this before a learner begins structured work.",
            prompt: title.trim(),
            media_url: asset.url,
            media: [asset],
            expected_answers: [],
            accepted_variations: [],
            can_repeat: true,
            can_give_hint: false,
            can_skip: true,
            ai_feedback_rules: {},
          },
        ],
      });

      resetForm();
      await loadActivities();
      alert("Regulatory activity saved.");
    } catch (err) {
      console.error(err);
      alert("Failed to save regulatory activity.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <CenterLayout>
      {(sidebarOpen, setSidebarOpen) => (
        <div className="inter flex h-full flex-col rounded-[30px] bg-[#E4C9E5]/80 p-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!sidebarOpen && (
                <button
                  className="text-3xl"
                  onClick={() => setSidebarOpen(true)}
                >
                  ☰
                </button>
              )}

              <button
                onClick={() => navigate("/center/materials")}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-md"
              >
                <ArrowLeft size={20} />
              </button>

              <h1 className="itim text-5xl font-medium">
                Regulatory Activities
              </h1>
            </div>

            <div className="flex w-96 items-center rounded-xl bg-[#F5EEF6] px-5 py-3 shadow-md">
              <Search size={20} className="mr-3 text-gray-500" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search"
                className="w-full bg-transparent outline-none"
              />
            </div>
          </div>

          <div className="mb-6 border-b border-gray-500" />

          <div className="grid flex-1 grid-cols-[380px_1fr] gap-6 overflow-hidden">
            <div className="overflow-y-auto rounded-[25px] border border-[#AAB7DA] bg-white p-6">
              <h2 className="mb-4 text-2xl font-semibold">
                Add Regulatory Activity
              </h2>

              <label className="mb-2 block text-sm font-medium">
                Title
              </label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Example: Animal yoga warm-up"
                className="mb-4 w-full border border-[#AAB7DA] bg-white p-3 outline-none"
              />

              <label className="mb-2 block text-sm font-medium">
                Notes for therapist
              </label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="When to use it, how long to play it, or what response to observe."
                rows={4}
                className="mb-4 w-full resize-none border border-[#AAB7DA] bg-white p-3 outline-none"
              />

              <input
                id="regulatory-upload"
                type="file"
                accept="image/*,video/*,audio/*,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              <label
                htmlFor="regulatory-upload"
                className="flex h-44 cursor-pointer flex-col items-center justify-center border-2 border-dashed border-[#AAB7DA] bg-[#c9c4de]/20 text-center"
              >
                <Upload size={26} className="mb-2 text-[#5B4B8A]" />
                <span className="font-medium">
                  Upload media
                </span>
                <span className="text-sm text-gray-500">
                  Video, audio, image, or PDF
                </span>
              </label>

              {selectedFile && (
                <div className="mt-4 rounded-xl border border-[#E0D7EA] bg-[#FAF8FC] p-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium">
                      {selectedFile.name}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      className="text-[#B25AC7] hover:text-red-500"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {selectedFile.type.startsWith("image/") && previewUrl && (
                    <img
                      src={previewUrl}
                      alt=""
                      className="max-h-44 w-full object-contain"
                    />
                  )}

                  {selectedFile.type.startsWith("video/") && previewUrl && (
                    <video src={previewUrl} controls className="max-h-44 w-full" />
                  )}

                  {selectedFile.type.startsWith("audio/") && previewUrl && (
                    <audio src={previewUrl} controls className="w-full" />
                  )}
                </div>
              )}

              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="mt-5 w-full rounded-xl bg-[#E37D4A] px-5 py-3 font-semibold text-white disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Regulatory Activity"}
              </button>
            </div>

            <div className="overflow-y-auto pr-2">
              {loading && (
                <p className="text-center text-lg font-semibold">
                  Loading regulatory activities...
                </p>
              )}

              {error && (
                <p className="text-center font-semibold text-red-600">
                  {error}
                </p>
              )}

              {!loading && !error && regulatoryActivities.length === 0 && (
                <p className="text-center text-lg font-semibold">
                  No regulatory activities found.
                </p>
              )}

              <div className="grid grid-cols-3 gap-4">
                {regulatoryActivities.map((activity) => (
                  <div
                    key={activity.id}
                    onClick={() => navigate(`/center/materials/${activity.id}`)}
                    className="flex h-72 cursor-pointer flex-col overflow-hidden rounded-3xl bg-white shadow-md transition hover:shadow-lg"
                  >
                    <div className="flex h-36 items-center justify-center bg-[#F5EEF6]">
                      {activity.thumbnail_url ? (
                        <img
                          src={activity.thumbnail_url}
                          alt={activity.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <PlayCircle size={42} className="text-[#5B4B8A]" />
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="mb-2 text-lg font-bold leading-tight">
                        {activity.title}
                      </h3>
                      <p className="line-clamp-2 text-sm text-gray-600">
                        {activity.description || "No notes added."}
                      </p>
                      <p className="mt-auto text-xs text-gray-500">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </CenterLayout>
  );
}

export default RegulatoryActivities;
