import { AlertTriangle } from "lucide-react";
import Button from "./Button.jsx";

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="glass-card flex flex-col items-center px-5 py-10 text-center">
      <AlertTriangle className="mb-3 text-rose-500" size={28} />
      <p className="text-sm font-semibold text-slate-700">
        Something went wrong
      </p>
      <p className="mt-1 text-sm text-slate-500">{message}</p>
      {onRetry && (
        <Button className="mt-4" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
