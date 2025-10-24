"use client"
import React, { useState, useEffect } from 'react'
import apiService from '../lib/api'

export default function History() {
  const [submissionHistory, setSubmissionHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    dateRange: 'all',
    sortBy: 'date_desc'
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  // Load submission history on component mount and when filters change
  useEffect(() => {
    loadSubmissionHistory()
  }, [filters, pagination.page])

  const loadSubmissionHistory = async () => {
    setLoading(true)
    setError(null)

    try {
      const queryFilters = {
        ...filters,
        status: filters.status !== 'all' ? filters.status : undefined,
        type: filters.type !== 'all' ? filters.type : undefined,
        date_range: filters.dateRange !== 'all' ? filters.dateRange : undefined,
        sort_by: filters.sortBy
      }

      const response = await apiService.getSubmissionHistory(
        pagination.page,
        pagination.limit,
        queryFilters
      )

      setSubmissionHistory(response.data || [])
      setPagination(prev => ({
        ...prev,
        total: response.total || 0,
        totalPages: Math.ceil((response.total || 0) / prev.limit)
      }))
    } catch (error) {
      console.error('Failed to load submission history:', error)
      setError('Failed to load submission history. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }))
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page
  }

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const viewSubmissionDetails = async (submissionId) => {
    try {
      const details = await apiService.getSubmissionById(submissionId)
      setSelectedSubmission(details)
      setShowDetails(true)
    } catch (error) {
      console.error('Failed to load submission details:', error)
      setError('Failed to load submission details')
    }
  }

  const refreshHistory = () => {
    loadSubmissionHistory()
  }

  // Mock data for development - remove when API is ready
  const mockSubmissions = [
    {
      id: 1,
      photo: "/api/placeholder/80/60", // Placeholder for plastic waste image
      type: "Plastic",
      center: "Coca-Cola Kilimani Hub",
      weight: "2.5 kg",
      status: "Pending",
      points: 0,
      date: "14 Oct 2025"
    },
    {
      id: 2, 
      photo: "/api/placeholder/80/60", // Placeholder for glass waste image
      type: "Glass",
      center: "Coca-Cola Kilimani Hub", 
      weight: "1.2 kg",
      status: "Pending",
      points: 0,
      date: "13 Oct 2025"
    },
    {
      id: 3,
      photo: "/api/placeholder/80/60", // Placeholder for metal waste image
      type: "Metal",
      center: "Coca-Cola Kilimani Hub",
      weight: "0.3 kg", 
      status: "Verified",
      points: 40,
      date: "11 Oct 2025"
    },
    {
      id: 4,
      photo: "/api/placeholder/80/60", // Placeholder for wood/paper waste image
      type: "Wood/Paper",
      center: "Coca-Cola Kilimani Hub",
      weight: "0.5 kg",
      status: "Verified", 
      points: 10,
      date: "10 Oct 2025"
    }
  ]

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium"
    
    switch (status?.toLowerCase()) {
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case "verified":
        return `${baseClasses} bg-green-100 text-green-800`
      case "rejected":
        return `${baseClasses} bg-red-100 text-red-800`
      case "processing":
        return `${baseClasses} bg-blue-100 text-blue-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "plastic": return "bg-blue-100 text-blue-600"
      case "glass": return "bg-green-100 text-green-600"
      case "metal": return "bg-gray-100 text-gray-600"
      case "electronic": return "bg-purple-100 text-purple-600"
      case "paper": case "wood/paper": return "bg-amber-100 text-amber-600"
      default: return "bg-gray-100 text-gray-600"
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const calculateTotalStats = () => {
    const totalWeight = submissionHistory.reduce((sum, item) => 
      sum + (parseFloat(item.weight) || 0), 0
    )
    const totalPoints = submissionHistory.reduce((sum, item) => 
      sum + (item.points || 0), 0
    )
    const verifiedCount = submissionHistory.filter(item => 
      item.status?.toLowerCase() === 'verified'
    ).length

    return { totalWeight, totalPoints, verifiedCount }
  }

  if (loading) {
    return (
      <div className='w-full max-w-7xl mx-auto p-8 bg-white text-black text-poppins'>
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#355E62]'></div>
          <span className='ml-3 text-gray-600'>Loading submission history...</span>
        </div>
      </div>
    )
  }

  const stats = calculateTotalStats()

  return (
    <div className='w-full max-w-7xl mx-auto p-8 bg-white text-black text-poppins'>
      {/* Header Section */}
      <div className='mb-8'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-[32px] font-semibold text-gray-700 mb-2'>Waste Submissions</h1>
            <p className='text-gray-500 text-lg'>Track your drop requests and verification status</p>
          </div>
          <button 
            onClick={refreshHistory}
            className='px-4 py-2 bg-[#355E62] text-white rounded-lg hover:bg-[#2a4a4e] transition-colors'>
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
        <div className='bg-[#ECF1E6] rounded-lg p-4'>
          <div className='text-2xl font-bold text-[#355E62]'>{stats.totalWeight.toFixed(1)}kg</div>
          <div className='text-sm text-gray-600'>Total Waste Recycled</div>
        </div>
        <div className='bg-[#ECF1E6] rounded-lg p-4'>
          <div className='text-2xl font-bold text-[#355E62]'>{stats.totalPoints}</div>
          <div className='text-sm text-gray-600'>Points Earned</div>
        </div>
        <div className='bg-[#ECF1E6] rounded-lg p-4'>
          <div className='text-2xl font-bold text-[#355E62]'>{stats.verifiedCount}</div>
          <div className='text-sm text-gray-600'>Verified Submissions</div>
        </div>
      </div>

      {/* Filters */}
      <div className='bg-gray-50 rounded-lg p-4 mb-6'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Status</label>
            <select 
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className='w-full p-2 border border-gray-300 rounded-md text-sm'>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
              <option value="processing">Processing</option>
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Type</label>
            <select 
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className='w-full p-2 border border-gray-300 rounded-md text-sm'>
              <option value="all">All Types</option>
              <option value="plastic">Plastic</option>
              <option value="glass">Glass</option>
              <option value="metal">Metal</option>
              <option value="electronic">Electronic</option>
              <option value="paper">Paper/Cardboard</option>
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Date Range</label>
            <select 
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className='w-full p-2 border border-gray-300 rounded-md text-sm'>
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">Last 3 Months</option>
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Sort By</label>
            <select 
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className='w-full p-2 border border-gray-300 rounded-md text-sm'>
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="weight_desc">Highest Weight</option>
              <option value="points_desc">Most Points</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg'>
          <div className='flex items-center'>
            <svg className='w-5 h-5 text-red-500 mr-2' fill='currentColor' viewBox='0 0 20 20'>
              <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' />
            </svg>
            <span className='text-red-700 text-sm'>{error}</span>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className='bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200'>
        {/* Table Header */}
        <div className='bg-[#355E62] text-white'>
          <div className='grid grid-cols-8 gap-4 px-6 py-4 text-sm font-medium'>
            <div>Photo</div>
            <div>Type</div>
            <div>Center</div>
            <div>Weight</div>
            <div>Status</div>
            <div>Points</div>
            <div>Date</div>
            <div>Actions</div>
          </div>
        </div>

        {/* Table Body */}
        <div className='divide-y divide-gray-200'>
          {submissionHistory.length === 0 ? (
            <div className='text-center py-12'>
              <div className='text-gray-400 text-lg mb-2'>No submissions found</div>
              <div className='text-gray-500 text-sm'>
                {Object.values(filters).some(f => f !== 'all' && f !== 'date_desc') 
                  ? 'Try adjusting your filters' 
                  : 'Your waste submission history will appear here'}
              </div>
            </div>
          ) : (
            submissionHistory.map((submission, index) => (
              <div 
                key={submission.id}
                className={`grid grid-cols-8 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors cursor-pointer ${
                  index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                }`}
                onClick={() => viewSubmissionDetails(submission.id)}
              >
              {/* Photo */}
              <div className='flex items-center'>
                <div className='w-16 h-12 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center'>
                  {submission.type === 'Plastic' && (
                    <div className='w-full h-full bg-blue-100 flex items-center justify-center'>
                      <span className='text-xs text-blue-600'>Plastic</span>
                    </div>
                  )}
                  {submission.type === 'Glass' && (
                    <div className='w-full h-full bg-green-100 flex items-center justify-center'>
                      <span className='text-xs text-green-600'>Glass</span>
                    </div>
                  )}
                  {submission.type === 'Metal' && (
                    <div className='w-full h-full bg-gray-100 flex items-center justify-center'>
                      <span className='text-xs text-gray-600'>Metal</span>
                    </div>
                  )}
                  {submission.type === 'Wood/Paper' && (
                    <div className='w-full h-full bg-amber-100 flex items-center justify-center'>
                      <span className='text-xs text-amber-600'>Paper</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Type */}
              <div className='text-sm text-gray-800'>
                {submission.type}
              </div>

              {/* Center */}
              <div className='text-sm text-gray-600'>
                {submission.center}
              </div>

              {/* Weight */}
              <div className='text-sm text-gray-800'>
                {submission.weight}
              </div>

              {/* Status */}
              <div>
                <span className={getStatusBadge(submission.status)}>
                  {submission.status}
                </span>
              </div>

              {/* Points */}
              <div className='text-sm font-medium text-gray-800'>
                {submission.points > 0 ? `+${submission.points}` : submission.points}
              </div>

              {/* Date */}
              <div className='text-sm text-gray-600'>
                {formatDate(submission.created_at || submission.date)}
              </div>

              {/* Actions */}
              <div className='flex items-center space-x-2'>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    viewSubmissionDetails(submission.id)
                  }}
                  className='text-xs bg-[#355E62] text-white px-2 py-1 rounded hover:bg-[#2a4a4e]'>
                  View
                </button>
                {submission.status?.toLowerCase() === 'pending' && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      // Add edit functionality if needed
                    }}
                    className='text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600'>
                    Edit
                  </button>
                )}
              </div>
            </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className='flex items-center justify-between mt-6'>
          <div className='text-sm text-gray-600'>
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} submissions
          </div>
          <div className='flex items-center space-x-2'>
            <button 
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className='px-3 py-1 bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300'>
              Previous
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded ${
                  page === pagination.page 
                    ? 'bg-[#355E62] text-white' 
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}>
                {page}
              </button>
            ))}
            <button 
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className='px-3 py-1 bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300'>
              Next
            </button>
          </div>
        </div>
      )}

      {/* Submission Details Modal */}
      {showDetails && selectedSubmission && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-md w-full mx-4'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold'>Submission Details</h3>
              <button 
                onClick={() => setShowDetails(false)}
                className='text-gray-400 hover:text-gray-600'>
                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                </svg>
              </button>
            </div>
            
            <div className='space-y-4'>
              <div>
                <label className='font-medium text-gray-700'>Type:</label>
                <p>{selectedSubmission.type}</p>
              </div>
              <div>
                <label className='font-medium text-gray-700'>Weight:</label>
                <p>{selectedSubmission.weight}</p>
              </div>
              <div>
                <label className='font-medium text-gray-700'>Status:</label>
                <span className={getStatusBadge(selectedSubmission.status)}>
                  {selectedSubmission.status}
                </span>
              </div>
              <div>
                <label className='font-medium text-gray-700'>Collection Center:</label>
                <p>{selectedSubmission.center || selectedSubmission.collection_center?.name}</p>
              </div>
              <div>
                <label className='font-medium text-gray-700'>Points Earned:</label>
                <p>{selectedSubmission.points || 0}</p>
              </div>
              {selectedSubmission.notes && (
                <div>
                  <label className='font-medium text-gray-700'>Notes:</label>
                  <p>{selectedSubmission.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
