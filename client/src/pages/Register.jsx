import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Button from "../components/common/Button.jsx";
import Input from "../components/common/Input.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import LogoMark from "../components/common/LogoMark.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const navigate = useNavigate();
  const { isAuthenticated, register, loading } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "team_member",
  });
  const [errors, setErrors] = useState({});

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const setField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!formData.fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required.";
    }

    if (formData.password.length < 6) {
      nextErrors.password = "Password should contain at least 6 characters.";
    }

    if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      const result = await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      if (result.success) {
        alert("Registration successful! Please log in with your credentials.");
        navigate("/login");
      } else if (result.error) {
        setErrors({ email: result.error });
      }
    } catch (error) {
      setErrors({
        email: error.message || "Registration failed. Please try again.",
      });
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between"><div className="absolute -left-20 top-1/4 h-80 w-80 rounded-full bg-indigo-600/30 blur-3xl" /><div className="relative flex items-center gap-3"><LogoMark /><span className="text-lg font-semibold">CollabBoard</span></div><div className="relative max-w-lg"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">Start collaborating</p><h2 className="mt-5 text-5xl font-bold leading-[1.12] tracking-tight">One place for every idea, task, and deadline.</h2><p className="mt-5 text-base leading-7 text-slate-400">Create your workspace and help your study group stay focused.</p></div><p className="relative text-xs text-slate-500">Plan · Collaborate · Achieve</p></section>
      <div className="flex items-center justify-center p-5 sm:p-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xl shadow-slate-200/50 sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-700">
          CollabBoard
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Create Account
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Set up your workspace to start collaborating.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Full Name"
            value={formData.fullName}
            onChange={(event) => setField("fullName", event.target.value)}
            error={errors.fullName}
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(event) => setField("email", event.target.value)}
            error={errors.email}
          />

          <fieldset>
            <legend className="mb-1.5 text-sm font-medium text-slate-700">
              Account type
            </legend>
            <div className="grid grid-cols-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
              {[
                { value: "team_member", label: "Team Member" },
                { value: "group_leader", label: "Group Leader" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setField("role", option.value)}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    formData.role === option.value
                      ? "bg-white text-primary-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                  aria-pressed={formData.role === option.value}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(event) => setField("password", event.target.value)}
              error={errors.password}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-[38px] text-slate-500"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div className="relative">
            <Input
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(event) =>
                setField("confirmPassword", event.target.value)
              }
              error={errors.confirmPassword}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((value) => !value)}
              className="absolute right-3 top-[38px] text-slate-500"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? (
              <LoadingSpinner label="Registering..." />
            ) : (
              <>
                <UserPlus size={16} className="mr-2" /> Register
              </>
            )}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            className="font-semibold text-primary-700 hover:underline"
            to="/login"
          >
            Login
          </Link>
        </p>
      </div>
      </div>
    </div>
  );
}
