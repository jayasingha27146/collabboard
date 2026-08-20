import {
  CheckCircle2,
  KeyRound,
  LoaderCircle,
  LogOut,
  Mail,
  Pencil,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "../components/common/Avatar.jsx";
import Button from "../components/common/Button.jsx";
import Input from "../components/common/Input.jsx";
import AppShell from "../components/layout/AppShell.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import * as authService from "../services/authService.js";

const roleLabel = (role) =>
  role === "group_leader" ? "Group Leader" : "Team Member";

export default function Profile() {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuth();
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    role: user?.role || "Member",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileStatus, setProfileStatus] = useState({
    loading: false,
    message: "",
    error: "",
  });
  const [passwordStatus, setPasswordStatus] = useState({
    loading: false,
    message: "",
    error: "",
  });

  useEffect(() => {
    setProfileData({
      fullName: user?.fullName || "",
      email: user?.email || "",
      role: user?.role || "Member",
    });
  }, [user]);

  const resetProfileForm = () => {
    setProfileData({
      fullName: user?.fullName || "",
      email: user?.email || "",
      role: user?.role || "Member",
    });
    setProfileStatus({ loading: false, message: "", error: "" });
    setIsEditingProfile(false);
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();
    setProfileStatus({ loading: true, message: "", error: "" });

    try {
      const response = await authService.updateProfile({
        fullName: profileData.fullName.trim(),
        email: profileData.email.trim(),
      });
      const updatedUser = response?.data || response;
      const avatar = profileData.fullName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();

      setUser({
        ...user,
        fullName: updatedUser?.name || profileData.fullName.trim(),
        email: updatedUser?.email || profileData.email.trim(),
        avatar,
      });
      setProfileStatus({
        loading: false,
        message: "Profile updated",
        error: "",
      });
      setIsEditingProfile(false);
    } catch (error) {
      setProfileStatus({ loading: false, message: "", error: error.message });
    }
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    if (passwordData.newPassword.length < 6) {
      setPasswordStatus({
        loading: false,
        message: "",
        error: "New password must be at least 6 characters.",
      });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordStatus({
        loading: false,
        message: "",
        error: "New passwords do not match.",
      });
      return;
    }

    setPasswordStatus({ loading: true, message: "", error: "" });
    try {
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordStatus({
        loading: false,
        message: "Password updated",
        error: "",
      });
      setIsChangingPassword(false);
    } catch (error) {
      setPasswordStatus({ loading: false, message: "", error: error.message });
    }
  };

  return (
    <AppShell>
      <section className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">
            Account settings
          </p>
          <h1 className="page-title mt-1">Your profile</h1>
          <p className="page-subtitle">
            Manage your personal details and account security.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Account
          active
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 items-start gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-xl shadow-slate-200 lg:sticky lg:top-24">
          <div className="relative px-6 pb-7 pt-8 text-center">
            <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-indigo-500/30 blur-3xl" />
            <div className="absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-violet-500/15 blur-3xl" />
            <div className="relative flex flex-col items-center">
              <div className="rounded-full border-4 border-white/10 bg-white/5 p-1.5">
                <Avatar
                  initials={user?.avatar || "SU"}
                  className="h-24 w-24 bg-gradient-to-br from-indigo-300 to-primary-600 text-2xl text-white"
                />
              </div>
              <h2 className="mt-4 text-xl font-bold text-white">
                {profileData.fullName}
              </h2>
              <p className="mt-1 text-sm text-slate-400">{profileData.email}</p>
              <p className="mt-3 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1 text-xs font-semibold text-indigo-200">
                {roleLabel(profileData.role)}
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 px-5 py-5">
            <dl className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Mail size={15} className="text-slate-500" />
                <div className="min-w-0">
                  <dt className="text-[10px] uppercase tracking-wider text-slate-500">
                    Email
                  </dt>
                  <dd className="truncate text-xs text-slate-300">
                    {profileData.email}
                  </dd>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck size={15} className="text-slate-500" />
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-slate-500">
                    Access
                  </dt>
                  <dd className="text-xs text-slate-300">{roleLabel(profileData.role)}</dd>
                </div>
              </div>
            </dl>
            <Button
              variant="danger"
              className="mt-5 w-full gap-2 border border-rose-400/20 bg-rose-600 py-3 text-white shadow-lg shadow-rose-950/25 hover:bg-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              <LogOut size={16} aria-hidden="true" />
              <span>Sign out</span>
            </Button>
          </div>
        </aside>

        <div className="space-y-5">
          <section className="glass-card p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="rounded-xl bg-primary-50 p-2.5 text-primary-600">
                  <UserRound size={19} />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Personal information
                  </h3>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Update the details shown across your workspace.
                  </p>
                </div>
              </div>
              {!isEditingProfile && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setProfileStatus({
                      loading: false,
                      message: "",
                      error: "",
                    });
                    setIsEditingProfile(true);
                  }}
                >
                  <Pencil size={15} className="mr-2" /> Edit profile
                </Button>
              )}
            </div>
            <form
              className="mt-6 grid gap-5 sm:grid-cols-2"
              onSubmit={handleProfileSave}
            >
              <Input
                label="Full Name"
                value={profileData.fullName}
                disabled={!isEditingProfile}
                required
                onChange={(event) =>
                  setProfileData((current) => ({
                    ...current,
                    fullName: event.target.value,
                  }))
                }
              />
              <Input
                label="Email"
                type="email"
                value={profileData.email}
                disabled={!isEditingProfile}
                required
                onChange={(event) =>
                  setProfileData((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
              />
              <Input
                containerClassName="sm:col-span-2"
                label="Workspace role"
                value={roleLabel(profileData.role)}
                disabled
              />
              <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                {isEditingProfile && (
                  <>
                    <Button type="submit" disabled={profileStatus.loading}>
                      {profileStatus.loading ? (
                        <LoaderCircle size={15} className="mr-2 animate-spin" />
                      ) : null}
                      Save changes
                    </Button>
                    <Button variant="ghost" onClick={resetProfileForm}>
                      <X size={15} className="mr-2" /> Cancel
                    </Button>
                  </>
                )}
                {profileStatus.message && (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                    <CheckCircle2 size={15} /> {profileStatus.message}
                  </span>
                )}
                {profileStatus.error && (
                  <span className="text-xs font-semibold text-rose-600">
                    {profileStatus.error}
                  </span>
                )}
              </div>
            </form>
          </section>

          <section className="glass-card p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="rounded-xl bg-violet-50 p-2.5 text-violet-600">
                  <KeyRound size={19} />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Password & security
                  </h3>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Choose a strong password you do not use elsewhere.
                  </p>
                </div>
              </div>
              {!isChangingPassword && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setPasswordStatus({
                      loading: false,
                      message: "",
                      error: "",
                    });
                    setIsChangingPassword(true);
                  }}
                >
                  <KeyRound size={15} className="mr-2" /> Change password
                </Button>
              )}
            </div>
            {isChangingPassword && (
              <form
                className="mt-6 grid gap-5 sm:grid-cols-2"
                onSubmit={handlePasswordChange}
              >
                <Input
                  label="Current Password"
                  type="password"
                  autoComplete="current-password"
                  value={passwordData.currentPassword}
                  required
                  onChange={(event) =>
                    setPasswordData((current) => ({
                      ...current,
                      currentPassword: event.target.value,
                    }))
                  }
                />
                <Input
                  label="New Password"
                  type="password"
                  autoComplete="new-password"
                  value={passwordData.newPassword}
                  minLength={6}
                  required
                  onChange={(event) =>
                    setPasswordData((current) => ({
                      ...current,
                      newPassword: event.target.value,
                    }))
                  }
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  autoComplete="new-password"
                  value={passwordData.confirmPassword}
                  required
                  onChange={(event) =>
                    setPasswordData((current) => ({
                      ...current,
                      confirmPassword: event.target.value,
                    }))
                  }
                />
                <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                  <Button type="submit" disabled={passwordStatus.loading}>
                    {passwordStatus.loading ? (
                      <LoaderCircle size={15} className="mr-2 animate-spin" />
                    ) : null}
                    Update password
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                      setPasswordStatus({
                        loading: false,
                        message: "",
                        error: "",
                      });
                      setIsChangingPassword(false);
                    }}
                  >
                    <X size={15} className="mr-2" /> Cancel
                  </Button>
                  {passwordStatus.error && (
                    <span className="text-xs font-semibold text-rose-600">
                      {passwordStatus.error}
                    </span>
                  )}
                </div>
              </form>
            )}
            {!isChangingPassword && passwordStatus.message && (
              <p className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <CheckCircle2 size={15} /> {passwordStatus.message}
              </p>
            )}
          </section>
        </div>
      </section>
    </AppShell>
  );
}
