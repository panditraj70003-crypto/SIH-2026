import React from "react";
import ThemeToggle from "./ThemeToggle.jsx";
import { BellIcon, WifiOffIcon } from "./icons.jsx";
import { useNotify } from "../context/NotifyContext.jsx";
import { useOnlineStatus } from "../lib/useOnlineStatus.js";

const titles = {
  home: ["NER-SAFE", "Landslide, flood & rain risk — North Eastern Region"],
  post: ["Report an incident", "Photos, video or a written note — send what you can"],
  alerts: ["Risk alerts & analytics", "Live warnings and how risk has moved this week"],
  profile: ["Profile & settings", "Your details and notification preferences"],
};

export default function TopBar({ page, onOpenAlerts }) {
  const [title, subtitle] = titles[page] || titles.home;
  const { alerts } = useNotify();
  const online = useOnlineStatus();
  const activeCount = alerts.filter((a) => a.status === "active").length;

  return (
    <header className="border-b border-line bg-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 sm:px-6">
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-lg font-semibold leading-tight sm:text-xl">{title}</h1>
          <p className="truncate text-[11px] text-muted sm:text-xs">{subtitle}</p>
        </div>

        {!online && (
          <span className="hidden items-center gap-1.5 rounded-full border border-moderate/40 bg-moderate/10 px-2.5 py-1 text-[11px] font-medium text-moderate sm:flex">
            <WifiOffIcon size={13} />
            Offline
          </span>
        )}

        <button
          onClick={onOpenAlerts}
          aria-label={`${activeCount} active warnings`}
          className="relative rounded-full border border-line bg-surface p-2 text-ink hover:bg-surface2"
        >
          <BellIcon size={18} />
          {activeCount > 0 && (
            <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-critical text-[9px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </button>

        {page === "home" && <ThemeToggle />}
      </div>

      {!online && (
        <div className="flex items-center gap-1.5 border-t border-line bg-moderate/10 px-4 py-1.5 text-[11px] font-medium text-moderate sm:hidden">
          <WifiOffIcon size={12} />
          You're offline — reports will be saved and sent later.
        </div>
      )}
    </header>
  );
}
