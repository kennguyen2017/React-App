export const GOOGLE_SSO_INTENTS = {
  register: "register",
  login: "login",
};

function createPendingBackendResponse(intent) {
  return {
    provider: "google",
    intent,
    status: "pending-backend",
    authorizationUrl: null,
    message:
      intent === GOOGLE_SSO_INTENTS.register
        ? "Google SSO registration UI is ready. Backend OAuth endpoints will be connected in a later task."
        : "Google SSO login UI is ready. Backend OAuth endpoints will be connected in a later task.",
  };
}

export const googleSsoService = {
  getProviderLabel() {
    return "Google SSO";
  },

  async start(intent) {
    return createPendingBackendResponse(intent);
  },

  async handleCallback() {
    return {
      status: "pending-backend",
      message: "OAuth callback handling will be enabled when backend endpoints are available.",
    };
  },
};