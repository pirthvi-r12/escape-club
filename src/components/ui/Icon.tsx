/**
 * Hand-rolled 20px icon set. Six glyphs is not worth an icon dependency, and
 * inlining them keeps the dashboard's first load free of another chunk.
 */

type IconProps = { className?: string };

const base = (className?: string) =>
  ["h-[1.15em] w-[1.15em] shrink-0", className].filter(Boolean).join(" ");

const Svg = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={base(className)}
  >
    {children}
  </svg>
);

export const IconOverview = ({ className }: IconProps) => (
  <Svg className={className}>
    <path d="M4 13h6V4H4v9Zm0 7h6v-4H4v4Zm10 0h6v-9h-6v9Zm0-16v4h6V4h-6Z" />
  </Svg>
);

export const IconGlobe = ({ className }: IconProps) => (
  <Svg className={className}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17M12 3.5c2.3 2.4 3.4 5.3 3.4 8.5S14.3 18.1 12 20.5c-2.3-2.4-3.4-5.3-3.4-8.5S9.7 5.9 12 3.5Z" />
  </Svg>
);

export const IconRoute = ({ className }: IconProps) => (
  <Svg className={className}>
    <circle cx="6" cy="6" r="2.4" />
    <circle cx="18" cy="18" r="2.4" />
    <path d="M8.4 6h5.1a3 3 0 0 1 0 6h-3a3 3 0 0 0 0 6h5.1" />
  </Svg>
);

export const IconTrips = ({ className }: IconProps) => (
  <Svg className={className}>
    <path d="M4 7.5h16v12H4zM8.5 7.5v-2a1.5 1.5 0 0 1 1.5-1.5h4a1.5 1.5 0 0 1 1.5 1.5v2M4 12.5h16" />
  </Svg>
);

export const IconSignOut = ({ className }: IconProps) => (
  <Svg className={className}>
    <path d="M14.5 4.5H6.5a1.5 1.5 0 0 0-1.5 1.5v12a1.5 1.5 0 0 0 1.5 1.5h8M15 8.5 18.5 12 15 15.5M18.5 12h-8" />
  </Svg>
);

export const IconSpark = ({ className }: IconProps) => (
  <Svg className={className}>
    <path d="M12 3.5 13.7 9l5.5 1.7L13.7 12.4 12 18l-1.7-5.6L4.8 10.7 10.3 9 12 3.5ZM18.5 16.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z" />
  </Svg>
);

export const IconArrowUp = ({ className }: IconProps) => (
  <Svg className={className}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </Svg>
);
