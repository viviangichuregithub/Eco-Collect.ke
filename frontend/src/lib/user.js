import api from "./api";

export const forgotPassword = async (email) => {
  const res = await api.post("/auth/forgot-password", { email });
  return res.data;
};

export const resetPassword = async (token, newPassword) => {
  const res = await api.post(`/auth/reset-password/${token}`, { new_password: newPassword });
  return res.data;
};

export const updateProfile = async (data) => {
  const res = await api.post("/user/update", data);
  return res.data;
};

export const getCurrentUser = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};

export const uploadProfileImage = async (formData) => {
  const res = await api.post("/auth/user/upload-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};


export const getUserPoints = async () => {
  const res = await api.get("/auth/me");
  return res.data.point_score;
};
