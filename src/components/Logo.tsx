export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {/* Marca PSN — cruz da saúde sobre os tons da bandeira de Angola */}
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="8" fill="#CC092F" />
        <path d="M14 7h4v7h7v4h-7v7h-4v-7H7v-4h7V7Z" fill="#fff" />
        <circle cx="16" cy="16" r="2.2" fill="#FFCB00" />
      </svg>
      <span className="text-lg font-extrabold tracking-tight">
        <span className="text-angola-red">PSN</span>
      </span>
    </span>
  );
}
