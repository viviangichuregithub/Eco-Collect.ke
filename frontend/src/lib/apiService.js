import api from "./api";

// ----------------------------------------
// 📸 Upload Waste Photo (user submission)
// ----------------------------------------
const uploadWastePhoto = async ({ file, weight, centre_id, formData }) => {
  if (!file && !formData) throw new Error("No file provided");

  try {
    let payload;

    if (formData) {
      payload = formData;
    } else {
      payload = new FormData();
      payload.append("file", file);
      if (weight != null) payload.append("weight", parseFloat(weight));
      if (centre_id != null) payload.append("centre_id", parseInt(centre_id, 10));
    }

    const res = await api.post("/uploads/", payload, {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data.upload || {};
  } catch (error) {
    console.error("Upload error:", error);
    throw new Error(
      error.response?.data?.error || error.message || "Failed to upload image"
    );
  }
};

// ----------------------------------------
// 🧍 Get uploads for logged-in user
// ----------------------------------------
const getUploadHistory = async () => {
  try {
    const res = await api.get("/uploads/", { withCredentials: true });
    return res.data.uploads || [];
  } catch (error) {
    console.error("Failed to fetch upload history:", error);
    throw new Error(
      error.response?.data?.error || error.message || "Failed to fetch upload history"
    );
  }
};

// ----------------------------------------
// 🏢 Get all uploads (Corporate)
// ----------------------------------------
const getAllUploads = async () => {
  try {
    // Note: /uploads/all matches Flask blueprint url_prefix
    const res = await api.get("/uploads/all", { withCredentials: true });
    return res.data.uploads || [];
  } catch (error) {
    console.error("Failed to fetch all uploads:", error);
    throw new Error(
      error.response?.data?.error || error.message || "Failed to fetch all uploads"
    );
  }
};

// ----------------------------------------
// ✅ Verify an upload (Corporate only)
// ----------------------------------------
const approveUpload = async (uploadId) => {
  try {
    const res = await api.patch(`/uploads/approve/${uploadId}`, null, {
      withCredentials: true,
    });
    return res.data.upload;
  } catch (error) {
    console.error("Failed to approve upload:", error);
    throw new Error(
      error.response?.data?.error || error.message || "Failed to approve upload"
    );
  }
};

// ----------------------------------------
// 🏢 Get list of recycling centres
// ----------------------------------------
const getCenters = async () => {
  try {
    const res = await api.get("/uploads/centres", { withCredentials: true });
    return res.data || [];
  } catch (error) {
    console.error("Failed to fetch centres:", error);
    return [];
  }
};

// ----------------------------------------
// 🚀 Export API service
// ----------------------------------------
const apiService = {
  uploadWastePhoto,
  getUploadHistory,
  getAllUploads,
  approveUpload,
  getCenters,
};

export default apiService;
