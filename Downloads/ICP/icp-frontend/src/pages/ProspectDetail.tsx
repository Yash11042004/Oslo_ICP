import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api";

type Company = Record<string, any>;
type Person = Record<string, any>;

export default function ProspectDetail() {
  const { id } = useParams();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await API.get(`/prospects/${id}`);
        // expect shape like { companies:[], people:[] } (adjust if needed)
        setCompanies(data?.companies ?? []);
        setPeople(data?.people ?? []);
      } catch (e: any) {
        setErr(e?.response?.data?.detail || "Failed to load prospect list");
      }
    })();
  }, [id]);

  const Cell = ({ v }: { v: any }) => (
    <td className="px-3 py-2 border-b">{String(v ?? "")}</td>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">Prospect List #{id}</h1>
        {err && <div className="text-sm text-red-600">{err}</div>}

        <section className="space-y-2">
          <h2 className="font-medium">Companies ({companies.length})</h2>
          <div className="overflow-auto rounded border bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  {/* Adjust visible columns as per your schema */}
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">Industry</th>
                  <th className="px-3 py-2 text-left">Size</th>
                  <th className="px-3 py-2 text-left">Location</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c, i) => (
                  <tr key={i} className="odd:bg-white even:bg-gray-50">
                    <Cell v={c.name || c.company_name} />
                    <Cell v={c.industry} />
                    <Cell v={c.size || c.employee_count} />
                    <Cell v={c.location || c.country} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="font-medium">People ({people.length})</h2>
          <div className="overflow-auto rounded border bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">Title</th>
                  <th className="px-3 py-2 text-left">Department</th>
                  <th className="px-3 py-2 text-left">Email</th>
                </tr>
              </thead>
              <tbody>
                {people.map((p, i) => (
                  <tr key={i} className="odd:bg-white even:bg-gray-50">
                    <Cell v={p.name} />
                    <Cell v={p.title || p.role} />
                    <Cell v={p.department} />
                    <Cell v={p.email} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
