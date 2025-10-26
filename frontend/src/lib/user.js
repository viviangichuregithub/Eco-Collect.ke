import api from "./api"

// -------------------------------
// AUTH HELPERS
// -------------------------------

export const forgotPassword = async (email) => {
  const res = await api.post("/auth/forgot-password", { email })
  return res.data
}

export const resetPassword = async (token, newPassword) => {
  const res = await api.post(`/auth/reset-password/${token}`, {
    new_password: newPassword,
  })
  return res.data
}

// -------------------------------
// PROFILE FUNCTIONS
// -------------------------------

export const getCurrentUser = async () => {
  const res = await api.get("/profile/me")
  return res.data
}

export const updateProfile = async (data) => {
  const res = await api.put("/profile/update", data)
  return res.data
}

// ✅ Upload profile image (matches Flask backend route /profile/upload-avatar)
export const uploadProfileImage = async (file) => {
  const formData = new FormData()
  formData.append("image", file)

  try {
    const res = await api.post("/profile/upload-avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return res.data
  } catch (err) {
    console.error("Failed to upload avatar:", err)
    throw err
  }
}

// ✅ Alias for backward compatibility
export const uploadUserAvatar = uploadProfileImage

// Get user points
export const getUserPoints = async () => {
  const res = await api.get("/profile/me")
  return res.data.points || 0
}

// ✅ Download user report (PDF)
export const downloadUserReport = async () => {
  try {
    const res = await api.get("/profile/report", { responseType: "blob" })

    const contentDisposition = res.headers["content-disposition"]
    const fileNameMatch = contentDisposition?.match(/filename="(.+)"/)
    const fileName = fileNameMatch ? fileNameMatch[1] : "eco_collect_report.pdf"

    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (error) {
    console.error("Error downloading report:", error)
    alert("Failed to download report")
  }
}

// -------------------------------
// LOGOUT
// -------------------------------
export const logout = async () => {
  try {
    await api.post("/auth/logout")
    localStorage.removeItem("token")
    window.location.href = "/auth"
  } catch (err) {
    console.error("Logout failed:", err)
    throw err
  }
}
