import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen flex items-center justify-center bg-purple-50 px-4">
      <section className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-purple-700 text-center">
          MOBI
        </h1>
        <p className="text-center text-gray-500 mt-2 mb-8">
          Center Admin Login
        </p>

        <div className="space-y-4">
          <input
            className="w-full border rounded-xl px-4 py-3"
            placeholder="Email"
            type="email"
          />

          <input
            className="w-full border rounded-xl px-4 py-3"
            placeholder="Password"
            type="password"
          />

          <button
            onClick={() => navigate("/dashboard")}
            className="w-full bg-purple-600 text-white rounded-xl py-3 font-semibold hover:bg-purple-700"
          >
            Login
          </button>
        </div>
      </section>
    </main>
  );
}