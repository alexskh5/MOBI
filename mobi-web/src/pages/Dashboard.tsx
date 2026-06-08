import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";

const cards = [
  { title: "Enroll Learner", path: "/enroll" },
  { title: "Register Therapist", path: "/therapist" },
  { title: "Create Activity", path: "/create-activity" },
  { title: "Activity Library", path: "/activities" },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <div className="grid grid-cols-2 gap-4 mt-6">
          {cards.map((card) => (
            <div
              key={card.title}
              onClick={() => navigate(card.path)}
              className="bg-white p-6 rounded-xl shadow cursor-pointer hover:shadow-lg"
            >
              {card.title}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}