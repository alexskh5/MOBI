export default function Sidebar() {
  return (
    <aside className="hidden md:flex w-64 bg-purple-700 text-white p-6 flex-col">
      <h2 className="text-2xl font-bold mb-10">MOBI</h2>

      <nav className="space-y-4">
        <p className="font-semibold">Dashboard</p>
        <p>Enroll Learner</p>
        <p>Register Therapist</p>
        <p>Create Activity</p>
        <p>Activity Library</p>
      </nav>
    </aside>
  );
}