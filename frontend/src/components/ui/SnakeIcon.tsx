export function SnakeIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      {/* Body S-curve */}
      <path
        d="M15 2C17.5 2 19.5 4 19.5 6.5C19.5 9.5 17 11 14.5 12C12 13 9.5 14 9.5 17C9.5 19.5 11.5 21.5 14 22"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        fill="none"
      />
      {/* Head */}
      <ellipse
        cx="13.5"
        cy="3.2"
        rx="2.8"
        ry="1.9"
        transform="rotate(-30 13.5 3.2)"
        fill="currentColor"
      />
      {/* Eye */}
      <circle cx="14.6" cy="2.4" r="0.55" fill="black" opacity="0.75" />
      {/* Forked tongue */}
      <path
        d="M11.2 4.2L9.5 2.8M11.2 4.2L9.8 5.6"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      {/* Tail tip */}
      <circle cx="14" cy="22" r="0.9" fill="currentColor" />
    </svg>
  );
}
