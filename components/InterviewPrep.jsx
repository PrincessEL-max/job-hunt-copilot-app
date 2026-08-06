"use client";

import { useState } from "react";
import { Sparkles, Loader2, Copy, Check, MessageCircleQuestion } from "lucide-react";
import { FOCUS_RING, QUESTION_CATEGORY_STYLES } from "../lib/constants";
import CvInput from "./CvInput";

const CATEGORY_ORDER = ["Umum", "Teknis", "Berdasarkan CV"];

// Note: the parent passes a `key` that changes whenever a new `prefill` is
// set (see JobHuntCopilot.jsx), so this remounts fresh instead of needing an
// effect to re-sync state from props — same pattern as ApplicationForm.
export default function InterviewPrep({ prefill }) {
  const [cvText, setCvText] = useState("");
  const [jobDescription, setJobDescription] = useState(prefill?.jobDescription || "");
  const [company, setCompany] = useState(prefill?.company || "");
  const [role, setRole] = useState(prefill?.role || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  async function generatePrep() {
    if (!cvText.trim() || !jobDescription.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/interview-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText, jobDescription, company, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat persiapan interview.");
      setResult(data);
    } catch (e) {
      console.error(e);
      setError(e.message || "Gagal membuat persiapan interview. Coba lagi sebentar lagi.");
    } finally {
      setLoading(false);
    }
  }

  function copyAll() {
    if (!result?.questions?.length) return;
    const text = result.questions
      .map((q) => `[${q.category}] ${q.question}\nTip: ${q.tip}`)
      .join("\n\n");
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const groupedQuestions =
    result?.questions?.reduce((acc, q) => {
      (acc[q.category] = acc[q.category] || []).push(q);
      return acc;
    }, {}) || {};

  return (
    <div className="space-y-5">
      <CvInput value={cvText} onChange={setCvText} />

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Deskripsi Pekerjaan</label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={6}
          placeholder="Tempel deskripsi lowongan yang mau kamu persiapkan..."
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
        onClick={generatePrep}
        disabled={loading || !cvText.trim() || !jobDescription.trim()}
        className={`flex items-center gap-2 px-4 py-2.5 bg-teal-700 text-white text-sm font-medium rounded-md hover:bg-teal-800 disabled:opacity-40 disabled:cursor-not-allowed ${FOCUS_RING}`}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        {loading ? "Menyiapkan..." : "Buatkan Persiapan Interview"}
      </button>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      {result && result.input_valid === false && (
        <div className="p-5 border border-amber-200 bg-amber-50 rounded-lg">
          <p className="text-sm text-amber-800">
            CV atau deskripsi pekerjaan yang kamu masukkan sepertinya belum lengkap. Coba tempel isi
            CV dan deskripsi lowongan yang lebih detail, ya.
          </p>
        </div>
      )}

      {result && result.input_valid !== false && result.questions?.length > 0 && (
        <div className="p-5 border border-slate-200 rounded-lg bg-white space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-700">
              <MessageCircleQuestion className="w-4 h-4" />
              <p className="text-sm font-semibold">{result.questions.length} Pertanyaan Latihan</p>
            </div>
            <button
              onClick={copyAll}
              className={`flex items-center gap-1 text-xs font-medium text-teal-700 hover:underline rounded ${FOCUS_RING}`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Tersalin" : "Salin Semua"}
            </button>
          </div>

          {CATEGORY_ORDER.filter((cat) => groupedQuestions[cat]?.length).map((category) => (
            <div key={category}>
              <span
                className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full border mb-3 ${QUESTION_CATEGORY_STYLES[category]}`}
              >
                {category}
              </span>
              <div className="space-y-3">
                {groupedQuestions[category].map((q, i) => (
                  <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                    <p className="text-sm font-medium text-slate-900 mb-1.5">{q.question}</p>
                    <p className="text-sm text-slate-600">💡 {q.tip}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
