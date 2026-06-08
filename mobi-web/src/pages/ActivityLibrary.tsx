import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

type Activity = {
  id: number;
  title: string;
  level: string;
  category: string;
  difficulty: string;
  target_answers: string;
  created_at: string;
};

export default function ActivityLibrary() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await api.get("/activities");
        setActivities(response.data);
      } catch (error) {
        console.error("Fetch activities error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Activity Library
            </h1>
            <p className="text-gray-500 mt-1">
              View and preview created MOBI activities from PostgreSQL.
            </p>
          </div>

          <button
            onClick={() => navigate("/create-activity")}
            className="rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white hover:bg-purple-700"
          >
            + Create Activity
          </button>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-3xl p-8 text-center text-gray-500">
            Loading activities...
          </div>
        ) : activities.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center text-gray-500">
            No activities yet. Create one first.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition"
              >
                <p className="text-xs font-bold uppercase tracking-wide text-purple-500">
                  Activity #{activity.id}
                </p>

                <h2 className="text-lg font-bold text-gray-800 mt-2">
                  {activity.title || "Untitled Activity"}
                </h2>

                <p className="text-sm text-gray-500 mt-2">
                  Target: {activity.target_answers || "No target"}
                </p>

                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full">
                    {activity.level}
                  </span>
                  <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                    {activity.category}
                  </span>
                  <span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full">
                    {activity.difficulty}
                  </span>
                </div>

                <button
                  onClick={() => navigate(`/activities/${activity.id}`)}
                  className="mt-5 w-full rounded-xl bg-purple-600 px-4 py-3 font-semibold text-white hover:bg-purple-700"
                >
                  Preview Activity
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}