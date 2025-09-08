import { Link } from "react-router-dom";
export default function App() {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="p-6 bg-white rounded shadow text-center">
        <h1 className="text-xl font-semibold mb-3">ICP Builder Frontend 🚀</h1>
        <Link
          to="/dashboard"
          className="px-4 py-2 rounded bg-gray-900 text-white"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
