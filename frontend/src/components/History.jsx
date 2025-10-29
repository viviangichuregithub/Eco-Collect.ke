"use client";

import React, { useState, useEffect } from "react";
import api from "../lib/api";

export default function History() {
  const [submissionHistory, setSubmissionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: "all",
    type: "all",
    sortBy: "date_desc",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    loadSubmissionHistory();
  }, [filters, pagination.page]);

  const loadSubmissionHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/uploads/", { withCredentials: true });
      const data = res.data.uploads || [];

      const mapped = data
        .filter(u =>
          filters.status !== "all"
            ? filters.status === "pending"
              ? u.not_verified
              : !u.not_verified
            : true
        )
        .filter(u => (filters.type !== "all" ? u.category === filters.type : true))
        .map(u => ({
          id: u.id,
          type: u.category || "Unknown",
          center: u.centre_id || "Not assigned",
          weight: parseFloat(u.weight) || 0,
          status: u.not_verified ? "Pending" : "Verified",
          points: !u.not_verified ? u.points_awarded || 0 : 0,
          date: u.upload_date,
          not_verified: u.not_verified,
        }));

      setSubmissionHistory(mapped);
      setPagination(prev => ({
        ...prev,
        total: mapped.length,
        totalPages: Math.ceil(mapped.length / prev.limit),
      }));
    } catch (err) {
      console.error(err);
      setError("Failed to load submission history.");
    } finally {
      setLoading(false);
    }
  };

  const refreshHistory = () => loadSubmissionHistory();

  const getStatusBadge = status => {
    const base = "px-3 py-1 rounded-full text-xs font-medium";
    switch (status.toLowerCase()) {
      case "pending":
        return `${base} bg-yellow-100 text-yellow-800`;
      case "verified":
        return `${base} bg-green-100 text-green-800`;
      default:
        return `${base} bg-gray-100 text-gray-800`;
    }
  };

  const formatDate = dateString =>
    dateString
      ? new Date(dateString).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "-";

  const calculateTotalStats = () => {
    const verified = submissionHistory.filter(item => !item.not_verified);
    const totalWeight = verified.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0);
    const totalPoints = verified.reduce((sum, item) => sum + (item.points || 0), 0);
    const verifiedCount = verified.length;
    return { totalWeight, totalPoints, verifiedCount };
  };

  if (loading)
    return (
      <div className="w-full max-w-7xl mx-auto p-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#355E62]"></div>
        <span className="ml-3 text-gray-600">Loading submission history...</span>
      </div>
    );

  const stats = calculateTotalStats();

  return (
    <div className="w-full max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Waste Submissions</h1>
          <p className="text-gray-500 text-sm">
            Track your drop requests and verification status
          </p>
        </div>
        <button
          onClick={refreshHistory}
          className="px-4 py-2 bg-[#355E62] text-white rounded-lg hover:bg-[#2a4a4e] transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#ECF1E6] rounded-lg p-4">
          <div className="text-2xl font-bold text-[#355E62]">{stats.totalWeight.toFixed(1)}kg</div>
          <div className="text-sm text-gray-600">Total Waste Recycled</div>
        </div>
        <div className="bg-[#ECF1E6] rounded-lg p-4">
          <div className="text-2xl font-bold text-[#355E62]">{stats.totalPoints}</div>
          <div className="text-sm text-gray-600">Points Earned</div>
        </div>
        <div className="bg-[#ECF1E6] rounded-lg p-4">
          <div className="text-2xl font-bold text-[#355E62]">{stats.verifiedCount}</div>
          <div className="text-sm text-gray-600">Verified Submissions</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <div className="bg-[#355E62] text-white grid grid-cols-6 px-6 py-4 text-sm font-medium">
          <div>Type</div>
          <div>Center</div>
          <div>Weight</div>
          <div>Status</div>
          <div>Points</div>
          <div>Date</div>
        </div>
        <div className="divide-y divide-gray-200">
          {submissionHistory.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No submissions found
            </div>
          ) : (
            submissionHistory.map((submission, i) => (
              <div
                key={submission.id}
                className={`grid grid-cols-6 gap-4 px-6 py-4 items-center ${
                  i % 2 === 0 ? "bg-gray-50" : "bg-white"
                }`}
              >
                <div className="text-sm text-gray-800">{submission.type}</div>
                <div className="text-sm text-gray-600">{submission.center}</div>
                <div className="text-sm text-gray-800">{submission.weight}</div>
                <div>
                  <span className={getStatusBadge(submission.status)}>
                    {submission.status}
                  </span>
                </div>
                <div className="text-sm font-medium">{submission.points}</div>
                <div className="text-sm text-gray-600">{formatDate(submission.date)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
