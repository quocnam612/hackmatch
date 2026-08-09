export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="hm-logo-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6366f1" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#hm-logo-grad)" />
      <g stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity="0.9">
        <path d="M10.5 10.5L21.5 10.5" />
        <path d="M10.5 10.5L16 21.5" />
        <path d="M21.5 10.5L16 21.5" />
      </g>
      <circle cx="10.5" cy="10.5" r="2.6" fill="#fff" />
      <circle cx="21.5" cy="10.5" r="2.6" fill="#fff" />
      <circle cx="16" cy="21.5" r="2.6" fill="#fff" />
    </svg>
  );
}
