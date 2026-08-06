"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Trash2,
  Download,
  Pencil,
  RotateCcw,
  Sparkles,
  Loader2,
  FileText,
} from "lucide-react";
import { FOCUS_RING } from "../lib/constants";
import { uid } from "../lib/utils";
import { loadLocal, saveLocal, CV_BUILDER_KEY } from "../lib/storage";

const EMPTY_DATA = {
  fullName: "",
  phone: "",
  email: "",
  targetPosition: "",
  targetCompany: "",
  aboutMe: "",
  education: [],
  workExperiences: [],
  projects: [],
  hardSkills: "",
  softSkills: "",
  manualCvHtml: null,
  coverLetterText: "",
  manualLetterHtml: null,
};

const inputClass =
  "w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600";
const labelClass = "block text-xs font-medium text-slate-500 mb-1";
const previewFont = { fontFamily: "Georgia, 'Times New Roman', Times, serif" };

function bulletsOf(text) {
  return (text || "")
    .split("\n")
    .map((b) => b.trim())
    .filter(Boolean);
}

export default function CvBuilder() {
  const [data, setData] = useState(EMPTY_DATA);
  const [loaded, setLoaded] = useState(false);
  const [previewMode, setPreviewMode] = useState("cv");
  const [generatingLetter, setGeneratingLetter] = useState(false);
  const [letterError, setLetterError] = useState("");
  const previewRef = useRef(null);

  useEffect(() => {
    const saved = loadLocal(CV_BUILDER_KEY, EMPTY_DATA);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData({ ...EMPTY_DATA, ...saved });
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveLocal(CV_BUILDER_KEY, data);
  }, [data, loaded]);

  function update(field, value) {
    setData((d) => ({ ...d, [field]: value }));
  }

  // ---- Education ----
  function addEducation() {
    update("education", [
      ...data.education,
      { id: uid(), institution: "", major: "", dateRange: "", gpa: "" },
    ]);
  }
  function updateEducation(id, field, value) {
    update(
      "education",
      data.education.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  }
  function removeEducation(id) {
    update(
      "education",
      data.education.filter((e) => e.id !== id)
    );
  }

  // ---- Work experience ----
  function addWorkExperience() {
    update("workExperiences", [
      ...data.workExperiences,
      { id: uid(), title: "", company: "", dateRange: "", bulletsText: "" },
    ]);
  }
  function updateWorkExperience(id, field, value) {
    update(
      "workExperiences",
      data.workExperiences.map((w) => (w.id === id ? { ...w, [field]: value } : w))
    );
  }
  function removeWorkExperience(id) {
    update(
      "workExperiences",
      data.workExperiences.filter((w) => w.id !== id)
    );
  }

  // ---- Projects ----
  function addProject() {
    update("projects", [...data.projects, { id: uid(), title: "", bulletsText: "" }]);
  }
  function updateProject(id, field, value) {
    update(
      "projects",
      data.projects.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  }
  function removeProject(id) {
    update(
      "projects",
      data.projects.filter((p) => p.id !== id)
    );
  }

  // ---- Manual edit mode (works for whichever preview is currently active) ----
  const manualField = previewMode === "cv" ? "manualCvHtml" : "manualLetterHtml";
  const isManual = data[manualField] != null;

  function enableManualEdit() {
    const html = previewRef.current?.innerHTML || "";
    update(manualField, html);
  }
  function resetToTemplate() {
    update(manualField, null);
  }
  function captureManualEdit() {
    if (!previewRef.current) return;
    update(manualField, previewRef.current.innerHTML);
  }

  // ---- Cover letter generation ----
  async function generateCoverLetter() {
    if (!data.fullName.trim() || !data.targetPosition.trim() || !data.targetCompany.trim()) return;
    setGeneratingLetter(true);
    setLetterError("");
    try {
      const res = await fetch("/api/cover-letter-from-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.fullName,
          aboutMe: data.aboutMe,
          education: data.education,
          workExperiences: data.workExperiences,
          projects: data.projects,
          hardSkills: data.hardSkills,
          softSkills: data.softSkills,
          targetPosition: data.targetPosition,
          targetCompany: data.targetCompany,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal membuat surat lamaran.");
      setData((d) => ({ ...d, coverLetterText: result.letter, manualLetterHtml: null }));
      setPreviewMode("letter");
    } catch (e) {
      console.error(e);
      setLetterError(e.message || "Gagal membuat surat lamaran. Coba lagi sebentar lagi.");
    } finally {
      setGeneratingLetter(false);
    }
  }

  const letterReady =
    data.fullName.trim() && data.targetPosition.trim() && data.targetCompany.trim();

  return (
    <div className="space-y-8">
      {/* ---------- FORM ---------- */}
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-3">
            <label className={labelClass}>Nama Lengkap</label>
            <input
              value={data.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              className={inputClass}
              placeholder="Nama lengkap kamu"
            />
          </div>
          <div>
            <label className={labelClass}>Nomor Telepon</label>
            <input
              value={data.phone}
              onChange={(e) => update("phone", e.target.value)}
              className={inputClass}
              placeholder="+62..."
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Email</label>
            <input
              value={data.email}
              onChange={(e) => update("email", e.target.value)}
              className={inputClass}
              placeholder="nama@email.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-teal-50 border border-teal-200 rounded-lg">
          <div>
            <label className={labelClass}>Posisi yang Dilamar</label>
            <input
              value={data.targetPosition}
              onChange={(e) => update("targetPosition", e.target.value)}
              className={inputClass}
              placeholder="mis. Mechanical Engineer"
            />
          </div>
          <div>
            <label className={labelClass}>Perusahaan Tujuan</label>
            <input
              value={data.targetCompany}
              onChange={(e) => update("targetCompany", e.target.value)}
              className={inputClass}
              placeholder="mis. PT Contoh Sejahtera"
            />
          </div>
          <p className="sm:col-span-2 text-xs text-teal-800">
            Posisi tampil sebagai subjudul di CV, dan keduanya dipakai untuk generate surat lamaran
            kerja di bawah.
          </p>
        </div>

        <div>
          <label className={labelClass}>Tentang Saya</label>
          <textarea
            value={data.aboutMe}
            onChange={(e) => update("aboutMe", e.target.value)}
            rows={3}
            placeholder="Ringkasan singkat tentang latar belakang dan tujuan kariermu..."
            className={inputClass}
          />
        </div>

        {/* Education */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-slate-500">Pendidikan</label>
            <button
              type="button"
              onClick={addEducation}
              className={`flex items-center gap-1 text-xs font-medium text-teal-700 hover:underline rounded ${FOCUS_RING}`}
            >
              <Plus className="w-3.5 h-3.5" /> Tambah
            </button>
          </div>
          <div className="space-y-3">
            {data.education.map((edu) => (
              <div
                key={edu.id}
                className="p-3 border border-slate-200 rounded-lg bg-white space-y-2"
              >
                <input
                  value={edu.institution}
                  onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
                  placeholder="Institusi / Universitas"
                  className={inputClass}
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={edu.major}
                    onChange={(e) => updateEducation(edu.id, "major", e.target.value)}
                    placeholder="Jurusan"
                    className={inputClass}
                  />
                  <input
                    value={edu.dateRange}
                    onChange={(e) => updateEducation(edu.id, "dateRange", e.target.value)}
                    placeholder="Periode (mis. 2023 - Sekarang)"
                    className={inputClass}
                  />
                </div>
                <input
                  value={edu.gpa}
                  onChange={(e) => updateEducation(edu.id, "gpa", e.target.value)}
                  placeholder="IPK (opsional)"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => removeEducation(edu.id)}
                  className={`flex items-center gap-1 text-xs text-rose-600 hover:underline rounded ${FOCUS_RING}`}
                >
                  <Trash2 className="w-3.5 h-3.5" /> Hapus
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Work experience */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-slate-500">
              Pengalaman Kerja (opsional)
            </label>
            <button
              type="button"
              onClick={addWorkExperience}
              className={`flex items-center gap-1 text-xs font-medium text-teal-700 hover:underline rounded ${FOCUS_RING}`}
            >
              <Plus className="w-3.5 h-3.5" /> Tambah
            </button>
          </div>
          <div className="space-y-3">
            {data.workExperiences.map((exp) => (
              <div
                key={exp.id}
                className="p-3 border border-slate-200 rounded-lg bg-white space-y-2"
              >
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={exp.title}
                    onChange={(e) => updateWorkExperience(exp.id, "title", e.target.value)}
                    placeholder="Posisi / Jabatan"
                    className={inputClass}
                  />
                  <input
                    value={exp.company}
                    onChange={(e) => updateWorkExperience(exp.id, "company", e.target.value)}
                    placeholder="Perusahaan"
                    className={inputClass}
                  />
                </div>
                <input
                  value={exp.dateRange}
                  onChange={(e) => updateWorkExperience(exp.id, "dateRange", e.target.value)}
                  placeholder="Periode (mis. Feb 2026 - Jul 2026)"
                  className={inputClass}
                />
                <textarea
                  value={exp.bulletsText}
                  onChange={(e) => updateWorkExperience(exp.id, "bulletsText", e.target.value)}
                  placeholder={"Poin tugas/pencapaian, satu per baris..."}
                  rows={3}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => removeWorkExperience(exp.id)}
                  className={`flex items-center gap-1 text-xs text-rose-600 hover:underline rounded ${FOCUS_RING}`}
                >
                  <Trash2 className="w-3.5 h-3.5" /> Hapus
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-slate-500">
              Pengalaman Projek (opsional)
            </label>
            <button
              type="button"
              onClick={addProject}
              className={`flex items-center gap-1 text-xs font-medium text-teal-700 hover:underline rounded ${FOCUS_RING}`}
            >
              <Plus className="w-3.5 h-3.5" /> Tambah
            </button>
          </div>
          <div className="space-y-3">
            {data.projects.map((p) => (
              <div key={p.id} className="p-3 border border-slate-200 rounded-lg bg-white space-y-2">
                <input
                  value={p.title}
                  onChange={(e) => updateProject(p.id, "title", e.target.value)}
                  placeholder="Nama Projek"
                  className={inputClass}
                />
                <textarea
                  value={p.bulletsText}
                  onChange={(e) => updateProject(p.id, "bulletsText", e.target.value)}
                  placeholder={"Poin deskripsi projek, satu per baris..."}
                  rows={3}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => removeProject(p.id)}
                  className={`flex items-center gap-1 text-xs text-rose-600 hover:underline rounded ${FOCUS_RING}`}
                >
                  <Trash2 className="w-3.5 h-3.5" /> Hapus
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Hard Skill</label>
            <textarea
              value={data.hardSkills}
              onChange={(e) => update("hardSkills", e.target.value)}
              rows={2}
              placeholder="Pisahkan dengan koma, mis. Python, C++, AutoCad"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Soft Skill</label>
            <textarea
              value={data.softSkills}
              onChange={(e) => update("softSkills", e.target.value)}
              rows={2}
              placeholder="Pisahkan dengan koma, mis. Kerja tim, Problem solving"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* ---------- PREVIEW ---------- */}
      <div>
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div className="flex gap-1 border border-slate-200 rounded-md p-0.5 bg-slate-50">
            <button
              onClick={() => setPreviewMode("cv")}
              className={`px-3 py-1.5 text-xs font-medium rounded ${FOCUS_RING} ${
                previewMode === "cv" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"
              }`}
            >
              CV
            </button>
            <button
              onClick={() => setPreviewMode("letter")}
              className={`px-3 py-1.5 text-xs font-medium rounded ${FOCUS_RING} ${
                previewMode === "letter" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"
              }`}
            >
              Surat Lamaran
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {isManual ? (
              <button
                onClick={resetToTemplate}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 border border-slate-300 rounded-md hover:bg-slate-50 ${FOCUS_RING}`}
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset ke Template
              </button>
            ) : (
              <button
                onClick={enableManualEdit}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 border border-slate-300 rounded-md hover:bg-slate-50 ${FOCUS_RING}`}
              >
                <Pencil className="w-3.5 h-3.5" /> Edit Manual
              </button>
            )}
            <button
              onClick={() => window.print()}
              className={`flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 ${FOCUS_RING}`}
            >
              <Download className="w-4 h-4" /> Download PDF
            </button>
          </div>
        </div>

        {isManual && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mb-3">
            Kamu sedang mengedit langsung di preview. Perubahan form gak akan kelihatan di sini
            sampai kamu klik &quot;Reset ke Template&quot;.
          </p>
        )}

        {previewMode === "letter" && !isManual && (
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <button
              onClick={generateCoverLetter}
              disabled={generatingLetter || !letterReady}
              className={`flex items-center gap-2 px-4 py-2.5 bg-teal-700 text-white text-sm font-medium rounded-md hover:bg-teal-800 disabled:opacity-40 disabled:cursor-not-allowed ${FOCUS_RING}`}
            >
              {generatingLetter ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {generatingLetter
                ? "Membuat..."
                : data.coverLetterText
                  ? "Generate Ulang"
                  : "Generate Surat Lamaran"}
            </button>
            {!letterReady && (
              <p className="text-xs text-slate-500">
                Isi Nama, Posisi yang Dilamar, dan Perusahaan Tujuan dulu.
              </p>
            )}
          </div>
        )}
        {letterError && <p className="text-sm text-rose-600 mb-3">{letterError}</p>}

        {previewMode === "cv" &&
          (isManual ? (
            <div
              id="cv-preview"
              ref={previewRef}
              contentEditable
              suppressContentEditableWarning
              onBlur={captureManualEdit}
              className="bg-white border border-slate-200 shadow-sm mx-auto p-10 text-black outline-none"
              style={{ ...previewFont, maxWidth: "780px" }}
              dangerouslySetInnerHTML={{ __html: data.manualCvHtml }}
            />
          ) : (
            <div
              id="cv-preview"
              ref={previewRef}
              className="bg-white border border-slate-200 shadow-sm mx-auto p-10 text-black"
              style={{ ...previewFont, maxWidth: "780px" }}
            >
              <div className="flex justify-between items-end border-b-2 border-black pb-2 mb-3 gap-4">
                <div>
                  <h1 className="text-3xl leading-tight break-words">
                    {data.fullName || "Nama Lengkap"}
                  </h1>
                  {data.targetPosition && (
                    <p className="text-sm italic mt-0.5">{data.targetPosition}</p>
                  )}
                </div>
                <p className="text-xs whitespace-nowrap pb-1">
                  {[data.phone, data.email].filter(Boolean).join(" | ")}
                </p>
              </div>

              {data.aboutMe && <p className="text-sm leading-relaxed mb-4">{data.aboutMe}</p>}

              {data.education.length > 0 && (
                <section className="mb-4">
                  <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-2">
                    Pendidikan
                  </h2>
                  {data.education.map((edu) => (
                    <div key={edu.id} className="mb-2 last:mb-0">
                      <p className="font-bold text-sm uppercase">
                        {edu.institution}
                        {edu.dateRange && ` (${edu.dateRange})`}
                        {edu.major && ` - ${edu.major}`}
                      </p>
                      {edu.gpa && <p className="text-xs">IPK: {edu.gpa}</p>}
                    </div>
                  ))}
                </section>
              )}

              {data.workExperiences.length > 0 && (
                <section className="mb-4">
                  <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-2">
                    Pengalaman
                  </h2>
                  {data.workExperiences.map((exp) => (
                    <div key={exp.id} className="mb-3 last:mb-0">
                      {(exp.title || exp.company) && (
                        <>
                          <p className="font-bold text-sm uppercase">{exp.title}</p>
                          <p className="text-xs italic mb-1">
                            {[exp.company, exp.dateRange].filter(Boolean).join(" | ")}
                          </p>
                        </>
                      )}
                      {bulletsOf(exp.bulletsText).length > 0 && (
                        <ul className="list-disc list-outside ml-4 text-sm space-y-0.5">
                          {bulletsOf(exp.bulletsText).map((b, i) => (
                            <li key={i}>{b}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </section>
              )}

              {data.projects.length > 0 && (
                <section className="mb-4">
                  <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-2">
                    Projek
                  </h2>
                  {data.projects.map((p) => (
                    <div key={p.id} className="mb-3 last:mb-0">
                      {p.title && <p className="font-bold text-sm uppercase mb-1">{p.title}</p>}
                      {bulletsOf(p.bulletsText).length > 0 && (
                        <ul className="list-disc list-outside ml-4 text-sm space-y-0.5">
                          {bulletsOf(p.bulletsText).map((b, i) => (
                            <li key={i}>{b}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </section>
              )}

              {data.hardSkills && (
                <section className="mb-4">
                  <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-2">
                    Hard Skill
                  </h2>
                  <p className="text-sm">{data.hardSkills}</p>
                </section>
              )}

              {data.softSkills && (
                <section>
                  <h2 className="text-sm font-bold uppercase border-b border-black pb-1 mb-2">
                    Soft Skill
                  </h2>
                  <p className="text-sm">{data.softSkills}</p>
                </section>
              )}
            </div>
          ))}

        {previewMode === "letter" &&
          (isManual ? (
            <div
              id="cv-preview"
              ref={previewRef}
              contentEditable
              suppressContentEditableWarning
              onBlur={captureManualEdit}
              className="bg-white border border-slate-200 shadow-sm mx-auto p-10 text-black outline-none"
              style={{ ...previewFont, maxWidth: "780px" }}
              dangerouslySetInnerHTML={{ __html: data.manualLetterHtml }}
            />
          ) : (
            <div
              id="cv-preview"
              ref={previewRef}
              className="bg-white border border-slate-200 shadow-sm mx-auto p-10 text-black"
              style={{ ...previewFont, maxWidth: "780px" }}
            >
              {data.coverLetterText ? (
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {data.coverLetterText}
                </div>
              ) : (
                <div className="text-center py-16 text-slate-400">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm">
                    Belum ada surat lamaran. Isi data di atas lalu klik &quot;Generate Surat
                    Lamaran&quot;.
                  </p>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
