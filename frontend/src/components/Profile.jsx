import React, { useEffect, useState } from "react";
import { getCurrentUser, uploadProfileImage } from "../lib/user";
import api from "../lib/api"; 

export default function Profile() {
  const [userProfile, setUserProfile] = useState(null);
  const [impactStats, setImpactStats] = useState({
    totalSubmissions: 0,
    totalWeight: "0kg",
    co2Reduced: "0kg",
    pointsEarned: 0,
  });
  const [loading, setLoading] = useState(true);

  const getInitials = (name) =>
    name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "";

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = await getCurrentUser();

    
        const profileImage = user.profile_image
          ? user.profile_image.startsWith("http")
            ? user.profile_image
            : api.defaults.baseURL + user.profile_image
          : null;

        setUserProfile({
          ...user,
          profile_image: profileImage,
        });

        setImpactStats((prev) => ({
          ...prev,
          pointsEarned: user.point_score || 0,
        }));
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await uploadProfileImage(formData);
      const fullImageUrl = res.image_url.startsWith("http")
        ? res.image_url
        : api.defaults.baseURL + res.image_url;

      setUserProfile((prev) => ({
        ...prev,
        profile_image: fullImageUrl,
      }));
    } catch (error) {
      console.error("Image upload failed:", error);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-600">
        Loading profile...
      </div>
    );

  if (!userProfile)
    return (
      <div className="flex justify-center items-center h-64 text-gray-600">
        Failed to load user profile.
      </div>
    );

  return (
    <div className="w-full max-w-4xl mx-auto p-8 bg-white text-black text-poppins">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[32px] font-semibold text-gray-700 mb-2">
          Profile Information
        </h1>
        <p className="text-gray-500 text-lg">Your account details and statistics</p>
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-start gap-6">
          <div className="relative w-24 h-24 bg-[#355E62] rounded-full flex items-center justify-center text-white text-2xl font-semibold flex-shrink-0 overflow-hidden">
            {userProfile.profile_image ? (
              <img
                src={userProfile.profile_image}
                alt={userProfile.user_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{getInitials(userProfile.user_name)}</span>
            )}
            <label className="absolute bottom-0 right-0 bg-gray-800 text-white text-xs rounded-full p-1 cursor-pointer hover:bg-[#355E62] transition">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              ✏️
            </label>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              {userProfile.user_name}
            </h2>

            <div className="space-y-2">
              <div className="flex items-center text-gray-600">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span className="text-sm">{userProfile.email}</span>
              </div>

              <div className="flex items-center text-gray-600">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm">
                  Member since {formatDate(userProfile.created_at)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Impact Summary</h3>
        <p className="text-gray-500 mb-6">Your contribution to the circular economy</p>
      </div>
      <div className="bg-[#F8FAF8] rounded-lg border border-gray-200 p-6">
        <div className="mb-4">
          <h4 className="text-lg font-medium text-gray-800 mb-2">Environmental Impact</h4>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600 leading-relaxed">
            By recycling <span className="font-medium text-[#355E62]">{impactStats.totalWeight}</span>, you've helped divert waste from landfills and contributed to reducing{" "}
            <span className="font-medium text-[#355E62]">{impactStats.co2Reduced}</span> CO₂ emissions in Kenya.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-[#355E62] mb-1">{impactStats.totalSubmissions}</div>
            <div className="text-xs text-gray-600 uppercase tracking-wide">Total Submissions</div>
          </div>

          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-[#355E62] mb-1">{impactStats.totalWeight}</div>
            <div className="text-xs text-gray-600 uppercase tracking-wide">Waste Recycled</div>
          </div>

          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-[#355E62] mb-1">{impactStats.co2Reduced}</div>
            <div className="text-xs text-gray-600 uppercase tracking-wide">CO₂ Reduced</div>
          </div>

          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-[#355E62] mb-1">{impactStats.pointsEarned}</div>
            <div className="text-xs text-gray-600 uppercase tracking-wide">Points Earned</div>
          </div>
        </div>
      </div>
      <div className="flex gap-4 mt-8">
        <button className="px-6 py-2 bg-[#355E62] text-white rounded-lg font-medium hover:bg-[#2a4a4e] transition-colors">Edit Profile</button>
        <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">Download Report</button>
      </div>
    </div>
  );
}
