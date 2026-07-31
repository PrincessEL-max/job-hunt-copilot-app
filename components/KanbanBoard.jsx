"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Pencil, Trash2 } from "lucide-react";
import { STATUS_OPTIONS, FOCUS_RING } from "../lib/constants";
import { scoreColor } from "../lib/utils";

const COLUMN_HEADER_STYLES = {
  Melamar: "bg-slate-100 text-slate-700",
  Interview: "bg-amber-50 text-amber-700",
  Offer: "bg-emerald-50 text-emerald-700",
  Ditolak: "bg-rose-50 text-rose-700",
};

function CardContent({ app }) {
  return (
    <>
      <p className="font-semibold text-slate-900 text-sm truncate">{app.role}</p>
      <p className="text-xs text-slate-500 truncate">{app.company}</p>
      <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
        <span>{app.date}</span>
        {app.matchScore != null && (
          <span className={`font-medium ${scoreColor(app.matchScore)}`}>{app.matchScore}%</span>
        )}
      </div>
    </>
  );
}

function KanbanCard({ app, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: app.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.35 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="p-3 border border-slate-200 rounded-lg bg-white shadow-sm touch-none cursor-grab active:cursor-grabbing"
    >
      <CardContent app={app} />
      <div className="flex gap-3 mt-2 pt-2 border-t border-slate-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(app);
          }}
          className={`flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 rounded ${FOCUS_RING}`}
        >
          <Pencil className="w-3 h-3" /> Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(app.id);
          }}
          className={`flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600 rounded ${FOCUS_RING}`}
        >
          <Trash2 className="w-3 h-3" /> Hapus
        </button>
      </div>
    </div>
  );
}

function KanbanColumn({ status, applications, onEdit, onDelete }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex-1 min-w-[260px] flex flex-col">
      <div className={`px-3 py-2 rounded-t-lg font-medium text-sm ${COLUMN_HEADER_STYLES[status]}`}>
        {status} <span className="opacity-60">({applications.length})</span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 p-2 space-y-2 rounded-b-lg border border-t-0 border-slate-200 min-h-[140px] transition-colors ${
          isOver ? "bg-teal-50" : "bg-slate-50"
        }`}
      >
        {applications.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-6">Kosong</p>
        )}
        {applications.map((app) => (
          <KanbanCard key={app.id} app={app} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}

export default function KanbanBoard({ applications, persistApplications, onEdit, onDelete }) {
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const activeApp = activeId ? applications.find((a) => a.id === activeId) : null;

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const newStatus = over.id;
    const app = applications.find((a) => a.id === active.id);
    if (!app || app.status === newStatus) return;

    persistApplications(
      applications.map((a) => (a.id === active.id ? { ...a, status: newStatus } : a))
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {STATUS_OPTIONS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            applications={applications.filter((a) => a.status === status)}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      <DragOverlay>
        {activeApp ? (
          <div className="p-3 border border-teal-300 rounded-lg bg-white shadow-lg w-64 rotate-2">
            <CardContent app={activeApp} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}