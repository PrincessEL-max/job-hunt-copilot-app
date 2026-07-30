"use client";

import { useState, useEffect } from "react";
import { Briefcase } from "lucide-react";
import Tracker from "./Tracker";
import Analyzer from "./Analyzer";
import { FOCUS_RING } from "../lib/constants";
import { loadLocal, saveLocal, APPLICATIONS_KEY } from "../lib/storage";

export default function JobHuntCopilot() {
  const [tab, setTab] = useState("tracker");
  const [loadingData, setLoadingData] = useState(true);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    // localStorage doesn't exist during SSR, so hydrating from it has to
    // happen client-side in an effect rather than during render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setApplications(loadLocal(APPLICATIONS_KEY, []));
    setLoadingData(false);
  }, []);

  function persistApplications(list) {
    setApplications(list);
    saveLocal(APPLICATIONS_KEY, list);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <header className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Briefcase className="w-5 h-5 text-teal-700" />
            <h1 className="text-2xl font-bold text-slate-900">Job Hunt Copilot</h1>
          </div>
          <p className="text-sm text-slate-500">
            Lacak lamaran kerja kamu, dan cek kecocokan CV sebelum apply.
          </p>
        </header>

        <div className="flex gap-1 mb-6 border-b border-slate-200">
          <button
            onClick={() => setTab("tracker")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors rounded-t-sm ${FOCUS_RING} ${
              tab === "tracker"
                ? "border-teal-700 text-teal-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Lacak Lamaran
          </button>
          <button
            onClick={() => setTab("analyze")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors rounded-t-sm ${FOCUS_RING} ${
              tab === "analyze"
                ? "border-teal-700 text-teal-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Analisis &amp; Cover Letter
          </button>
        </div>

        {tab === "tracker" && (
          <Tracker
            applications={applications}
            persistApplications={persistApplications}
            loading={loadingData}
          />
        )}
        {tab === "analyze" && (
          <Analyzer
            applications={applications}
            persistApplications={persistApplications}
            onViewTracker={() => setTab("tracker")}
          />
        )}
      </div>
    </div>
  );
}
