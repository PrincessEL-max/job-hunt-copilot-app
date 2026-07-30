"use client";

import { useState } from "react";
import { STATUS_OPTIONS, FOCUS_RING } from "../lib/constants";
import { todayISO } from "../lib/utils";

const EMPTY_FORM = {
  company: "",
  role: "",
  status: "Melamar",
  date: todayISO(),
  link: "",
  notes: "",
};

// Note: this component relies on the parent passing a `key` that changes
// whenever `initialData` changes (see Tracker.jsx). That makes React remount
// it fresh instead of needing an effect to re-sync internal state from props.
export default function ApplicationForm({ initialData, onSubmit, onCancel }) {
  const [form, setForm] = useState(initialData || EMPTY_FORM);

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.company.trim() || !form.role.trim()) return;
    onSubmit(form);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 p-4 border border-slate-200 rounded-lg bg-white space-y-3"
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Perusahaan</label>
          <input
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Posisi</label>
          <input
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Tanggal</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Link (opsional)</label>
        <input
          value={form.link}
          onChange={(e) => setForm({ ...form, link: e.target.value })}
          placeholder="https://..."
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Catatan (opsional)</label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={2}
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          className={`px-4 py-2 bg-teal-700 text-white text-sm font-medium rounded-md hover:bg-teal-800 ${FOCUS_RING}`}
        >
          {initialData ? "Simpan Perubahan" : "Tambah"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className={`px-4 py-2 text-slate-600 text-sm font-medium hover:text-slate-900 rounded-md ${FOCUS_RING}`}
        >
          Batal
        </button>
      </div>
    </form>
  );
}
