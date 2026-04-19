import { API_BASE_URL } from "../config/env.js";

const MEMBER_SESSION_KEY = "healthy.member.session";

function normalizeMember(member) {
  return {
    id: Number(member?.id ?? 0),
    email: member?.email ?? "",
    fullName: member?.fullName ?? "",
    isVerified: Boolean(member?.isVerified),
    avatarUrl: member?.avatarUrl ?? "",
    createdAt: member?.createdAt ?? "",
  };
}

export const memberAuthService = {
  async registerMember({ email, fullName, password, avatarUrl }, { signal } = {}) {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        fullName,
        password,
        avatarUrl: avatarUrl?.trim() ? avatarUrl.trim() : null,
      }),
      signal,
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.message ?? `Failed to register member: ${response.status}`);
    }

    const payload = await response.json();

    return {
      status: payload.status ?? "registered",
      settingsInitialized: Boolean(payload.settingsInitialized),
      message: payload.message ?? "Member registration completed successfully.",
      member: normalizeMember(payload.member),
    };
  },

  async loginMember({ email, password }, { signal } = {}) {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
      signal,
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.message ?? `Failed to login member: ${response.status}`);
    }

    const payload = await response.json();

    return {
      status: payload.status ?? "authenticated",
      message: payload.message ?? "Member login completed successfully.",
      member: normalizeMember(payload.member),
    };
  },

  readSession() {
    const rawValue = window.localStorage.getItem(MEMBER_SESSION_KEY);

    if (!rawValue) {
      return null;
    }

    try {
      const parsedValue = JSON.parse(rawValue);
      if (!parsedValue?.member) {
        return null;
      }

      return {
        member: normalizeMember(parsedValue.member),
      };
    } catch {
      return null;
    }
  },

  saveSession(member) {
    window.localStorage.setItem(
      MEMBER_SESSION_KEY,
      JSON.stringify({
        member: normalizeMember(member),
      }),
    );
  },

  clearSession() {
    window.localStorage.removeItem(MEMBER_SESSION_KEY);
  },
};