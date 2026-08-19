export default function Avatar({ initials, className = "" }) {
  return (
    <span
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-800 ${className}`}
    >
      {initials}
    </span>
  );
}
