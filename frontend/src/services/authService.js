import { httpClient } from "./httpClient";

function normalizeAuthResponse(payload) {
  if (payload?.data) {
    return normalizeAuthResponse(payload.data);
  }

  return {
    token: payload?.token ?? "",
    userId: payload?.userId ?? payload?.id ?? "",
    username: payload?.username ?? "",
    email: payload?.email ?? "",
    role: payload?.role ?? "SHIPPER",
  };
}

function getErrorMessage(error, fallbackMessage) {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.response?.status === 401) {
    return "Invalid username or password.";
  }

  return fallbackMessage;
}

export async function loginUser({ username, password }) {
  try {
    const response = await httpClient.post("/auth/login", { username, password });
    const auth = normalizeAuthResponse(response.data);

    if (!auth.token) {
      throw new Error("Server did not return an authentication token.");
    }

    return auth;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Login failed. Please try again."));
  }
}

export async function registerUser({ username, email, password, role }) {
  try {
    const response = await httpClient.post("/auth/register", {
      username,
      email,
      password,
      role,
    });
    const auth = normalizeAuthResponse(response.data);

    if (!auth.token) {
      throw new Error("Registration completed but no token was returned.");
    }

    return auth;
  } catch (error) {
    throw new Error(getErrorMessage(error, "Registration failed. Please try again."));
  }
}
