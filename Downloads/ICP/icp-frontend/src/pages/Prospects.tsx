import { useEffect, useState } from "react";
import API from "../api";
import { Link } from "react-router-dom";

type ProspectListMeta = {
  id: string;
  created_at?: string;
  summary?: string; // optional: backend can compute summary
};

export default function Prospects() {
  const [lists, setLists] = useState<ProspectListMeta[]>([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await API.get("/prospects");
        // normalize: allow either {items:[...]} or raw array
        const items = Array.isArray(data) ? data : data?.items ?? [];
        setLists(items);
      } catch (e: any) {
        setErr(e?.response?.data?.detail || "Failed to load prospect lists");
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto space-y-4">
        <h1 className="text-2xl font-semibold">Prospect Lists</h1>
        {err && <div className="text-sm text-red-600">{err}</div>}
        <div className="space-y-2">
          {lists.length === 0 && (
            <div className="text-gray-600">No lists yet.</div>
          )}
          {lists.map((l) => (
            <Link
              key={l.id}
              to={`/prospects/${l.id}`}
              className="block rounded border bg-white p-3 hover:bg-gray-50"
            >
              <div className="font-medium">List #{l.id}</div>
              <div className="text-sm text-gray-600">
                {l.summary || "Prospect list"}{" "}
                {l.created_at
                  ? `• ${new Date(l.created_at).toLocaleString()}`
                  : ""}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
