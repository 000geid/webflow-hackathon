/** Íconos sólidos simples. Heredan el color con `currentColor`. */

export function ClockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path
        fillRule="evenodd"
        d="M12 2.25a9.75 9.75 0 1 0 0 19.5 9.75 9.75 0 0 0 0-19.5ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .2.08.39.22.53l3.75 3.75a.75.75 0 1 0 1.06-1.06l-3.53-3.53V6Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M11.05 2.93a1 1 0 0 1 1.9 0l2.01 5.02 5.4.4a1 1 0 0 1 .58 1.77l-4.12 3.5 1.28 5.26a1 1 0 0 1-1.5 1.1L12 17.13l-4.6 2.85a1 1 0 0 1-1.5-1.1l1.28-5.26-4.12-3.5a1 1 0 0 1 .58-1.77l5.4-.4 2.01-5.02Z" />
    </svg>
  );
}

export function PauseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}

export function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M7 4.87a1 1 0 0 1 1.5-.86l11.03 6.63a1.6 1.6 0 0 1 0 2.72L8.5 19.99A1 1 0 0 1 7 19.13V4.87Z" />
    </svg>
  );
}
