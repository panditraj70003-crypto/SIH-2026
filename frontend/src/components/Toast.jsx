import React from "react";
import { useNotify } from "../context/NotifyContext.jsx";
import { RiskDot } from "./ui.jsx";
import { CloseIcon } from "./icons.jsx";

export default function Toast({ onView }) {
  const { toast, dismissToast } = useNotify();
  if (!toast) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-3">
      <div
        role="status"
        className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-line bg-surface p-3.5 shadow-card"
      >
        <RiskDot level={toast.level} className="mt-1.5 h-2.5 w-2.5 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{toast.title}</p>
          <p className="mt-0.5 line-clamp-2 text-xs text-muted">{toast.message}</p>
          <button
            onClick={() => {
              onView && onView();
              dismissToast();
            }}
            className="mt-1.5 text-xs font-semibold text-accent"
          >
            View details →
          </button>
        </div>
        <button onClick={dismissToast} aria-label="Dismiss" className="shrink-0 rounded-full p-1 text-muted hover:bg-surface2">
          <CloseIcon size={14} />
        </button>
      </div>
    </div>
  );
}
