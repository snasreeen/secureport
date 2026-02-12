import React, { useMemo, useState } from 'react';
import { useAuth } from '../state/AuthContext.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const getPasswordStrength = (value) => {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[0-9]/.test(value)) score += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(value)) score += 1;
  if (/[A-Z]/.test(value)) score += 1;

  if (!value) return { label: 'Weak', level: 'weak' };
  if (score <= 1) return { label: 'Weak', level: 'weak' };
  if (score === 2) return { label: 'Medium', level: 'medium' };
  return { label: 'Strong', level: 'strong' };
};

const LoginPage = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShake(false);
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        await register(email, password);
      }
    } catch (err) {
      const msg =
        err?.message ||
        err.response?.data?.message ||
        'Unable to authenticate. Please try again.';
      setError(msg);
      setShake(true);
      setLoading(false);
    }
  };

  const passwordValidPolicy = {
    length: password.length >= 8,
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-black to-background px-4 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute -left-40 top-10 h-64 w-64 rounded-full bg-accent/20 blur-3xl animate-pulse-soft" />
        <div className="absolute -right-40 bottom-10 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl animate-pulse-soft" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold text-textPrimary tracking-tight">SecurePort</h1>
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-textSecondary">
            Ethical TCP Port Scanning Platform
          </p>
        </div>

        <div
          className={`glass-card p-6 space-y-5 ${
            shake ? 'animate-shake' : ''
          }`}
        >
          <div className="flex gap-2 text-xs bg-black/40 rounded-full p-1">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`flex-1 rounded-full px-3 py-2 font-semibold transition ${
                mode === 'login'
                  ? 'bg-accent text-black shadow-glow-soft'
                  : 'text-textSecondary'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
              }}
              className={`flex-1 rounded-full px-3 py-2 font-semibold transition ${
                mode === 'register'
                  ? 'bg-accent text-black shadow-glow-soft'
                  : 'text-textSecondary'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="email">
                Email
              </label>
              <div className="field-icon-wrapper">
                <span className="field-icon">
                  <span className="material-icons text-xs">lock</span>
                </span>
                <input
                  id="email"
                  type="email"
                  className="input field-input-with-icon"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <div className="field-icon-wrapper">
                <span className="field-icon">
                  <span className="material-icons text-xs">vpn_key</span>
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="input field-input-with-icon pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-icons text-sm">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px]">
                <span className="text-textSecondary">Strength:</span>
                <span
                  className={
                    strength.level === 'strong'
                      ? 'text-accent'
                      : strength.level === 'medium'
                      ? 'text-yellow-300'
                      : 'text-danger'
                  }
                >
                  {strength.label}
                </span>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="label" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  className="input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}

            {mode === 'register' && (
              <div className="password-policy">
                <div className="mb-1 text-[11px] text-textSecondary">
                  Password policy:
                </div>
                <ul className="space-y-0.5">
                  <li
                    className={`password-policy-item ${
                      passwordValidPolicy.length
                        ? 'password-policy-valid'
                        : 'password-policy-invalid'
                    }`}
                  >
                    <span>•</span>
                    <span>At least 8 characters</span>
                  </li>
                  <li
                    className={`password-policy-item ${
                      passwordValidPolicy.number
                        ? 'password-policy-valid'
                        : 'password-policy-invalid'
                    }`}
                  >
                    <span>•</span>
                    <span>At least 1 number</span>
                  </li>
                  <li
                    className={`password-policy-item ${
                      passwordValidPolicy.special
                        ? 'password-policy-valid'
                        : 'password-policy-invalid'
                    }`}
                  >
                    <span>•</span>
                    <span>At least 1 special character</span>
                  </li>
                </ul>
              </div>
            )}

            {error && (
              <div className="error-card">
                <div className="font-semibold mb-1">Authentication error</div>
                <div>{error}</div>
              </div>
            )}

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? (
                <LoadingSpinner
                  label={mode === 'login' ? 'Authenticating...' : 'Creating account...'}
                />
              ) : (
                (mode === 'login' ? 'Secure Login' : 'Create Secure Account')
              )}
            </button>

            <div className="mt-3 flex items-center justify-between text-[11px] text-textSecondary">
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1 rounded-full border border-emerald-800/70 bg-emerald-900/40 px-2 py-0.5">
                  <span className="material-icons text-[12px] text-accent">verified_user</span>
                  <span>Secure Login – JWT Protected</span>
                </div>
                <div className="text-[10px] text-textSecondary/80">
                  Rate limited, CSRF protected, and fully audit-logged.
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

