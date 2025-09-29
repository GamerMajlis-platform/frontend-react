// Lightweight local icon components used across the app.
// Replacing lucide-react imports with small local SVG components reduces Vite
// module transform work (avoid pulling the whole icon package).

type IconProps = React.SVGProps<SVGSVGElement> & { size?: number | string };

const baseProps = (
  size?: number | string,
  props?: React.SVGProps<SVGSVGElement>
): React.SVGProps<SVGSVGElement> =>
  ({
    width: size ?? 16,
    height: size ?? 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  } as React.SVGProps<SVGSVGElement>);

export const ChevronDown = ({ size, ...props }: IconProps) => (
  <svg {...baseProps(size, props)}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const Plus = ({ size, ...props }: IconProps) => (
  <svg {...baseProps(size, props)}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const Search = ({ size, ...props }: IconProps) => (
  <svg {...baseProps(size, props)}>
    <circle cx="11" cy="11" r="6" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export const MessageSquare = ({ size, ...props }: IconProps) => (
  <svg {...baseProps(size, props)}>
    <rect x="3" y="3" width="18" height="14" rx="2" />
    <path d="M21 17v2a1 1 0 0 1-1 1H7l-4 3V6a1 1 0 0 1 1-1h14" />
  </svg>
);

export const Image = ({ size, ...props }: IconProps) => (
  <svg {...baseProps(size, props)}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M21 15l-5-5-8 8" />
    <circle cx="8.5" cy="8.5" r="1.5" />
  </svg>
);

export const Eye = ({ size, ...props }: IconProps) => (
  <svg {...baseProps(size, props)}>
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const EyeOff = ({ size, ...props }: IconProps) => (
  <svg {...baseProps(size, props)}>
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.47 21.47 0 0 1 5.06-5.94" />
    <path d="M1 1l22 22" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const GamepadIcon = ({ size, ...props }: IconProps) => (
  <svg {...baseProps(size, props)}>
    <rect x="2" y="7" width="20" height="10" rx="3" />
    <circle cx="8" cy="12" r="1" />
    <circle cx="16" cy="12" r="1" />
  </svg>
);

export const Youtube = ({ size, ...props }: IconProps) => (
  <svg {...baseProps(size, props)}>
    <rect x="3" y="6" width="18" height="12" rx="3" />
    <polygon points="10 9 16 12 10 15 10 9" />
  </svg>
);

export const Twitter = ({ size, ...props }: IconProps) => (
  <svg {...baseProps(size, props)}>
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 22.43 1s-2 .9-3.72 1.09A4.48 4.48 0 0 0 12 5.5v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
  </svg>
);

export const Instagram = ({ size, ...props }: IconProps) => (
  <svg {...baseProps(size, props)}>
    <rect x="3" y="3" width="18" height="18" rx="4" />
    <circle cx="12" cy="12" r="3.2" />
    <circle cx="17.5" cy="6.5" r="1" />
  </svg>
);

export const Twitch = ({ size, ...props }: IconProps) => (
  <svg {...baseProps(size, props)}>
    <rect x="3" y="3" width="14" height="12" rx="2" />
    <path d="M7 21v-4" />
    <path d="M17 21v-4" />
  </svg>
);

export const Send = ({ size, ...props }: IconProps) => (
  <svg {...baseProps(size, props)}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

// Flatter / more directed send icon variant (points more horizontally)
export const SendAlt = ({ size, ...props }: IconProps) => (
  <svg {...baseProps(size, props)}>
    {/* Directed paper-plane pointing right (tip at right) */}
    <path d="M2 3 L22 12 L2 21 L8 13 L2 3 Z" />
  </svg>
);

export const ArrowLeft = ({ size, ...props }: IconProps) => (
  <svg {...baseProps(size, props)}>
    {/* horizontal shaft */}
    <line x1="19" y1="12" x2="6" y2="12" />
    {/* arrow head pointing left */}
    <polyline points="12 6 6 12 12 18" />
  </svg>
);

export default ChevronDown;
