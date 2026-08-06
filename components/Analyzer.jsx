"use client";

import { useState } from "react";
import {
  Sparkles,
  Loader2,
  Copy,
  Check,
  X,
  ChevronRight,
  MessageCircleQuestion,
} from "lucide-react";
import { FOCUS_RING } from "../lib/constants";
import { uid, todayISO, scoreColor, scoreBar } from "../lib/utils";
import CvInput from "./CvInput";

export default function Analyzer({
  applications,
  persistApplications,
  onViewTracker,
  onPrepInterview,
}) {
  const [cvText, setCvText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");
  const [result, setResult] = useState(null);
  const [savedToTracker, setSavedToTracker] = useState(false);
  const [copied, setCopied] = useState(false);

  async function runAnalysis() {
    if (!cvText.trim() || !jobDescription.trim()) return;
    setAnalyzing(true);
    setAnalysisError("");
    setResult(null);
    setSavedToTracker(false);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText, jobDescription, company, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analisis gagal.");
      setResult(data);
    } catch (e) {
      console.error(e);
      setAnalysisError(e.message || "Analisis gagal. Coba lagi sebentar lagi.");
    } finally {
      setAnalyzing(false);
    }
  }

  function copyLetter() {
    if (!result?.cover_letter) return;
    navigator.clipboard?.writeText(result.cover_letter).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function saveAnalysisToTracker() {
    persistApplications([
      {
        id: uid(),
        company: company.trim() || "Belum diisi",
        role: role.trim() || "Belum diisi",
        status: "Melamar",
        date: todayISO(),
        link: "",
        notes: "",
        jobDescription,
        matchScore: result.match_score,
        coverLetter: result.cover_letter,
      },
      ...applications,
    ]);
    setSavedToTracker(true);
  }

  return (
    <div className="space-y-5">
      <CvInput value={cvText} onChange={setCvText} />

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Deskripsi Pekerjaan</label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={6}
          placeholder="Tempel deskripsi lowongan yang mau kamu lamar..."
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Perusahaan (opsional)
          </label>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Posisi (opsional)</label>
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </div>
      </div>

      <button
        onClick={runAnalysis}
        disabled={analyzing || !cvText.trim() || !jobDescription.trim()}
        className={`flex items-center gap-2 px-4 py-2.5 bg-teal-700 text-white text-sm font-medium rounded-md hover:bg-teal-800 disabled:opacity-40 disabled:cursor-not-allowed ${FOCUS_RING}`}
      >
        {analyzing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        {analyzing ? "Menganalisis..." : "Analisis Sekarang"}
      </button>

      {analysisError && <p className="text-sm text-rose-600">{analysisError}</p>}

      {result && result.input_valid === false && (
        <div className="mt-6 p-5 border border-amber-200 bg-amber-50 rounded-lg">
          <p className="text-sm text-amber-800">
            {result.cover_letter ||
              "CV atau deskripsi pekerjaan yang kamu masukkan sepertinya belum lengkap. Coba tempel isi CV dan deskripsi lowongan yang lebih detail, ya."}
          </p>
        </div>
      )}

      {result && result.input_valid !== false && (
        <div className="mt-6 p-5 border border-slate-200 rounded-lg bg-white space-y-5">
          <div>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-bold ${scoreColor(result.match_score)}`}>
                {result.match_score}
              </span>
              <span className="text-sm text-slate-400">/ 100 kecocokan</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${scoreBar(result.match_score)}`}
                style={{ width: `${result.match_score}%` }}
              />
            </div>
          </div>

          {Array.isArray(result.strengths) && result.strengths.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                Kekuatan yang Cocok
              </p>
              <ul className="space-y-1.5">
                {result.strengths.map((s, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-700">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {Array.isArray(result.gaps) && result.gaps.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                Perlu Diperkuat
              </p>
              <ul className="space-y-1.5">
                {result.gaps.map((g, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-700">
                    <X className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" /> {g}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.cover_letter && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Draft Cover Letter
                </p>
                <button
                  onClick={copyLetter}
                  className={`flex items-center gap-1 text-xs font-medium text-teal-700 hover:underline rounded ${FOCUS_RING}`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Tersalin" : "Salin"}
                </button>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {result.cover_letter}
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
            {savedToTracker ? (
              <p className="flex items-center gap-1.5 text-sm text-emerald-600">
                <Check className="w-4 h-4" /> Tersimpan ke tracker.
                <button
                  onClick={onViewTracker}
                  className={`flex items-center text-teal-700 hover:underline ml-1 rounded ${FOCUS_RING}`}
                >
                  Lihat <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </p>
            ) : (
              <button
                onClick={saveAnalysisToTracker}
                className={`text-sm font-medium text-teal-700 hover:underline rounded ${FOCUS_RING}`}
              >
                Simpan sebagai lamaran baru →
              </button>
            )}
            <button
              onClick={() => onPrepInterview({ company, role, jobDescription })}
              className={`flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 rounded ${FOCUS_RING}`}
            >
              <MessageCircleQuestion className="w-4 h-4" /> Siapkan Interview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
