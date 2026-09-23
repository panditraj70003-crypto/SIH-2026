import React, { useEffect, useRef, useState } from "react";
import { HomeIcon, CameraIcon, WarnIcon, UserIcon } from "./icons.jsx";

const items = [
  { id: "home", label: "Home", Icon: HomeIcon },
  { id: "post", label: "Post", Icon: CameraIcon },
  { id: "alerts", label: "Alerts", Icon: WarnIcon },
  { id: "profile", label: "Profile", Icon: UserIcon },
];

export default function TopTabs({ page, setPage }) {
  const trackRef = useRef(null);
  const btnRefs = useRef({});
  const [pill, setPill] = useState({ left: 0, width: 0 });

  function measure() {
    const track = trackRef.current;
    const btn = btnRefs.current[page];
    if (!track || !btn) return;
    const t = track.getBoundingClientRect();
    const b = btn.getBoundingClientRect();
    setPill({ left: b.left - t.left, width: b.width });
  }

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div className="border-b border-line bg-bg/95 backdrop-blur">
      <div ref={trackRef} className="relative mx-auto flex max-w-5xl gap-1 px-3 sm:px-6">
        {/* the sliding pill, positioned under whichever tab is active */}
        <span
          aria-hidden
          className="absolute bottom-0 top-1.5 rounded-xl bg-accent/12 transition-[left,width] duration-300 ease-out"
          style={{ left: pill.left, width: pill.width }}
        />
        {items.map(({ id, label, Icon }) => {
          const active = page === id;
          return (
            <button
              key={id}
              ref={(el) => (btnRefs.current[id] = el)}
              onClick={() => setPage(id)}
              className="relative z-10 flex flex-1 items-center justify-center gap-1.5 py-3 text-sm font-medium sm:flex-none sm:px-5"
            >
              <Icon size={16} className={active ? "text-accent" : "text-muted"} />
              <span className={active ? "text-accent" : "text-muted"}>{label}</span>
            </button>
          );
        })}
        {/* the sliding underline itself */}
        <span
          aria-hidden
          className="absolute bottom-0 h-[2.5px] rounded-full bg-accent transition-[left,width] duration-300 ease-out"
          style={{ left: pill.left, width: pill.width }}
        />
      </div>
    </div>
  );
}
