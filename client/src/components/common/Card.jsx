export default function Card({ className = "", children }) {
  return (
    <section className={`glass-card p-5 ${className}`}>{children}</section>
  );
}
