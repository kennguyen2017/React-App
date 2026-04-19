import { useEffect, useState } from "react";
import { GOOGLE_SSO_INTENTS, googleSsoService } from "../services/googleSsoService.js";

const callbackFields = ["code", "state", "scope", "authuser", "prompt"];

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
  const [authState, setAuthState] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
    : isProcessing
      ? "Syncing backend"
      : authState?.status ?? "Backend skeleton connected";

  const statusNote = errorMessage
    ? errorMessage
    : authState?.message ?? "Intent endpoints and callback contract are now connected to backend placeholder routes.";

  return (
    <>
      <section className="auth-hero section-block">
        <div>
          <div className="auth-kicker">AUTH READY</div>
          <h1>Google SSO</h1>
          <p>
            Frontend registration and login actions are now wired to backend placeholder endpoints. Real OAuth exchange
            and account linking are still intentionally out of scope for this phase.
          </p>
        </div>
        <div className="auth-status-card">
          <div className="auth-status-label">Current integration status</div>
          <div className="auth-status-value">{statusValue}</div>
          <div className="auth-status-note">{statusNote}</div>
        </div>
      </section>

      <section className="auth-grid">
        <AuthActionCard
          title="Register with Google"
          description="Prepare the Google sign-up entry point and preserve the user intent for backend OAuth callback handling."
          buttonLabel="Continue with Google"
          onAction={() => runGoogleSso(GOOGLE_SSO_INTENTS.register)}
        />
        <AuthActionCard
          title="Login with Google"
          description="Prepare the Google sign-in entry point and keep the login state ready for backend verification later."
          buttonLabel="Sign in with Google"
          onAction={() => runGoogleSso(GOOGLE_SSO_INTENTS.login)}
        />
      </section>

      <section className="auth-flow-grid">
        <article className="section-block auth-flow-card">
          <h2>Callback contract placeholder</h2>
          <p>The frontend is ready to read the following callback params after backend OAuth redirect is added:</p>
          <div className="callback-chip-row">
            {callbackFields.map((field) => (
              <span className="callback-chip" key={field}>
                {field}
              </span>
            ))}
          </div>
        </article>

        <article className="section-block auth-flow-card">
          <h2>Service boundary</h2>
          <p>
            Google auth logic is isolated behind a service interface, so backend endpoints can be added later
            without rewriting the screen.
          </p>
          <code className="auth-inline-contract">googleSsoService.start(intent)</code>
          <code className="auth-inline-contract">googleSsoService.handleCallback(params)</code>
        </article>
      </section>

      {authState ? (
        <section className="section-block auth-result-panel">
          <div className="auth-result-heading">Latest action</div>
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