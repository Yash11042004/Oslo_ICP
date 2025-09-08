import { useState } from "react";
import API from "../api";

export default function Uploads() {
  const [vaultFile, setVaultFile] = useState<File | null>(null);
  const [userFile, setUserFile] = useState<File | null>(null);
  const [msg, setMsg] = useState("");

  const upload = async (path: string, file: File | null) => {
    if (!file) return setMsg("Please choose a file first.");
    const form = new FormData();
    form.append("file", file);
    setMsg("Uploading...");
    try {
      await API.post(path, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMsg("Upload successful ✅");
    } catch (e: any) {
      const detail = e?.response?.data?.detail;
      setMsg(typeof detail === "string" ? detail : "Upload failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-2xl font-semibold">Uploads</h1>
        {msg && (
          <div className="rounded border bg-white p-3 text-sm">{msg}</div>
        )}

        <div className="rounded-lg border bg-white p-4 space-y-3">
          <h2 className="font-medium">Vault Dataset (Admin)</h2>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => setVaultFile(e.target.files?.[0] || null)}
          />
          <button
            onClick={() => upload("/admin/import-vault", vaultFile)}
            className="px-4 py-2 rounded bg-gray-900 text-white"
          >
            Upload Vault
          </button>
        </div>

        <div className="rounded-lg border bg-white p-4 space-y-3">
          <h2 className="font-medium">My Dataset</h2>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => setUserFile(e.target.files?.[0] || null)}
          />
          <button
            onClick={() => upload("/import/excel", userFile)}
            className="px-4 py-2 rounded bg-gray-900 text-white"
          >
            Upload My Excel
          </button>
        </div>
      </div>
    </div>
  );
}
