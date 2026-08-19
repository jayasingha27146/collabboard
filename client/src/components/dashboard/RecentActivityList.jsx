import Card from "../common/Card.jsx";

export default function RecentActivityList({ items }) {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li
            key={item._id || item.id}
            className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5"
          >
            <p className="text-sm text-slate-700">{item.message}</p>
            <p className="mt-1 text-xs text-slate-500">
              {item.createdAt ? new Date(item.createdAt).toLocaleString() : item.time}
            </p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
