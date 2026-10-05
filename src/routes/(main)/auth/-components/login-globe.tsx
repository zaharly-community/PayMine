export function LoginGlobe() {
  return (
    <div className="relative h-[min(76vh,680px)] w-full max-w-[760px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.16),transparent_58%)]" />
      <svg
        viewBox="0 0 720 720"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <radialGradient id="globe-fill" cx="35%" cy="30%">
            <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.92" />
            <stop offset="62%" stopColor="#0f172a" stopOpacity="0.96" />
            <stop offset="100%" stopColor="#020617" stopOpacity="1" />
          </radialGradient>
          <linearGradient id="arc-stroke" x1="0%" x2="100%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
            <stop offset="35%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#818cf8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="globe-clip">
            <circle cx="360" cy="360" r="224" />
          </clipPath>
        </defs>

        <g opacity="0.28" fill="none" stroke="#64748b">
          <circle cx="360" cy="360" r="224" strokeWidth="1.5" />
          <ellipse cx="360" cy="360" rx="224" ry="86" />
          <ellipse cx="360" cy="360" rx="224" ry="154" />
          <ellipse cx="360" cy="360" rx="86" ry="224" />
          <ellipse cx="360" cy="360" rx="154" ry="224" />
        </g>

        <circle cx="360" cy="360" r="224" fill="url(#globe-fill)" />

        <g clipPath="url(#globe-clip)" opacity="0.35" fill="none" stroke="#94a3b8">
          <path d="M126 310H594" />
          <path d="M126 360H594" />
          <path d="M126 410H594" />
          <path d="M200 170C300 250 420 250 520 170" />
          <path d="M200 550C300 470 420 470 520 550" />
        </g>

        <g fill="#e0f2fe" filter="url(#glow)">
          <circle cx="274" cy="276" r="3" />
          <circle cx="423" cy="298" r="3" />
          <circle cx="464" cy="404" r="3" />
          <circle cx="317" cy="452" r="3" />
          <circle cx="515" cy="349" r="2.5" />
          <circle cx="244" cy="389" r="2.5" />
        </g>

        <g
          fill="none"
          stroke="url(#arc-stroke)"
          strokeLinecap="round"
          filter="url(#glow)"
          className="[animation:spin_28s_linear_infinite]"
          style={{ transformOrigin: "360px 360px" }}
        >
          <path d="M142 316C264 146 482 158 590 322" strokeWidth="4" />
          <path d="M190 492C310 290 488 292 556 438" strokeWidth="3" />
          <path d="M228 218C294 348 470 418 572 300" strokeWidth="3" />
        </g>

        <g fill="none" stroke="#38bdf8" opacity="0.75">
          <circle cx="274" cy="276" r="11" strokeWidth="1" />
          <circle cx="423" cy="298" r="11" strokeWidth="1" />
          <circle cx="464" cy="404" r="11" strokeWidth="1" />
        </g>
      </svg>
    </div>
  );
}
