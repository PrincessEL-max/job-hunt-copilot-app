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
  Camera,
  X,
} from "lucide-react";
import { FOCUS_RING } from "../lib/constants";
import { uid, formatLongDateID } from "../lib/utils";
import { loadLocal, saveLocal, CV_BUILDER_KEY } from "../lib/storage";
import { resizeImage } from "../lib/image";
import ClassicTemplate from "./cv-templates/ClassicTemplate";
import ModernTemplate from "./cv-templates/ModernTemplate";
import TwoColumnTemplate from "./cv-templates/TwoColumnTemplate";

const CV_TEMPLATES = {
  classic: { label: "Klasik", component: ClassicTemplate },
  modern: { label: "Modern", component: ModernTemplate },
  twocolumn: { label: "Dua Kolom", component: TwoColumnTemplate },
};

const EMPTY_DATA = {
  fullName: "",
  phone: "",
  email: "",
  showPhoto: false,
  photoDataUrl: null,
  targetPosition: "",
  targetCompany: "",
  template: "classic",
  aboutMe: "",
  education: [],
  workExperiences: [],
  organizations: [],
  projects: [],
  certifications: [],
  hardSkills: "",
  softSkills: "",
  languages: "",
  linkedinUrl: "",
  githubUrl: "",
  portfolioUrl: "",
  manualCvHtml: null,
  // Surat lamaran only
  birthPlace: "",
  birthDate: "",
  address: "",
  letterCity: "",
  jobSource: "",
  letterOpening: "",
  letterBody: "",
  letterClosing: "",
  manualLetterHtml: null,
};

const inputClass =
  "w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600";
const labelClass = "block text-xs font-medium text-slate-500 mb-1";
const previewFont = { fontFamily: "Georgia, 'Times New Roman', Times, serif" };

function AssistButton({ onClick, loading, label = "Bantu AI" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`flex items-center gap-1 text-xs font-medium text-teal-700 hover:underline disabled:opacity-50 rounded ${FOCUS_RING}`}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Sparkles className="w-3.5 h-3.5" />
      )}
      {loading ? "Memproses..." : label}
    </button>
  );
}

export default function CvBuilder() {
  const [data, setData] = useState(EMPTY_DATA);
  const [loaded, setLoaded] = useState(false);
  const [previewMode, setPreviewMode] = useState("cv");
  const [generatingLetter, setGeneratingLetter] = useState(false);
  const [letterError, setLetterError] = useState("");
  const [assistingFields, setAssistingFields] = useState(() => new Set());
  const [assistError, setAssistError] = useState("");
  const [photoProcessing, setPhotoProcessing] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const previewRef = useRef(null);
  const photoInputRef = useRef(null);

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

  function setAssisting(key, value) {
    setAssistingFields((prev) => {
      const next = new Set(prev);
      if (value) next.add(key);
      else next.delete(key);
      return next;
    });
  }
  const isAssisting = (key) => assistingFields.has(key);

  // ---- Photo ----
  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("File harus berupa gambar.");
      return;
    }
    setPhotoProcessing(true);
    setPhotoError("");
    try {
      const dataUrl = await resizeImage(file);
      update("photoDataUrl", dataUrl);
    } catch (err) {
      console.error(err);
      setPhotoError("Gagal memproses foto. Coba file lain.");
    } finally {
      setPhotoProcessing(false);
    }
  }
  function removePhoto() {
    update("photoDataUrl", null);
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

  // ---- Organizations ----
  function addOrganization() {
    update("organizations", [
      ...data.organizations,
      { id: uid(), title: "", company: "", dateRange: "", bulletsText: "" },
    ]);
  }
  function updateOrganization(id, field, value) {
    update(
      "organizations",
      data.organizations.map((o) => (o.id === id ? { ...o, [field]: value } : o))
    );
  }
  function removeOrganization(id) {
    update(
      "organizations",
      data.organizations.filter((o) => o.id !== id)
    );
  }

  // ---- Certifications ----
  function addCertification() {
    update("certifications", [
      ...data.certifications,
      { id: uid(), name: "", issuer: "", date: "" },
    ]);
  }
  function updateCertification(id, field, value) {
    update(
      "certifications",
      data.certifications.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  }
  function removeCertification(id) {
    update(
      "certifications",
      data.certifications.filter((c) => c.id !== id)
    );
  }

  // ---- AI assist ----
  async function callAssist(fieldType, extra = {}) {
    const context = {
      fullName: data.fullName,
      targetPosition: data.targetPosition,
      targetCompany: data.targetCompany,
      education: data.education,
      workExperiences: data.workExperiences,
      organizations: data.organizations,
      projects: data.projects,
      certifications: data.certifications,
      hardSkills: data.hardSkills,
      softSkills: data.softSkills,
      ...extra,
    };
    const res = await fetch("/api/cv-assist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fieldType, context }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Gagal meminta bantuan AI.");
    return result.text;
  }

  async function assistAbout() {
    setAssisting("about", true);
    setAssistError("");
    try {
      update("aboutMe", await callAssist("about"));
    } catch (e) {
      setAssistError(e.message);
    } finally {
      setAssisting("about", false);
    }
  }

  async function assistHardSkills() {
    setAssisting("hardSkills", true);
    setAssistError("");
    try {
      update("hardSkills", await callAssist("hardSkills"));
    } catch (e) {
      setAssistError(e.message);
    } finally {
      setAssisting("hardSkills", false);
    }
  }

  async function assistSoftSkills() {
    setAssisting("softSkills", true);
    setAssistError("");
    try {
      update("softSkills", await callAssist("softSkills"));
    } catch (e) {
      setAssistError(e.message);
    } finally {
      setAssisting("softSkills", false);
    }
  }

  async function assistExperienceBullets(exp) {
    const key = `exp-${exp.id}`;
    setAssisting(key, true);
    setAssistError("");
    try {
      const text = await callAssist("experienceBullets", {
        entryTitle: exp.title,
        entryCompany: exp.company,
        entryNotes: exp.bulletsText,
      });
      updateWorkExperience(exp.id, "bulletsText", text);
    } catch (e) {
      setAssistError(e.message);
    } finally {
      setAssisting(key, false);
    }
  }

  async function assistProjectBullets(p) {
    const key = `proj-${p.id}`;
    setAssisting(key, true);
    setAssistError("");
    try {
      const text = await callAssist("projectBullets", {
        entryTitle: p.title,
        entryNotes: p.bulletsText,
      });
      updateProject(p.id, "bulletsText", text);
    } catch (e) {
      setAssistError(e.message);
    } finally {
      setAssisting(key, false);
    }
  }

  async function assistOrganizationBullets(org) {
    const key = `org-${org.id}`;
    setAssisting(key, true);
    setAssistError("");
    try {
      const text = await callAssist("organizationBullets", {
        entryTitle: org.title,
        entryCompany: org.company,
        entryNotes: org.bulletsText,
      });
      updateOrganization(org.id, "bulletsText", text);
    } catch (e) {
      setAssistError(e.message);
    } finally {
      setAssisting(key, false);
    }
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
          organizations: data.organizations,
          projects: data.projects,
          certifications: data.certifications,
          hardSkills: data.hardSkills,
          softSkills: data.softSkills,
          targetPosition: data.targetPosition,
          targetCompany: data.targetCompany,
          jobSource: data.jobSource,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Gagal membuat surat lamaran.");
      setData((d) => ({
        ...d,
        letterOpening: result.opening || "",
        letterBody: result.body || "",
        letterClosing: result.closing || "",
        manualLetterHtml: null,
      }));
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
  const hasLetterContent = data.letterOpening || data.letterBody || data.letterClosing;
  const SelectedCvTemplate = (CV_TEMPLATES[data.template] || CV_TEMPLATES.classic).component;
  const primaryEducation = data.education[0];
  const dataDiriRows = [
    { label: "Nama", value: data.fullName },
    (data.birthPlace || data.birthDate) && {
      label: "Tempat, Tanggal Lahir",
      value: [data.birthPlace, data.birthDate].filter(Boolean).join(", "),
    },
    primaryEducation && {
      label: "Pendidikan Terakhir",
      value: [primaryEducation.major, primaryEducation.institution].filter(Boolean).join(", "),
    },
    data.address && { label: "Alamat", value: data.address },
    data.phone && { label: "No. Telepon", value: data.phone },
    data.email && { label: "Email", value: data.email },
  ].filter(Boolean);

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

        <div className="p-3 border border-slate-200 rounded-lg bg-white">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={data.showPhoto}
              onChange={(e) => update("showPhoto", e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
            />
            Tampilkan Foto di CV
          </label>
          {data.showPhoto && (
            <div className="flex items-center gap-3 mt-3">
              {data.photoDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- base64 data URL from client-side resize, not a server asset to optimize
                <img
                  src={data.photoDataUrl}
                  alt="Foto profil"
                  className="w-16 h-16 rounded-md object-cover border border-slate-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-slate-300" />
                </div>
              )}
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={photoProcessing}
                  className={`flex items-center gap-1.5 text-xs font-medium text-teal-700 hover:underline disabled:opacity-50 rounded ${FOCUS_RING}`}
                >
                  {photoProcessing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Camera className="w-3.5 h-3.5" />
                  )}
                  {photoProcessing
                    ? "Memproses..."
                    : data.photoDataUrl
                      ? "Ganti Foto"
                      : "Upload Foto"}
                </button>
                {data.photoDataUrl && (
                  <button
                    type="button"
                    onClick={removePhoto}
                    className={`flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:underline rounded ${FOCUS_RING}`}
                  >
                    <X className="w-3.5 h-3.5" /> Hapus Foto
                  </button>
                )}
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
            </div>
          )}
          {photoError && <p className="text-xs text-rose-600 mt-2">{photoError}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={labelClass}>LinkedIn (opsional)</label>
            <input
              value={data.linkedinUrl}
              onChange={(e) => update("linkedinUrl", e.target.value)}
              className={inputClass}
              placeholder="linkedin.com/in/..."
            />
          </div>
          <div>
            <label className={labelClass}>GitHub (opsional)</label>
            <input
              value={data.githubUrl}
              onChange={(e) => update("githubUrl", e.target.value)}
              className={inputClass}
              placeholder="github.com/..."
            />
          </div>
          <div>
            <label className={labelClass}>Portofolio (opsional)</label>
            <input
              value={data.portfolioUrl}
              onChange={(e) => update("portfolioUrl", e.target.value)}
              className={inputClass}
              placeholder="namamu.com"
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
            Posisi tampil sebagai subjudul di CV. Keduanya dipakai AI untuk menyesuaikan isian
            &quot;Bantu AI&quot; di bawah dan untuk generate surat lamaran kerja.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className={labelClass}>Tentang Saya</label>
            <AssistButton onClick={assistAbout} loading={isAssisting("about")} />
          </div>
          <textarea
            value={data.aboutMe}
            onChange={(e) => update("aboutMe", e.target.value)}
            rows={3}
            placeholder="Ringkasan singkat tentang latar belakang dan tujuan kariermu, atau klik Bantu AI..."
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
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">Poin tugas/pencapaian</span>
                    <AssistButton
                      onClick={() => assistExperienceBullets(exp)}
                      loading={isAssisting(`exp-${exp.id}`)}
                    />
                  </div>
                  <textarea
                    value={exp.bulletsText}
                    onChange={(e) => updateWorkExperience(exp.id, "bulletsText", e.target.value)}
                    placeholder={
                      "Satu poin per baris, atau isi posisi & perusahaan lalu klik Bantu AI..."
                    }
                    rows={3}
                    className={inputClass}
                  />
                </div>
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

        {/* Organizations */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-slate-500">Organisasi (opsional)</label>
            <button
              type="button"
              onClick={addOrganization}
              className={`flex items-center gap-1 text-xs font-medium text-teal-700 hover:underline rounded ${FOCUS_RING}`}
            >
              <Plus className="w-3.5 h-3.5" /> Tambah
            </button>
          </div>
          <div className="space-y-3">
            {data.organizations.map((org) => (
              <div
                key={org.id}
                className="p-3 border border-slate-200 rounded-lg bg-white space-y-2"
              >
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={org.title}
                    onChange={(e) => updateOrganization(org.id, "title", e.target.value)}
                    placeholder="Peran / Jabatan"
                    className={inputClass}
                  />
                  <input
                    value={org.company}
                    onChange={(e) => updateOrganization(org.id, "company", e.target.value)}
                    placeholder="Nama Organisasi"
                    className={inputClass}
                  />
                </div>
                <input
                  value={org.dateRange}
                  onChange={(e) => updateOrganization(org.id, "dateRange", e.target.value)}
                  placeholder="Periode (mis. 2024 - 2025)"
                  className={inputClass}
                />
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">Poin peran/kontribusi</span>
                    <AssistButton
                      onClick={() => assistOrganizationBullets(org)}
                      loading={isAssisting(`org-${org.id}`)}
                    />
                  </div>
                  <textarea
                    value={org.bulletsText}
                    onChange={(e) => updateOrganization(org.id, "bulletsText", e.target.value)}
                    placeholder={
                      "Satu poin per baris, atau isi peran & organisasi lalu klik Bantu AI..."
                    }
                    rows={3}
                    className={inputClass}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeOrganization(org.id)}
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
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">Poin deskripsi</span>
                    <AssistButton
                      onClick={() => assistProjectBullets(p)}
                      loading={isAssisting(`proj-${p.id}`)}
                    />
                  </div>
                  <textarea
                    value={p.bulletsText}
                    onChange={(e) => updateProject(p.id, "bulletsText", e.target.value)}
                    placeholder={"Satu poin per baris, atau isi nama projek lalu klik Bantu AI..."}
                    rows={3}
                    className={inputClass}
                  />
                </div>
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

        {/* Certifications */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-slate-500">Sertifikasi (opsional)</label>
            <button
              type="button"
              onClick={addCertification}
              className={`flex items-center gap-1 text-xs font-medium text-teal-700 hover:underline rounded ${FOCUS_RING}`}
            >
              <Plus className="w-3.5 h-3.5" /> Tambah
            </button>
          </div>
          <div className="space-y-3">
            {data.certifications.map((cert) => (
              <div
                key={cert.id}
                className="p-3 border border-slate-200 rounded-lg bg-white space-y-2"
              >
                <input
                  value={cert.name}
                  onChange={(e) => updateCertification(cert.id, "name", e.target.value)}
                  placeholder="Nama Sertifikasi"
                  className={inputClass}
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={cert.issuer}
                    onChange={(e) => updateCertification(cert.id, "issuer", e.target.value)}
                    placeholder="Penerbit"
                    className={inputClass}
                  />
                  <input
                    value={cert.date}
                    onChange={(e) => updateCertification(cert.id, "date", e.target.value)}
                    placeholder="Tanggal (mis. 2025)"
                    className={inputClass}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeCertification(cert.id)}
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
            <div className="flex items-center justify-between mb-1">
              <label className={labelClass}>Hard Skill</label>
              <AssistButton onClick={assistHardSkills} loading={isAssisting("hardSkills")} />
            </div>
            <textarea
              value={data.hardSkills}
              onChange={(e) => update("hardSkills", e.target.value)}
              rows={2}
              placeholder="Pisahkan dengan koma, atau klik Bantu AI..."
              className={inputClass}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={labelClass}>Soft Skill</label>
              <AssistButton onClick={assistSoftSkills} loading={isAssisting("softSkills")} />
            </div>
            <textarea
              value={data.softSkills}
              onChange={(e) => update("softSkills", e.target.value)}
              rows={2}
              placeholder="Pisahkan dengan koma, atau klik Bantu AI..."
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Bahasa (opsional)</label>
          <input
            value={data.languages}
            onChange={(e) => update("languages", e.target.value)}
            className={inputClass}
            placeholder="mis. Indonesia (Native), Inggris (Aktif)"
          />
        </div>

        {assistError && <p className="text-sm text-rose-600">{assistError}</p>}
      </div>

      {/* ---------- DATA TAMBAHAN UNTUK SURAT LAMARAN (form terpisah) ---------- */}
      <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
        <p className="text-sm font-semibold text-slate-700 mb-1">
          Data Tambahan untuk Surat Lamaran
        </p>
        <p className="text-xs text-slate-500 mb-3">
          Data ini cuma dipakai di surat lamaran, gak muncul di CV. Semua opsional — makin lengkap,
          makin rapi hasilnya.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Tempat Lahir</label>
            <input
              value={data.birthPlace}
              onChange={(e) => update("birthPlace", e.target.value)}
              className={inputClass}
              placeholder="mis. Jakarta"
            />
          </div>
          <div>
            <label className={labelClass}>Tanggal Lahir</label>
            <input
              value={data.birthDate}
              onChange={(e) => update("birthDate", e.target.value)}
              className={inputClass}
              placeholder="mis. 17 Agustus 2003"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Alamat</label>
            <input
              value={data.address}
              onChange={(e) => update("address", e.target.value)}
              className={inputClass}
              placeholder="Alamat domisili"
            />
          </div>
          <div>
            <label className={labelClass}>Kota Penulisan Surat</label>
            <input
              value={data.letterCity}
              onChange={(e) => update("letterCity", e.target.value)}
              className={inputClass}
              placeholder="mis. Jakarta"
            />
          </div>
          <div>
            <label className={labelClass}>Sumber Info Lowongan (opsional)</label>
            <input
              value={data.jobSource}
              onChange={(e) => update("jobSource", e.target.value)}
              className={inputClass}
              placeholder="mis. LinkedIn, Instagram, referensi teman"
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

          {previewMode === "cv" && !isManual && (
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-xs text-slate-400 mr-1">Desain:</span>
              {Object.entries(CV_TEMPLATES).map(([key, tpl]) => (
                <button
                  key={key}
                  onClick={() => update("template", key)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-full border ${FOCUS_RING} ${
                    data.template === key
                      ? "bg-teal-700 border-teal-700 text-white"
                      : "border-slate-300 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          )}

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
                : hasLetterContent
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
              className="bg-white border border-slate-200 shadow-sm mx-auto outline-none overflow-hidden"
              style={{ maxWidth: "780px" }}
              dangerouslySetInnerHTML={{ __html: data.manualCvHtml }}
            />
          ) : (
            <div
              id="cv-preview"
              ref={previewRef}
              className="bg-white border border-slate-200 shadow-sm mx-auto overflow-hidden"
              style={{ maxWidth: "780px" }}
            >
              <SelectedCvTemplate data={data} />
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
              className="bg-white border border-slate-200 shadow-sm mx-auto p-10 text-black text-sm leading-relaxed"
              style={{ ...previewFont, maxWidth: "780px" }}
            >
              {hasLetterContent ? (
                <div className="space-y-4">
                  <p className="text-right">
                    {data.letterCity || "[Kota]"}, {formatLongDateID()}
                  </p>

                  <div>
                    <p>Perihal: Lamaran Pekerjaan sebagai {data.targetPosition}</p>
                    <p>Lampiran: 1 (satu) berkas</p>
                  </div>

                  <div>
                    <p>Kepada Yth.</p>
                    <p>Bapak/Ibu HRD {data.targetCompany}</p>
                    <p>di Tempat</p>
                  </div>

                  <p>Dengan hormat,</p>

                  <p>{data.letterOpening}</p>

                  <div>
                    <p className="mb-1">Berikut data diri saya:</p>
                    <div className="grid grid-cols-[160px_10px_1fr] gap-y-0.5">
                      {dataDiriRows.map((row) => (
                        <div className="contents" key={row.label}>
                          <span>{row.label}</span>
                          <span>:</span>
                          <span>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p>{data.letterBody}</p>

                  <p>{data.letterClosing}</p>

                  <div className="pt-6">
                    <p>Hormat saya,</p>
                    <p className="pt-12">{data.fullName}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-slate-400">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p>
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