import { Search, UserPlus, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Button from "../components/common/Button.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import Input from "../components/common/Input.jsx";
import AppShell from "../components/layout/AppShell.jsx";
import GroupCard from "../components/groups/GroupCard.jsx";
import GroupFormModal from "../components/groups/GroupFormModal.jsx";
import * as groupService from "../services/groupService.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Groups() {
  const { user } = useAuth();
  const isGroupLeader = user?.role === "group_leader";
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [openCreateModal, setOpenCreateModal] = useState(false);

  useEffect(() => {
    async function fetchGroups() {
      try {
        setLoading(true);
        const response = await groupService.getGroups();
        setGroups(response?.data || response || []);
        setError(null);
      } catch (err) {
        setError(err.message);
        setGroups([]);
      } finally {
        setLoading(false);
      }
    }

    fetchGroups();
  }, []);

  const filteredGroups = useMemo(() => {
    return groups.filter((group) =>
      `${group.name} ${group.description} ${group.owner?.name || "Unknown"}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
    );
  }, [groups, searchTerm]);

  const handleCreateGroup = async (payload) => {
    try {
      const newGroup = await groupService.createGroup(payload);
      setGroups((current) => [newGroup.data || newGroup, ...current]);
      setOpenCreateModal(false);
    } catch (err) {
      alert(`Failed to create group: ${err.message}`);
    }
  };

  const handleJoinGroup = async () => {
    if (!joinCode.trim()) {
      return;
    }

    try {
      await groupService.joinGroup(joinCode.trim());
      const response = await groupService.getGroups();
      setGroups(response?.data || response || []);
      setJoinCode("");
      alert("Successfully joined group!");
    } catch (err) {
      alert(`Failed to join group: ${err.message}`);
    }
  };

  return (
    <AppShell>
      <section className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="page-title">My Groups</h1>
          <p className="page-subtitle">
            Create and manage your study collaboration circles.
          </p>
        </div>
        {isGroupLeader && <Button onClick={() => setOpenCreateModal(true)}>
          <UsersRound size={16} className="mr-2" /> Create Group
        </Button>}
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="glass-card p-4 lg:col-span-2">
          <label className="relative block">
            <Search
              className="absolute left-3 top-2.5 text-slate-400"
              size={16}
            />
            <input
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm"
              placeholder="Search groups by name, description, or owner"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>
        </div>

        <div className="glass-card p-4">
          <h2 className="text-sm font-semibold text-slate-800">Join a Group</h2>
          <div className="mt-2 flex gap-2">
            <Input
              containerClassName="w-full"
              value={joinCode}
              onChange={(event) => setJoinCode(event.target.value)}
              placeholder="Group ID"
            />
            <Button variant="secondary" onClick={handleJoinGroup}>
              <UserPlus size={16} />
            </Button>
          </div>
        </div>
      </section>

      {loading && (
        <div className="mt-6 text-center text-slate-600">Loading groups...</div>
      )}
      {error && (
        <div className="mt-6 text-center text-red-600">Error: {error}</div>
      )}

      {!loading && !error && filteredGroups.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No study groups yet."
            description="Create or join a group to start planning assignments together."
          />
        </div>
      ) : (
        !loading &&
        !error && (
          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredGroups.map((group) => (
              <GroupCard key={group._id || group.id} group={group} currentUserId={user?.id} />
            ))}
          </section>
        )
      )}

      {isGroupLeader && <GroupFormModal
        isOpen={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onSubmit={handleCreateGroup}
      />}
    </AppShell>
  );
}
