"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, Loader2 } from "lucide-react";
import { loadLocal, saveLocal, PROFILE_KEY } from "../lib/storage";
import { extractPdfText } from "../lib/pdf";

export default function CvInput({ value, onChange }) {
  const [saved, setSaved] = useState(true);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    const profile = loadLocal(PROFILE_KEY, { cvText: "" });
    onChange(profile.cvText || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function persist(text) {
    saveLocal(PROFILE_KEY, { cvText: text });
    setSaved(true);
  }

  function handleTextChange(e) {
    onChange(e.target.value);
    setSaved(false);
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.type !== "application/pdf") {
      setParseError("File harus berformat PDF.");
      return;
    }

    setParsing(true);
    setParseError("");
    try {
      const text = await extractPdfText(file);
      if (!text.trim()) {
        setParseError(
          "Gak nemu teks di PDF ini — kemungkinan hasil scan gambar. Coba copy-paste manual."
        );
        return;
      }
      onChange(text);
      persist(text);
    } catch (err) {
      console.error(err);
      setParseError("Gagal membaca file PDF. Coba file lain atau copy-paste manual.");
    } finally {
      setParsing(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-medium text-slate-500">CV / Resume kamu</label>
        <div className="flex items-center gap-3">
          {value && <span className="text-xs text-emerald-600">{saved ? "Tersimpan ✓" : ""}</span>}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={parsing}
            className="flex items-center gap-1 text-xs font-medium text-teal-700 hover:underline disabled:opacity-50"
          >
            {parsing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            {parsing ? "Membaca PDF..." : "Upload PDF"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFile}
            className="hidden"
          />
        </div>
      </div>
      <textarea
        value={value}
        onChange={handleTextChange}
        onBlur={() => persist(value)}
        rows={6}
        placeholder="Tempel isi CV / resume kamu di sini, atau upload file PDF..."
        className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
      />
      {parseError && <p className="text-xs text-rose-600 mt-1">{parseError}</p>}
    </div>
  );
}
