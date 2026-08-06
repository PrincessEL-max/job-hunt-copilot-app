"use client";

import { useRef, useState } from "react";
import { Download, Upload, Loader2 } from "lucide-react";
import { FOCUS_RING } from "../lib/constants";
import { loadLocal, saveLocal, PROFILE_KEY } from "../lib/storage";

export default function DataBackup({ applications, persistApplications }) {
  const fileInputRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState("");

  function showMessage(text) {
    setMessage(text);
    setTimeout(() => setMessage(""), 4000);
  }

  function handleExport() {
    const profile = loadLocal(PROFILE_KEY, { cvText: "" });
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      applications,
      profile,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `job-hunt-copilot-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showMessage("File backup diunduh.");
  }

  async function handleImportFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!Array.isArray(data.applications)) {
        throw new Error("invalid-format");
      }

      const existingIds = new Set(applications.map((a) => a.id));
      const newOnes = data.applications.filter((a) => a && a.id && !existingIds.has(a.id));
      persistApplications([...applications, ...newOnes]);

      if (data.profile?.cvText) {
        const currentProfile = loadLocal(PROFILE_KEY, { cvText: "" });
        const shouldReplace =
          !currentProfile.cvText ||
          (currentProfile.cvText !== data.profile.cvText &&
            confirm(
              "File backup punya CV tersimpan yang berbeda dari yang sekarang. Ganti dengan versi dari file backup?"
            ));
        if (shouldReplace) saveLocal(PROFILE_KEY, data.profile);
      }

      showMessage(
        newOnes.length > 0
          ? `Berhasil impor ${newOnes.length} lamaran baru.`
          : "Semua lamaran di file ini sudah ada."
      );
    } catch (err) {
      console.error(err);
      showMessage("Gagal membaca file. Pastikan ini file backup yang valid dari aplikasi ini.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="flex items-center gap-3 flex-wrap justify-end">
      <button
        onClick={handleExport}
        className={`flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded ${FOCUS_RING}`}
        title="Download semua data sebagai file JSON"
      >
        <Download className="w-3.5 h-3.5" /> Export
      </button>
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={importing}
        className={`flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded disabled:opacity-50 ${FOCUS_RING}`}
        title="Impor data dari file backup"
      >
        {importing ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Upload className="w-3.5 h-3.5" />
        )}
        Import
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={handleImportFile}
        className="hidden"
      />
      {message && <span className="text-xs text-slate-500 basis-full text-right">{message}</span>}
    </div>
  );
}
