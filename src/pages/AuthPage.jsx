import { useEffect, useState } from "react";
import { GOOGLE_SSO_INTENTS, googleSsoService } from "../services/googleSsoService.js";
import { memberAuthService } from "../services/memberAuthService.js";

const callbackFields = ["code", "state", "scope", "authuser", "prompt"];

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

export function AuthPage() {
  const [registrationForm, setRegistrationForm] = useState(() => createInitialRegistrationForm());
  const [registrationState, setRegistrationState] = useState(null);
  const [authState, setAuthState] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function handleRegistrationFieldChange(event) {
    const { name, value } = event.target;
    setRegistrationForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  async function handleRegisterMember(event) {
    event.preventDefault();

    if (registrationForm.password !== registrationForm.confirmPassword) {
      setErrorMessage("Password confirmation does not match.");
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
      setRegistrationState(nextState);
      setErrorMessage("");
      setRegistrationForm(createInitialRegistrationForm());
    } catch (error) {
      setErrorMessage(error.message || "Failed to register member.");
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
    } catch (error) {
      setErrorMessage("Backend Google auth skeleton is unavailable. Start the backend before testing auth.");
    } finally {
      setIsProcessing(false);
    }
  }

  const statusValue = errorMessage
    ? "Backend unavailable"
    : isRegistering
      ? "Creating member"
    : isProcessing
      ? "Syncing backend"
      : registrationState?.status ?? authState?.status ?? "Registration API connected";

  const statusNote = errorMessage
    ? errorMessage
    : registrationState?.message ?? authState?.message ?? "Member registration is now connected to the backend and persists new users in the database.";

  return (
    <>
      <section className="auth-hero section-block">
        <div>
          <div className="auth-kicker">AUTH READY</div>
          <h1>Member Registration</h1>
          <p>
            New members can now be created from the frontend and stored in the backend users table. Google SSO remains
            available as a secondary placeholder flow, but the primary registration path is now a real API integration.
          </p>
        </div>
        <div className="auth-status-card">
          <div className="auth-status-label">Current integration status</div>
          <div className="auth-status-value">{statusValue}</div>
          <div className="auth-status-note">{statusNote}</div>
        </div>
      </section>

      <section className="auth-grid">
        <article className="auth-card auth-register-card">
          <div>
            <h2>Create member account</h2>
            <p>Register a new Healthy member with name, email, password, and an optional profile image.</p>
          </div>

          <form className="auth-form" onSubmit={handleRegisterMember}>
            <label className="auth-form-field">
              <span>Full name</span>
              <input name="fullName" type="text" value={registrationForm.fullName} onChange={handleRegistrationFieldChange} required />
            </label>

            <label className="auth-form-field">
              <span>Email</span>
              <input name="email" type="email" value={registrationForm.email} onChange={handleRegistrationFieldChange} required />
            </label>

            <label className="auth-form-field">
              <span>Password</span>
              <input name="password" type="password" minLength="8" value={registrationForm.password} onChange={handleRegistrationFieldChange} required />
            </label>

            <label className="auth-form-field">
              <span>Confirm password</span>
              <input name="confirmPassword" type="password" minLength="8" value={registrationForm.confirmPassword} onChange={handleRegistrationFieldChange} required />
            </label>

            <label className="auth-form-field auth-form-field-full">
              <span>Avatar URL</span>
              <input name="avatarUrl" type="url" value={registrationForm.avatarUrl} onChange={handleRegistrationFieldChange} placeholder="https://..." />
            </label>

            <button className="auth-submit-button" type="submit" disabled={isRegistering}>
              {isRegistering ? "Creating member..." : "Register member"}
            </button>
          </form>
        </article>

        <article className="auth-card auth-member-card">
          <div>
            <h2>Latest member result</h2>
            <p>The backend creates a user row and initializes a default settings row in the same request.</p>
          </div>

          {registrationState ? (
            <div className="auth-member-summary">
              <div className="auth-result-row">
                <span>Member ID</span>
                <strong>{registrationState.member.id}</strong>
              </div>
              <div className="auth-result-row">
                <span>Name</span>
                <strong>{registrationState.member.fullName}</strong>
              </div>
              <div className="auth-result-row">
                <span>Email</span>
                <strong>{registrationState.member.email}</strong>
              </div>
              <div className="auth-result-row">
                <span>Verified</span>
                <strong>{registrationState.member.isVerified ? "Yes" : "No"}</strong>
              </div>
              <div className="auth-result-row">
                <span>Created</span>
                <strong>{registrationState.member.createdAt}</strong>
              </div>
              <div className="auth-result-row">
                <span>Settings row</span>
                <strong>{registrationState.settingsInitialized ? "Initialized" : "Pending"}</strong>
              </div>
            </div>
          ) : (
            <div className="auth-placeholder-copy">Submit the registration form to see the persisted member payload returned from the backend.</div>
          )}
        </article>
      </section>

      <section className="auth-flow-grid">
        <article className="section-block auth-flow-card">
          <h2>Google registration placeholder</h2>
          <p>The Google SSO skeleton is still available if you want to preserve the alternate provider entry point.</p>
          <div className="auth-secondary-actions">
            <button className="google-auth-button" type="button" onClick={() => runGoogleSso(GOOGLE_SSO_INTENTS.register)}>
              <span className="google-auth-mark" aria-hidden="true">
                G
              </span>
              <span>Continue with Google</span>
            </button>
            <button className="google-auth-button" type="button" onClick={() => runGoogleSso(GOOGLE_SSO_INTENTS.login)}>
              <span className="google-auth-mark" aria-hidden="true">
                G
              </span>
              <span>Sign in with Google</span>
            </button>
          </div>
        </article>

        <article className="section-block auth-flow-card">
          <h2>Callback and service boundary</h2>
          <p>
            The screen now uses a dedicated registration API for members, while the Google callback contract remains
            isolated behind its existing service boundary.
          </p>
          <div className="callback-chip-row">
            {callbackFields.map((field) => (
              <span className="callback-chip" key={field}>
                {field}
              </span>
            ))}
          </div>
          <code className="auth-inline-contract">memberAuthService.registerMember(payload)</code>
          <code className="auth-inline-contract">googleSsoService.start(intent)</code>
          <code className="auth-inline-contract">googleSsoService.handleCallback(params)</code>
        </article>
      </section>

      {authState ? (
        <section className="section-block auth-result-panel">
          <div className="auth-result-heading">Latest Google action</div>
          <div className="auth-result-row">
            <span>Provider</span>
            <strong>{authState.provider}</strong>
          </div>
          <div className="auth-result-row">
            <span>Intent</span>
            <strong>{authState.intent}</strong>
          </div>
          <div className="auth-result-row">
            <span>Status</span>
            <strong>{authState.status}</strong>
          </div>
          {authState.state ? (
            <div className="auth-result-row">
              <span>State</span>
              <strong>{authState.state}</strong>
            </div>
          ) : null}
          {authState.authorizationUrl ? (
            <div className="auth-result-row">
              <span>Redirect URL</span>
              <strong>{authState.authorizationUrl}</strong>
            </div>
          ) : null}
          <p>{authState.message}</p>
        </section>
      ) : null}
    </>
  );
}