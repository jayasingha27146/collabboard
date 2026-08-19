import { Link } from "react-router-dom";
import { useState } from "react";
import Card from "../common/Card.jsx";
import Button from "../common/Button.jsx";
import * as groupService from "../../services/groupService.js";

export default function GroupCard({ group }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const addMember = async () => {
    if (!email.trim()) return;
    try {
      await groupService.addMember(group._id || group.id, email);
      setEmail("");
      setMessage("Member added. They can now be assigned to tasks after refresh.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <Card className="flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{group.name}</h3>

        <p className="mt-2 text-sm text-slate-600">{group.description}</p>

        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-slate-500">Members</dt>
            <dd className="font-semibold text-slate-800">
              {group.memberCount ?? group.members?.length ?? 0}
            </dd>
          </div>

          <div>
            <dt className="text-slate-500">Active Tasks</dt>
            <dd className="font-semibold text-slate-800">
              {group.activeTasks ?? 0}
            </dd>
          </div>

          <div className="col-span-2">
            <dt className="text-slate-500">Owner</dt>
            <dd className="font-semibold text-slate-800">
              {group.owner?.name || "Unknown"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3">
        <label className="text-xs font-medium text-slate-600">Add registered member by email</label>
        <div className="mt-2 flex gap-2">
          <input
            className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2 py-2 text-xs"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="member@email.com"
          />
          <Button className="px-3 py-2 text-xs" onClick={addMember}>Add</Button>
        </div>
        {message && <p className="mt-2 text-xs text-slate-500">{message}</p>}
      </div>

      <Link className="mt-5" to={`/groups/${group._id || group.id}`}>
        <Button className="w-full">View Group</Button>
      </Link>
    </Card>
  );
}
