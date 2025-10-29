"use client";

import React, { useState, useEffect } from "react";
import apiService from "../lib/apiService";

export default function CorporateVerification() {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Fetch all uploads for corporate
  const fetchUploads = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAllUploads(); // ✅ now correct
      setUploads(data || []);
    } catch (error) {
      console.error("Failed to fetch uploads:", error);
      alert(error.message || "Failed to fetch uploads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  // --- Approve Upload ---
  const approve = async (id) => {
    try {
      await apiService.approveUpload(id);

      // Update local state
      setUploads((prev) =>
        prev.map((u) => (u.id === id ? { ...u, not_verified: false } : u))
      );
    } catch (error) {
      alert(error.message || "Failed to verify upload");
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-8 bg-white text-black min-h-screen">
      <h1 className="text-3xl font-bold text-[#355E62] mb-6">Corporate Verification</h1>

      {loading ? (
        <p className="text-gray-500">Loading uploads...</p>
      ) : uploads.length === 0 ? (
        <p className="text-gray-500">No uploads found.</p>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {uploads.map((u) => (
            <div
              key={u.id}
              className={`border rounded-xl p-4 shadow-sm transition-all duration-300 ${
                u.not_verified ? "bg-[#ECF1E6]" : "bg-gray-100 opacity-75"
              }`}
            >
              <p className="text-sm text-gray-600 mb-1"><b>User:</b> {u.user_name}</p>
              <p className="text-sm text-gray-600 mb-1"><b>Category:</b> {u.category || "Unknown"}</p>
              <p className="text-sm text-gray-600 mb-1"><b>Weight:</b> {u.weight ?? "-"} g</p>
              <p className="text-sm text-gray-600 mb-1"><b>Points:</b> {u.points_awarded ?? 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                Uploaded: {new Date(u.upload_date).toLocaleString()}
              </p>

              {u.not_verified ? (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => approve(u.id)}
                    className="bg-[#355E62] text-white px-4 py-2 text-sm rounded-full hover:bg-[#2a4c4f]"
                  >
                    Verify
                  </button>
                </div>
              ) : (
                <p className="text-xs text-green-700 mt-4 font-medium text-center">
                  ✅ Verified
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
