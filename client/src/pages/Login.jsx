import { Eye, EyeOff, LogIn } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import Button from "../components/common/Button.jsx";
import Input from "../components/common/Input.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import LogoMark from "../components/common/LogoMark.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, login, loading } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: localStorage.getItem("sgp.remember.email") || "",
    password: "",
    rememberMe: Boolean(localStorage.getItem("sgp.remember.email")),
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

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required.";
    }

    if (!formData.password.trim()) {
      nextErrors.password = "Password is required.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    if (formData.rememberMe) {
      localStorage.setItem("sgp.remember.email", formData.email);
    } else {
      localStorage.removeItem("sgp.remember.email");
    }

    try {
      const result = await login({
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        navigate(location.state?.from || "/dashboard", { replace: true });
      }
    } catch (error) {
      setErrors({
        email: error.message || "Login failed. Please check your credentials.",
      });
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -left-20 top-1/4 h-80 w-80 rounded-full bg-indigo-600/30 blur-3xl" /><div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative flex items-center gap-3"><LogoMark /><span className="text-lg font-semibold">CollabBoard</span></div>
        <div className="relative max-w-lg"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">Learn together</p><h2 className="mt-5 text-5xl font-bold leading-[1.12] tracking-tight">Better teamwork starts with a clear plan.</h2><p className="mt-5 text-base leading-7 text-slate-400">Bring groups, tasks, and deadlines into one calm workspace built for students.</p></div>
        <p className="relative text-xs text-slate-500">Plan · Collaborate · Achieve</p>
      </section>
      <div className="flex items-center justify-center p-5 sm:p-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xl shadow-slate-200/50 sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-700">
          CollabBoard
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">
          Log in to continue managing your study groups.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(event) => setField("email", event.target.value)}
            error={errors.email}
          />

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

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={formData.rememberMe}
              onChange={(event) => setField("rememberMe", event.target.checked)}
            />
            Remember me
          </label>

          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? (
              <LoadingSpinner label="Signing in..." />
            ) : (
              <>
                <LogIn size={16} className="mr-2" /> Login
              </>
            )}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          New here?{" "}
          <Link
            className="font-semibold text-primary-700 hover:underline"
            to="/register"
          >
            Create an account
          </Link>
        </p>
      </div>
      </div>
    </div>
  );
}
