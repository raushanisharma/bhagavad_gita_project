import type { SVGProps } from "react";

const PATHS = {
  lotus: (
    <>
      <path d="M12 19.5c-2.6-2.4-3.2-6.4 0-11 3.2 4.6 2.6 8.6 0 11z" />
      <path d="M12 19.5c-3.6.2-7.3-1.8-8.5-5.8 3.2-.6 6.6.7 8.5 5.8z" />
      <path d="M12 19.5c3.6.2 7.3-1.8 8.5-5.8-3.2-.6-6.6.7-8.5 5.8z" />
      <path d="M7.2 9.8C6.8 8.4 6.8 7 7.2 5.6c1.4.6 2.5 1.6 3.2 2.9" />
      <path d="M16.8 9.8c.4-1.4.4-2.8 0-4.2-1.4.6-2.5 1.6-3.2 2.9" />
    </>
  ),
  diya: (
    <>
      <path d="M3.5 13.5h17c-1 3.8-4.4 6-8.5 6s-7.5-2.2-8.5-6z" />
      <path d="M12 10.5c-1.6 0-2.6-1-2.6-2.4 0-1.8 1.5-2.8 2.6-5.6 1.1 2.8 2.6 3.8 2.6 5.6 0 1.4-1 2.4-2.6 2.4z" />
    </>
  ),
  flame: (
    <path d="M12 21c-3.6 0-6.2-2.5-6.2-5.8 0-2.7 1.7-4.4 3.1-6 .3 1.6 1.2 2.6 2.1 2.9-.4-3.3 1-6.2 3.6-8.6-.2 2.8.9 4.5 2.2 6.2.9 1.3 1.4 2.7 1.4 4.2 0 4.1-2.6 7.1-6.2 7.1z" />
  ),
  chat: <path d="M20 14.5a2.5 2.5 0 0 1-2.5 2.5H9l-5 4V6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5z" />,
  book: (
    <>
      <path d="M2.5 5.5c3.2-1.2 6.4-.8 9.5 1.5 3.1-2.3 6.3-2.7 9.5-1.5v13.5c-3.2-1.2-6.4-.8-9.5 1.5-3.1-2.3-6.3-2.7-9.5-1.5z" />
      <path d="M12 7v13.5" />
    </>
  ),
  leaf: (
    <>
      <path d="M5 19.5C4.6 11 9.5 5.2 20 4.5 19.6 14.5 14 19.8 5 19.5z" />
      <path d="M5 19.5 13 11.5" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5z" />
    </>
  ),
  sparkle: (
    <>
      <path d="M11 3.5 12.8 9l5.2 1.8-5.2 1.8L11 18l-1.8-5.4L4 10.8 9.2 9z" />
      <path d="M18.5 3v4M16.5 5h4" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    </>
  ),
  arrowRight: <path d="M4.5 12h15M13.5 6l6 6-6 6" />,
  arrowLeft: <path d="M19.5 12h-15M10.5 6l-6 6 6 6" />,
  arrowUp: <path d="M12 19.5v-15M6 10.5l6-6 6 6" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2.5" />
      <path d="M5.5 15H5a1.5 1.5 0 0 1-1.5-1.5V5A1.5 1.5 0 0 1 5 3.5h8.5A1.5 1.5 0 0 1 15 5v.5" />
    </>
  ),
  menu: <path d="M4 7.5h16M4 12h16M4 16.5h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  feather: (
    <>
      <path d="M19.5 4.5c-6.5 0-12 4.8-12.5 12.5" />
      <path d="M19.5 4.5c.3 7.5-4.3 12.3-12 12.5" />
      <path d="M7 17l-3 3" />
    </>
  ),
  pen: (
    <>
      <path d="M4.5 19.5 5.5 15 16 4.5l3.5 3.5L9 18.5z" />
      <path d="m13.5 7 3.5 3.5" />
    </>
  ),
  trophy: (
    <>
      <path d="M8 4h8v5.5a4 4 0 0 1-8 0z" />
      <path d="M8 6H5.5A2.5 2.5 0 0 0 8 10.5M16 6h2.5A2.5 2.5 0 0 1 16 10.5" />
      <path d="M12 13.5V17M8.5 20h7M10 17h4" />
    </>
  ),
  moon: <path d="M19.5 14.5A8 8 0 1 1 9.5 4.5a6.5 6.5 0 0 0 10 10z" />,
  heart: <path d="M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.3a4.2 4.2 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z" />,
  refresh: (
    <>
      <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" />
      <path d="M19.5 4.5v4h-4" />
    </>
  ),
  send: <path d="M12 19V5M6 11l6-6 6 6" />,
  sun: (
    <>
      <path d="M3 18.5h18" />
      <path d="M7 18.5a5 5 0 0 1 10 0" />
      <path d="M12 9.5v-3M5.6 12.1 3.9 10.4M18.4 12.1l1.7-1.7" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5M12 7.8v.2" />
    </>
  ),
  play: <path d="M8 5.5v13l10.5-6.5z" />,
  pause: <path d="M8.5 5.5v13M15.5 5.5v13" />,
  loader: <path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5" />,
  volume: (
    <>
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
      <path d="M15.5 9a4.2 4.2 0 0 1 0 6M18.2 6.5a7.8 7.8 0 0 1 0 11" />
    </>
  ),
  share: (
    <>
      <path d="M12 15V4M7.5 8.5 12 4l4.5 4.5" />
      <path d="M5 12.5V18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5.5" />
    </>
  ),
} as const;

export type IconName = keyof typeof PATHS;

interface Props extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 20, strokeWidth = 1.6, ...rest }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}
