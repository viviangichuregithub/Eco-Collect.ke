"use client";

import React, { useState, useEffect } from "react";
import api from "../lib/api"; // Axios instance with withCredentials: true
import { listCenters } from "../lib/centers";
import { useAuth } from "../context/AuthContext";

export default function UploadWaste() {
  const { user, loading: authLoading } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [aiClassification, setAiClassification] = useState(null);
  const [loadingText, setLoadingText] = useState("Analyzing...");
  const [collectionCenters, setCollectionCenters] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ weight: "", collectionCenter: "" });

  const loadingTexts = [
    "Analyzing...",
    "Powered by AI",
    "Green Energy",
    "Processing Image...",
    "Detecting Waste Type...",
  ];

  // Load collection centers
  useEffect(() => {
    const loadCenters = async () => {
      try {
        const centers = await listCenters();
        setCollectionCenters(centers || []);
      } catch {
        setError("Could not load collection centers.");
      }
    };
    loadCenters();
  }, []);

  // Handle file selection & AI preview
  const handleFileSelect = async (file) => {
    if (!file) return setError("No file selected");

    setSelectedFile(file);
    setShowLoadingModal(true);
    setError(null);

    let i = 0;
    const intervalId = setInterval(() => {
      i = (i + 1) % loadingTexts.length;
      setLoadingText(loadingTexts[i]);
    }, 1500);

    try {
      const previewFormData = new FormData();
      previewFormData.append("file", file);
      previewFormData.append("preview", "true"); // ✅ Only AI preview, no DB save

      const res = await api.post("/uploads/", previewFormData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      setAiClassification({
        category: res.data.upload?.category ?? "unknown",
        confidence: res.data.upload?.confidence ?? null,
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to analyze image. Try again.");
    } finally {
      clearInterval(intervalId);
      setShowLoadingModal(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      handleFileSelect(file);
    }
  };

  // Capture photo from camera
  const handleTakePhoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();

      setTimeout(() => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
          const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
          setPreviewUrl(URL.createObjectURL(file));
          handleFileSelect(file);
        });
        stream.getTracks().forEach((t) => t.stop());
      }, 1000);
    } catch {
      setError("Camera not available.");
    }
  };

  // Submit full form to backend (actual DB save)
  const handleSubmit = async () => {
    if (!selectedFile) return setError("Please select a file.");
    if (!formData.weight) return setError("Enter weight.");
    if (!formData.collectionCenter) return setError("Select collection center.");
    if (!user) return setError("You must be logged in to submit.");

    setIsSubmitting(true);
    setError(null);

    try {
      const data = new FormData();
      data.append("file", selectedFile);
      data.append("weight", formData.weight.toString());
      data.append("centre_id", formData.collectionCenter.toString());

      const res = await api.post("/uploads/", data, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("✅ Submission saved! Status: Not verified.");
      resetForm();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to submit. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAiClassification(null);
    setFormData({ weight: "", collectionCenter: "" });
    setError(null);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <p>Loading session...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <p>You must be logged in to access this page.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-8 bg-white text-black">
      {!showLoadingModal ? (
        <div className="max-w-2xl w-full p-8 rounded-xl shadow-md">
          <h1 className="text-3xl mb-4 font-semibold">Upload Waste Photo</h1>
          <p className="mb-8 text-gray-600">Take or upload a photo for AI-powered classification.</p>

          <div className="flex gap-4">
            <button
              onClick={handleTakePhoto}
              className="w-[200px] h-[40px] bg-[#ECF1E6] rounded-full hover:bg-[#d8e2cc]"
            >
              Take Photo
            </button>
            <label className="w-[200px] h-[40px] bg-[#ECF1E6] rounded-full hover:bg-[#d8e2cc] flex items-center justify-center cursor-pointer">
              Choose File
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {previewUrl && aiClassification && (
            <>
              <div className="mt-6 border rounded-lg p-4 flex flex-col items-center">
                <img src={previewUrl} alt="preview" className="w-48 h-48 object-cover rounded-lg mb-4" />
                <div className="w-full p-3 border border-gray-300 rounded-lg bg-[#F0F8F0] flex justify-between">
                  <div>
                    <div className="flex items-center mb-1">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm font-medium text-gray-800">{aiClassification.category}</span>
                    </div>
                    {aiClassification.confidence != null && (
                      <span className="text-xs text-gray-600">
                        Confidence: {(aiClassification.confidence * 100).toFixed(1)}%
                      </span>
                    )}
                  </div>
                  <span className="text-xs bg-[#355E62] text-white px-2 py-1 rounded-full">Not verified</span>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <input
                  type="number"
                  placeholder="Weight (kg)"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />

                <select
                  value={formData.collectionCenter}
                  onChange={(e) => setFormData({ ...formData, collectionCenter: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="">Select collection center</option>
                  {collectionCenters.map((center) => (
                    <option key={center.id} value={center.id}>
                      {center.name} - {center.location}
                    </option>
                  ))}
                </select>

                {error && <p className="text-red-600 text-sm">{error}</p>}

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !aiClassification}
                  className="w-full bg-[#355E62] text-white py-3 rounded-lg"
                >
                  {isSubmitting ? "Submitting..." : "Save Submission"}
                </button>

                <button onClick={resetForm} className="w-full bg-gray-300 text-gray-700 py-2 rounded-lg">
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="max-w-md w-full p-8 text-center rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-8">AI Analysis in Progress</h2>
          {previewUrl && (
            <div className="w-24 h-24 mx-auto mb-4 rounded-lg overflow-hidden border-2 border-gray-200">
              <img src={previewUrl} alt="Analyzing" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="text-lg text-[#355E62] font-medium animate-pulse">{loadingText}</div>
        </div>
      )}
    </div>
  );
}
