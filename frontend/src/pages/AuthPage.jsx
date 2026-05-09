import { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../state/AuthContext";
import { ThemeContext } from "../state/ThemeContext";
import { useToast } from "../hooks/useToast";
import { validateEmail, validateName, validatePassword } from "../utils/validation";
import usePasswordStrength from "../hooks/usePasswordStrength";
import "./AuthPage.css";

const Icons = {
  Logo: () => (
    <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id="auth-logo" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#A5B4FC" />
          <stop offset="100%" stopColor="#FFFFFF" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#auth-logo)" />
      <path
        d="M9 16.5L13.5 21L23 11"
        stroke="#312E81"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  ),
  Eye: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  EyeOff: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ),
  Spinner: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" className="spinner" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" />
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 7l4 4 6-6" />
    </svg>
  ),
  Alert: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 5v4M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  Sun: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  ),
  Moon: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  Google: () => (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  ),
  GitHub: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 1.75.65 1.25-.35 2.6-.35 3.85 0 .91-.92 1.75-.65 1.75-.65.55 1.37.2 2.39.1 2.64.65.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.67-4.57 4.92.36.31.68.92.68 1.85v2.75c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
    </svg>
  ),
};

export default function AuthPage({ mode }) {
  const isLogin = mode === "login";
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const errorRef = useRef(null);
  const { strength, feedback, checkStrength } = usePasswordStrength();

  useEffect(() => {
    if (!isLogin) checkStrength(form.password);
  }, [form.password, isLogin, checkStrength]);

  useEffect(() => {
    setForm({ name: "", email: "", password: "" });
    setErrors({});
    setFormError("");
    setTouched({});
  }, [mode]);

  useEffect(() => {
    if (formError && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [formError]);

  const validateField = (name, value) => {
    let error = "";
    if (name === "name" && !isLogin && !validateName(value)) error = "Name must be 2-50 characters";
    if (name === "email" && !validateEmail(value)) error = "Enter a valid email address";
    if (name === "password") {
      if (isLogin) {
        if (!value || value.length < 6) error = "Password is required";
      } else if (!validatePassword(value)) {
        error = "Use 8+ chars with upper, lower & a number";
      }
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) validateField(name, value);
  };

  const validateForm = () => {
    const fields = isLogin ? ["email", "password"] : ["name", "email", "password"];
    let ok = true;
    fields.forEach((field) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      if (!validateField(field, form[field])) ok = false;
    });
    return ok;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!validateForm()) {
      showToast("Please fix the highlighted fields", "error");
      return;
    }
    setLoading(true);
    try {
      const payload = isLogin
        ? { email: form.email.trim().toLowerCase(), password: form.password }
        : {
            name: form.name.trim(),
            email: form.email.trim().toLowerCase(),
            password: form.password,
          };
      const { data } = await api.post(isLogin ? "/auth/login" : "/auth/signup", payload);
      login(data);
      showToast(`Welcome${data.user?.name ? `, ${data.user.name}` : ""}!`, "success");
      navigate("/", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || "Authentication failed. Please try again.";
      setFormError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout" data-theme={theme}>
      <button
        className="theme-toggle"
        type="button"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      >
        {theme === "dark" ? <Icons.Sun /> : <Icons.Moon />}
      </button>

      <aside className="auth-illustration" aria-hidden="true">
        <div className="auth-illustration-content">
          <div className="auth-logo">
            <Icons.Logo />
            <span>TaskFlow</span>
          </div>
          <h1>Plan, ship and ship again.</h1>
          <p className="illustration-desc">
            A modern workspace for product teams to plan sprints, assign work and track delivery — all in one place.
          </p>
          <div className="auth-features">
            {[
              "Real-time collaboration",
              "Role-based access controls",
              "Sprint and backlog tracking",
              "Beautiful analytics dashboard",
            ].map((feature) => (
              <div className="feature" key={feature}>
                <span className="feature-dot" aria-hidden="true">
                  <Icons.Check />
                </span>
                <span>{feature}</span>
              </div>
            ))}
          </div>
          <div className="illustration-footer">
            <div className="avatars" aria-hidden="true">
              <span style={{ background: "linear-gradient(135deg,#a5b4fc,#6366f1)" }}>JD</span>
              <span style={{ background: "linear-gradient(135deg,#fbcfe8,#ec4899)" }}>RS</span>
              <span style={{ background: "linear-gradient(135deg,#bbf7d0,#10b981)" }}>AK</span>
            </div>
            <p>Trusted by ambitious product teams.</p>
          </div>
        </div>
      </aside>

      <main className="auth-form-wrapper">
        <form className="auth-form" onSubmit={onSubmit} noValidate>
          <div className="form-header">
            <h2>{isLogin ? "Welcome back" : "Create your account"}</h2>
            <p>{isLogin ? "Sign in to continue to your workspace." : "Start collaborating with your team in minutes."}</p>
          </div>

          {formError && (
            <div className="alert alert-error" role="alert" ref={errorRef}>
              <Icons.Alert />
              <span>{formError}</span>
            </div>
          )}

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Jane Doe"
                required
                value={form.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.name && touched.name ? "input-error" : ""}
              />
              {errors.name && touched.name && <span className="field-error">{errors.name}</span>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              required
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.email && touched.email ? "input-error" : ""}
            />
            {errors.email && touched.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-field">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={isLogin ? "current-password" : "new-password"}
                placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                minLength={isLogin ? 6 : 8}
                required
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.password && touched.password ? "input-error" : ""}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
              </button>
            </div>
            {!isLogin && form.password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div
                    className={`strength-fill strength-${strength.level}`}
                    style={{ width: `${strength.percent}%` }}
                  />
                </div>
                <div className="strength-feedback">
                  <span className={`strength-label strength-${strength.level}`}>{strength.label}</span>
                  {feedback.length > 0 && <span className="strength-tip">Tip: {feedback[0]}</span>}
                </div>
              </div>
            )}
            {errors.password && touched.password && <span className="field-error">{errors.password}</span>}
          </div>

          <button className="btn btn-primary" disabled={loading} type="submit">
            {loading ? (
              <>
                <Icons.Spinner /> <span>Processing…</span>
              </>
            ) : (
              <span>{isLogin ? "Sign in to workspace" : "Create my account"}</span>
            )}
          </button>

          <div className="divider">
            <span>or continue with</span>
          </div>

          <div className="social-buttons">
            <button
              type="button"
              className="btn btn-social"
              onClick={() => showToast("Google sign-in is coming soon", "info")}
            >
              <Icons.Google /> <span>Google</span>
            </button>
            <button
              type="button"
              className="btn btn-social"
              onClick={() => showToast("GitHub sign-in is coming soon", "info")}
            >
              <Icons.GitHub /> <span>GitHub</span>
            </button>
          </div>

          <p className="auth-switch">
            {isLogin ? "New to TaskFlow?" : "Already have an account?"}{" "}
            <Link
              className="link-primary"
              to={isLogin ? "/signup" : "/login"}
              state={{ from: location.state?.from }}
            >
              {isLogin ? "Create an account" : "Sign in"}
            </Link>
          </p>

          <p className="auth-terms">
            By continuing, you agree to our <a className="link-secondary" href="#terms">Terms</a> and{" "}
            <a className="link-secondary" href="#privacy">Privacy Policy</a>.
          </p>
        </form>
      </main>
    </div>
  );
}
