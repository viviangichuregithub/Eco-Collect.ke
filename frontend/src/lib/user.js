// lib/user.js
import { api } from "./api";

/**
 * User-related API functions
 */
export const userApi = {
  login: (email, password) => api.post("login", { email, password }),
  register: ({ user_name, email, password, role }) =>
    api.post("register", { user_name, email, password, role }),
  logout: () => api.post("logout"),
  profile: () => api.get("profile"),
  requestPasswordReset: (email) => api.post("request-password-reset", { email }),
  resetPassword: (token, newPassword) =>
    api.post("reset-password", { token, new_password: newPassword }),
};
