import React from 'react'

export default function History() {
  const submissionHistory = [
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
    
    if (status === "Pending") {
      return `${baseClasses} bg-red-100 text-red-800`
    } else if (status === "Verified") {
      return `${baseClasses} bg-teal-100 text-teal-800`
    }
    return baseClasses
  }

  return (
    <div className='w-full max-w-7xl mx-auto p-8 bg-white text-black text-poppins'>
      {/* Header Section */}
      <div className='mb-8'>
        <h1 className='text-[32px] font-semibold text-gray-700 mb-2'>Waste Submissions</h1>
        <p className='text-gray-500 text-lg'>Track your drop requests and verification status</p>
      </div>

      {/* Table Container */}
      <div className='bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200'>
        {/* Table Header */}
        <div className='bg-[#355E62] text-white'>
          <div className='grid grid-cols-7 gap-4 px-6 py-4 text-sm font-medium'>
            <div>Photo</div>
            <div>Type</div>
            <div>Center</div>
            <div>Weight</div>
            <div>Status</div>
            <div>Points</div>
            <div>Date</div>
          </div>
        </div>

        {/* Table Body */}
        <div className='divide-y divide-gray-200'>
          {submissionHistory.map((submission, index) => (
            <div 
              key={submission.id}
              className={`grid grid-cols-7 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors ${
                index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
              }`}
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
                {submission.date}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State (if no submissions) */}
      {submissionHistory.length === 0 && (
        <div className='text-center py-12'>
          <div className='text-gray-400 text-lg mb-2'>No submissions yet</div>
          <div className='text-gray-500 text-sm'>Your waste submission history will appear here</div>
        </div>
      )}
    </div>
  )
}
