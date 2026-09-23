import React from "react";

// A small, self-contained icon set. Kept as plain inline SVG (not an icon
// package) so the whole app ships without an extra dependency.
const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };

function Svg({ children, size = 20, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} {...rest}>
      {children}
    </svg>
  );
}

export const HomeIcon = (p) => (
  <Svg {...p}>
    <path d="M4 11.5 12 4l8 7.5" />
    <path d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9" />
  </Svg>
);

export const MapIcon = (p) => (
  <Svg {...p}>
    <path d="M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2Z" />
    <path d="M9 4v14M15 6v14" />
  </Svg>
);

export const CameraIcon = (p) => (
  <Svg {...p}>
    <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
    <circle cx="12" cy="13.5" r="3.4" />
  </Svg>
);

export const BellIcon = (p) => (
  <Svg {...p}>
    <path d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10Z" />
    <path d="M9.5 18.5a2.5 2.5 0 0 0 5 0" />
  </Svg>
);

export const UserIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="3.4" />
    <path d="M5 20c1-3.5 4-5.3 7-5.3S18 16.5 19 20" />
  </Svg>
);

export const SunIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
  </Svg>
);

export const MoonIcon = (p) => (
  <Svg {...p}>
    <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4 6.8 6.8 0 0 0 20 14.5Z" />
  </Svg>
);

export const PhoneIcon = (p) => (
  <Svg {...p}>
    <path d="M6 4h3l1.4 4-2 1.4a12 12 0 0 0 5.2 5.2l1.4-2 4 1.4v3a1.5 1.5 0 0 1-1.6 1.5A15.5 15.5 0 0 1 4.5 5.6 1.5 1.5 0 0 1 6 4Z" />
  </Svg>
);

export const PinIcon = (p) => (
  <Svg {...p}>
    <path d="M12 21s7-6.3 7-11.6A7 7 0 0 0 5 9.4C5 14.7 12 21 12 21Z" />
    <circle cx="12" cy="9.4" r="2.4" />
  </Svg>
);

export const FilterIcon = (p) => (
  <Svg {...p}>
    <path d="M4 5h16l-6 7.5V19l-4 2v-8.5Z" />
  </Svg>
);

export const CheckIcon = (p) => (
  <Svg {...p}>
    <path d="m5 12 5 5 9-10" />
  </Svg>
);

export const WifiOffIcon = (p) => (
  <Svg {...p}>
    <path d="M3 3l18 18" />
    <path d="M5 8a15 15 0 0 1 4-2.3M9.5 12a9 9 0 0 1 3-1.4M19 8a15 15 0 0 0-3.2-2M12.5 16a3 3 0 0 1 3 0" />
    <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
  </Svg>
);

export const ChevronRightIcon = (p) => (
  <Svg {...p}>
    <path d="m9 5 7 7-7 7" />
  </Svg>
);

export const ChevronLeftIcon = (p) => (
  <Svg {...p}>
    <path d="m15 5-7 7 7 7" />
  </Svg>
);

export const CloseIcon = (p) => (
  <Svg {...p}>
    <path d="m6 6 12 12M18 6 6 18" />
  </Svg>
);

export const ImageIcon = (p) => (
  <Svg {...p}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
    <circle cx="9" cy="10" r="1.6" />
    <path d="m5 18 5-5 3.5 3.5L18 12l1.5 1.5" />
  </Svg>
);

export const VideoIcon = (p) => (
  <Svg {...p}>
    <rect x="3.5" y="6" width="12" height="12" rx="2" />
    <path d="M15.5 10.5 20.5 8v8l-5-2.5" />
  </Svg>
);

export const TextIcon = (p) => (
  <Svg {...p}>
    <path d="M5 6h14M5 12h14M5 18h9" />
  </Svg>
);

export const SearchIcon = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.3-4.3" />
  </Svg>
);

export const LogOutIcon = (p) => (
  <Svg {...p}>
    <path d="M14 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4" />
    <path d="M10 8l-4 4 4 4M4 12h12" />
  </Svg>
);

export const WarnIcon = (p) => (
  <Svg {...p}>
    <path d="M12 3.5 21.5 20h-19Z" />
    <path d="M12 10v4.2M12 17v.01" />
  </Svg>
);

export const DropletIcon = (p) => (
  <Svg {...p}>
    <path d="M12 3s6 6.5 6 11a6 6 0 1 1-12 0c0-4.5 6-11 6-11Z" />
  </Svg>
);

export const LayersIcon = (p) => (
  <Svg {...p}>
    <path d="m12 3 9 5-9 5-9-5 9-5Z" />
    <path d="m3 13 9 5 9-5" />
  </Svg>
);
