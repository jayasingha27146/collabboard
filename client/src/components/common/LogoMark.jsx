export default function LogoMark({ className = "h-10 w-10" }) {
  return (
    <span className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 via-primary-600 to-violet-700 shadow-lg shadow-indigo-950/25 ${className}`} aria-hidden="true">
      <svg viewBox="0 0 32 32" className="h-[62%] w-[62%]" fill="none">
        <rect x="4" y="5" width="10" height="9" rx="2.5" fill="white" />
        <rect x="18" y="5" width="10" height="15" rx="2.5" fill="white" fillOpacity=".72" />
        <rect x="4" y="18" width="10" height="9" rx="2.5" fill="white" fillOpacity=".72" />
        <path d="m19.5 25 2 2 5-5" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
