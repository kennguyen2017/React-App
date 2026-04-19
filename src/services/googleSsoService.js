export const GOOGLE_SSO_INTENTS = {
  register: "register",
  login: "login",
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8080";

function getGoogleEndpoint(intent) {
  if (intent === GOOGLE_SSO_INTENTS.register) {
    return "/api/v1/auth/google/register";
  }

  if (intent === GOOGLE_SSO_INTENTS.login) {
    return "/api/v1/auth/google/login";
  }

  throw new Error(`Unsupported Google SSO intent: ${intent}`);
}

function getRedirectUri() {
  return `${window.location.origin}${window.location.pathname}#/auth`;
}

function normalizeStartResponse(payload, intent) {
  return {
    provider: payload.provider ?? "google",
    intent: payload.intent ?? intent,
    status: payload.status ?? "skeleton-ready",
    state: payload.state ?? "",
    authorizationUrl: payload.authorizationUrl ?? null,
    redirectUri: payload.redirectUri ?? null,
    message:
      payload.message ??
      (intent === GOOGLE_SSO_INTENTS.register
        ? "Google register skeleton is connected. Real OAuth exchange is intentionally disabled."
        : "Google login skeleton is connected. Real OAuth exchange is intentionally disabled."),
  };
}

function normalizeCallbackResponse(payload) {
  return {
    provider: payload.provider ?? "google",
    intent: payload.intent ?? "callback",
    status: payload.status ?? "callback-ready",
    state: payload.state ?? "",
    authorizationUrl: null,
    message:
      payload.message ?? "Google callback endpoint is live. Real token exchange is intentionally disabled.",
  };
}

export const googleSsoService = {
  getProviderLabel() {
    return "Google SSO";
  },

  async start(intent, { signal } = {}) {
    const response = await fetch(`${API_BASE_URL}${getGoogleEndpoint(intent)}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        redirectUri: getRedirectUri(),
      }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`Failed to start Google SSO: ${response.status}`);
    }

    const payload = await response.json();
    return normalizeStartResponse(payload, intent);
  },

  async handleCallback(params, { signal } = {}) {
    const searchParams = params instanceof URLSearchParams ? params : new URLSearchParams(params);
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/google/callback?${searchParams.toString()}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal,
    });

    if (!response.ok) {
      throw new Error(`Failed to handle Google callback: ${response.status}`);
    }

    const payload = await response.json();
    return normalizeCallbackResponse(payload);
  },
};