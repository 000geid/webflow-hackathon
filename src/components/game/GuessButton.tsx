"use client";

interface GuessButtonProps {
  onClick?: () => void;
}

export function GuessButton({ onClick }: GuessButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-6 w-full cursor-pointer rounded-2xl bg-brand py-5 text-2xl font-extrabold tracking-wider text-white uppercase shadow-lg shadow-blue-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-hover hover:shadow-xl hover:shadow-blue-500/30 focus-visible:ring-4 focus-visible:ring-blue-500/40 focus-visible:outline-hidden active:translate-y-0 active:scale-[0.98]"
    >
      Adivinar
    </button>
  );
}
