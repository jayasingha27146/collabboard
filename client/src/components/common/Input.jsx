export default function Input({
  label,
  error,
  className = "",
  containerClassName = "",
  ...props
}) {
  return (
    <label className={`block ${containerClassName}`}>
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </span>
      )}
      <input
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-2 ${
          error
            ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
            : "border-slate-200 focus:border-primary-300 focus:ring-primary-100"
        } ${className}`}
        {...props}
      />
      {error && (
        <span className="mt-1.5 block text-xs text-rose-600">{error}</span>
      )}
    </label>
  );
}
