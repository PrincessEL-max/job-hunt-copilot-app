"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import ApplicationForm from "./ApplicationForm";
import KanbanBoard from "./KanbanBoard";
import { STATUS_OPTIONS, STATUS_STYLES, FOCUS_RING } from "../lib/constants";
import { uid } from "../lib/utils";

export default function Tracker({ applications, persistApplications, loading }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const stats = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = applications.filter((a) => a.status === s).length;
    return acc;
  }, {});

  function handleSubmit(formData) {
    if (editingId) {
      persistApplications(
        applications.map((a) => (a.id === editingId ? { ...a, ...formData } : a))
      );
    } else {
      persistApplications([
        { id: uid(), ...formData, matchScore: null, coverLetter: null },
        ...applications,
      ]);
    }
    setShowForm(false);
    setEditingId(null);
  }

  function handleEdit(app) {
    setEditingId(app.id);
    setShowForm(true);
  }

  function handleDelete(id) {
    persistApplications(applications.filter((a) => a.id !== id));
  }

  const editingApp = editingId ? applications.find((a) => a.id === editingId) : null;

  return (
    <div>
      {!loading && applications.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {STATUS_OPTIONS.map((s) => (
            <span
              key={s}
              className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_STYLES[s]}`}
            >
              {s}: {stats[s]}
            </span>
          ))}
        </div>
      )}

      {!showForm && (
        <button
          onClick={() => {
            setEditingId(null);
            setShowForm(true);
          }}
          className={`flex items-center gap-1.5 mb-5 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors ${FOCUS_RING}`}
        >
          <Plus className="w-4 h-4" /> Tambah Lamaran
        </button>
      )}

      {showForm && (
        <ApplicationForm
          key={editingApp?.id ?? "new"}
          initialData={editingApp}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingId(null);
          }}
        />
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-slate-400 text-sm py-8 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /> Memuat data...
        </div>
      ) : (
        <KanbanBoard
          applications={applications}
          persistApplications={persistApplications}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
