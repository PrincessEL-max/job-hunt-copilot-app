import { Pencil, Trash2, ExternalLink, Briefcase, Loader2 } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { FOCUS_RING } from "../lib/constants";
import { scoreColor } from "../lib/utils";

export default function ApplicationList({ applications, loading, onEdit, onDelete }) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-400 text-sm py-8 justify-center">
        <Loader2 className="w-4 h-4 animate-spin" /> Memuat data...
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <Briefcase className="w-8 h-8 mx-auto mb-2 text-slate-300" />
        <p className="text-sm">Belum ada lamaran yang dilacak.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {applications.map((app) => (
        <li key={app.id} className="p-4 border border-slate-200 rounded-lg bg-white">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 truncate">{app.role}</p>
              <p className="text-sm text-slate-500 truncate">{app.company}</p>
            </div>
            <StatusBadge status={app.status} />
          </div>

          <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
            <span>{app.date}</span>
            {app.matchScore != null && (
              <span className={`font-medium ${scoreColor(app.matchScore)}`}>
                Match {app.matchScore}%
              </span>
            )}
            {app.link && (
              <a
                href={app.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-teal-700 hover:underline"
              >
                Link <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {app.notes && <p className="mt-2 text-sm text-slate-600">{app.notes}</p>}

          <div className="flex gap-3 mt-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => onEdit(app)}
              className={`flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 rounded ${FOCUS_RING}`}
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
            <button
              onClick={() => onDelete(app.id)}
              className={`flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-rose-600 rounded ${FOCUS_RING}`}
            >
              <Trash2 className="w-3.5 h-3.5" /> Hapus
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
