export function ImagePlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="h-24 w-24 text-slate-300"
        aria-hidden="true"
      >
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="8.5" cy="9.5" r="1.5" />
        <path d="m21 16-5-5-9 9" />
      </svg>
    </div>
  );
}
