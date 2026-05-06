const TOKEN_KEY = "auth_token";
const ROLE_KEY = "auth_role";
const USER_ID_KEY = "auth_user_id";
const USERNAME_KEY = "auth_username";
const USER_EMAIL_KEY = "auth_email";

function decodeBase64(input) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  return atob(normalized);
}

function parseJwtPayload(token) {
  try {
    const payload = token.split(".")[1];
    if (!payload) {
      return null;
    }

    return JSON.parse(decodeBase64(payload));
  } catch {
    return null;
  }
}

export function saveAuthSession(authResponse) {
  localStorage.setItem(TOKEN_KEY, authResponse.token);
  localStorage.setItem(ROLE_KEY, authResponse.role ?? "SHIPPER");
  localStorage.setItem(USER_ID_KEY, authResponse.userId ?? "");
  localStorage.setItem(USERNAME_KEY, authResponse.username ?? "");
  localStorage.setItem(USER_EMAIL_KEY, authResponse.email ?? "");
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(USERNAME_KEY);
  localStorage.removeItem(USER_EMAIL_KEY);
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getAuthProfile() {
  return {
    userId: localStorage.getItem(USER_ID_KEY) ?? "",
    username: localStorage.getItem(USERNAME_KEY) ?? "",
    email: localStorage.getItem(USER_EMAIL_KEY) ?? "",
    role: localStorage.getItem(ROLE_KEY) ?? "",
  };
}

export function hasValidAuthSession() {
  const token = getAuthToken();
  if (!token) {
    return false;
  }

  const payload = parseJwtPayload(token);
  if (!payload?.exp) {
    return true;
  }

  const currentUnix = Math.floor(Date.now() / 1000);
  return payload.exp > currentUnix;
}
