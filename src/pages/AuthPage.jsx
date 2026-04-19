import { useEffect, useState } from "react";
import { GOOGLE_SSO_INTENTS, googleSsoService } from "../services/googleSsoService.js";
import { memberAuthService } from "../services/memberAuthService.js";

const callbackFields = ["code", "state", "scope", "authuser", "prompt"];

const AUTH_MODES = {
  login: "login",
  signup: "signup",
};

function createInitialLoginForm() {
  return {
    email: "",
    password: "",
  };
}

function createInitialRegistrationForm() {
  return {
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    avatarUrl: "",
  };
}

function hasCallbackPayload(searchParams) {
  return callbackFields.some((field) => searchParams.has(field));
}

function AuthActionCard({ title, description, buttonLabel, onAction }) {
  return (
    <article className="auth-card">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <button className="google-auth-button" type="button" onClick={onAction}>
        <span className="google-auth-mark" aria-hidden="true">
          G
        </span>
        <span>{buttonLabel}</span>
      </button>
    </article>
  );
}

export function AuthPage({ onAuthenticated }) {
  const [mode, setMode] = useState(AUTH_MODES.login);
  const [loginForm, setLoginForm] = useState(() => createInitialLoginForm());
  const [registrationForm, setRegistrationForm] = useState(() => createInitialRegistrationForm());
  const [authState, setAuthState] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function handleLoginFieldChange(event) {
    const { name, value } = event.target;
    setLoginForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function handleRegistrationFieldChange(event) {
    const { name, value } = event.target;
    setRegistrationForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  async function handleLogin(event) {
    event.preventDefault();

    try {
      setIsLoggingIn(true);
      const nextState = await memberAuthService.loginMember({
        email: loginForm.email.trim(),
        password: loginForm.password,
      });

      memberAuthService.saveSession(nextState.member);
      setErrorMessage("");
      setSuccessMessage(nextState.message);
      onAuthenticated?.(nextState.member);
    } catch (error) {
      setErrorMessage(error.message || "Failed to login member.");
      setSuccessMessage("");
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function handleRegisterMember(event) {
    event.preventDefault();

    if (registrationForm.password !== registrationForm.confirmPassword) {
      setErrorMessage("Password confirmation does not match.");
      setSuccessMessage("");
      return;
    }

    try {
      setIsRegistering(true);
      const nextState = await memberAuthService.registerMember({
        email: registrationForm.email.trim(),
        fullName: registrationForm.fullName.trim(),
        password: registrationForm.password,
        avatarUrl: registrationForm.avatarUrl,
      });
      setErrorMessage("");
      setSuccessMessage("Account created successfully. Sign in with your new email and password.");
      setMode(AUTH_MODES.login);
      setLoginForm({
        email: nextState.member.email,
        password: "",
      });
      setRegistrationForm(createInitialRegistrationForm());
    } catch (error) {
      setErrorMessage(error.message || "Failed to register member.");
      setSuccessMessage("");
    } finally {
      setIsRegistering(false);
    }
  }

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    if (!hasCallbackPayload(searchParams)) {
      return undefined;
    }

    const abortController = new AbortController();

    async function syncGoogleCallback() {
      try {
        setIsProcessing(true);
        const nextState = await googleSsoService.handleCallback(searchParams, {
          signal: abortController.signal,
        });
        setAuthState(nextState);
        setErrorMessage("");
        setSuccessMessage(nextState.message ?? "Google callback reached the frontend.");
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }

        setErrorMessage("Backend Google callback endpoint is unavailable. Start the backend before testing auth.");
      } finally {
        if (!abortController.signal.aborted) {
          setIsProcessing(false);
        }
      }
    }

    syncGoogleCallback();

    return () => {
      abortController.abort();
    };
  }, []);

  async function runGoogleSso(intent) {
    try {
      setIsProcessing(true);
      const nextState = await googleSsoService.start(intent);
      setAuthState(nextState);
      setErrorMessage("");
      setSuccessMessage(nextState.message ?? "Google auth skeleton responded successfully.");
    } catch (error) {
      setErrorMessage("Backend Google auth skeleton is unavailable. Start the backend before testing auth.");
      setSuccessMessage("");
    } finally {
      setIsProcessing(false);
    }
  }

  const statusValue = errorMessage
    ? "Backend unavailable"
    : isLoggingIn
      ? "Signing in"
    : isRegistering
      ? "Creating account"
    : isProcessing
      ? "Syncing backend"
      : successMessage
        ? "Ready"
        : "Login required";

  const statusNote = errorMessage
    ? errorMessage
    : successMessage || authState?.message || "Sign in with an existing member account before accessing the Healthy pages.";

  return (
    <div className="auth-gate-shell">
      <section className="auth-gate-card">
        <div className="auth-gate-lock" aria-hidden="true">
          🔒
        </div>
        <h1>{mode === AUTH_MODES.login ? "Login" : "Sign Up"}</h1>
        <p className="auth-gate-subtitle">
          {mode === AUTH_MODES.login ? "Sign in to your account" : "Create a new Healthy member account"}
        </p>

        <div className="auth-gate-status">
          <strong>{statusValue}</strong>
          <span>{statusNote}</span>
        </div>

        <button className="google-auth-button auth-gate-google" type="button" onClick={() => runGoogleSso(mode === AUTH_MODES.login ? GOOGLE_SSO_INTENTS.login : GOOGLE_SSO_INTENTS.register)}>
          <span className="google-auth-mark" aria-hidden="true">
            G
          </span>
          <span>{mode === AUTH_MODES.login ? "Login with Google" : "Continue with Google"}</span>
        </button>

        <div className="auth-gate-divider">
          <span>or</span>
        </div>

        {mode === AUTH_MODES.login ? (
          <form className="auth-gate-form" onSubmit={handleLogin}>
            <label className="auth-gate-field">
              <span>Email</span>
              <input name="email" type="email" value={loginForm.email} onChange={handleLoginFieldChange} placeholder="Email" required />
            </label>

            <label className="auth-gate-field">
              <span>Password</span>
              <input name="password" type="password" value={loginForm.password} onChange={handleLoginFieldChange} placeholder="Password" minLength="8" required />
            </label>

            <button className="auth-gate-submit" type="submit" disabled={isLoggingIn}>
              {isLoggingIn ? "Logging in..." : "Login"}
            </button>
          </form>
        ) : (
          <form className="auth-gate-form" onSubmit={handleRegisterMember}>
            <label className="auth-gate-field">
              <span>Full name</span>
              <input name="fullName" type="text" value={registrationForm.fullName} onChange={handleRegistrationFieldChange} placeholder="Full name" required />
            </label>

            <label className="auth-gate-field">
              <span>Email</span>
              <input name="email" type="email" value={registrationForm.email} onChange={handleRegistrationFieldChange} placeholder="Email" required />
            </label>

            <label className="auth-gate-field">
              <span>Password</span>
              <input name="password" type="password" value={registrationForm.password} onChange={handleRegistrationFieldChange} placeholder="Password" minLength="8" required />
            </label>

            <label className="auth-gate-field">
              <span>Confirm password</span>
              <input name="confirmPassword" type="password" value={registrationForm.confirmPassword} onChange={handleRegistrationFieldChange} placeholder="Confirm password" minLength="8" required />
            </label>

            <label className="auth-gate-field">
              <span>Avatar URL</span>
              <input name="avatarUrl" type="url" value={registrationForm.avatarUrl} onChange={handleRegistrationFieldChange} placeholder="https://..." />
            </label>

            <button className="auth-gate-submit" type="submit" disabled={isRegistering}>
              {isRegistering ? "Creating account..." : "Create account"}
            </button>
          </form>
        )}

        <p className="auth-gate-switch">
          {mode === AUTH_MODES.login ? "Don't have an account? " : "Already have an account? "}
          <button
            className="auth-gate-switch-button"
            type="button"
            onClick={() => {
              setMode(mode === AUTH_MODES.login ? AUTH_MODES.signup : AUTH_MODES.login);
              setErrorMessage("");
              setSuccessMessage("");
            }}
          >
            {mode === AUTH_MODES.login ? "Sign up" : "Login"}
          </button>
        </p>

        {authState ? (
          <div className="auth-gate-footnote">
            <div>Google callback fields ready: {callbackFields.join(", ")}</div>
            <div>{authState.message}</div>
          </div>
        ) : null}
      </section>
    </div>
  );
}