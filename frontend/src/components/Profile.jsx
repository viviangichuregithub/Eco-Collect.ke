"use client"
import React, { useState, useEffect } from 'react'
import apiService from '../lib/api'

export default function Profile() {
  const [userProfile, setUserProfile] = useState(null)
  const [impactStats, setImpactStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editFormData, setEditFormData] = useState({})
  const [isUpdating, setIsUpdating] = useState(false)
  const [achievements, setAchievements] = useState([])
  const [pointsHistory, setPointsHistory] = useState([])
  const [showPointsHistory, setShowPointsHistory] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    location: ''
  })
  const [editLoading, setEditLoading] = useState(false)
  const [downloadingReport, setDownloadingReport] = useState(false)

  useEffect(() => {
    loadUserProfile()
    loadUserStats()
    loadAchievements()
  }, [])

  // Populate edit form when user profile loads
  useEffect(() => {
    if (userProfile) {
      setEditForm({
        name: userProfile.name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        location: userProfile.location || ''
      })
    }
  }, [userProfile])

  const loadUserProfile = async () => {
    try {
      const profile = await apiService.getUserProfile()
      setUserProfile(profile)
      setEditFormData({
        name: profile.name,
        email: profile.email,
        phone: profile.phone || '',
        location: profile.location || '',
        bio: profile.bio || ''
      })
    } catch (error) {
      console.error('Failed to load user profile:', error)
      setError('Failed to load profile data')
      // Fallback to mock data
      setUserProfile({
        id: 1,
        name: "Vivian Gichure",
        email: "vivian@gmail.com",
        phone: "+254 712 345 678",
        location: "Nairobi, Kenya",
        memberSince: "September 2025",
        avatar: null,
        bio: "Environmental enthusiast passionate about waste recycling and sustainability."
      })
    }
  }

  const loadUserStats = async () => {
    try {
      const stats = await apiService.getUserStats()
      setImpactStats(stats)
    } catch (error) {
      console.error('Failed to load user stats:', error)
      // Fallback to mock data
      setImpactStats({
        totalSubmissions: 4,
        totalWeight: 4.5,
        co2Reduced: 2.1,
        pointsEarned: 250,
        pointsAvailable: 250,
        rank: "Eco Warrior",
        weeklyGoal: 10,
        weeklyProgress: 7,
        monthlyGoal: 40,
        monthlyProgress: 28
      })
    } finally {
      setLoading(false)
    }
  }

  const loadAchievements = async () => {
    try {
      const achievementsData = await apiService.getPointsHistory()
      setAchievements(achievementsData.achievements || [])
      setPointsHistory(achievementsData.history || [])
    } catch (error) {
      console.error('Failed to load achievements:', error)
      // Fallback to mock data
      setAchievements([
        { id: 1, title: "First Submission", description: "Made your first waste submission", earned: true, date: "2025-09-15" },
        { id: 2, title: "Plastic Warrior", description: "Submitted 10kg of plastic waste", earned: true, date: "2025-10-10" },
        { id: 3, title: "Eco Champion", description: "Reach 100 points", earned: false, progress: 50 },
        { id: 4, title: "Weekly Goal", description: "Complete weekly recycling goal", earned: true, date: "2025-10-20" }
      ])
    }
  }

  const handleEditProfile = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditFormData({
      name: userProfile.name,
      email: userProfile.email,
      phone: userProfile.phone || '',
      location: userProfile.location || '',
      bio: userProfile.bio || ''
    })
  }

  const handleUpdateProfile = async () => {
    setIsUpdating(true)
    setError(null)

    try {
      const updatedProfile = await apiService.updateUserProfile(editFormData)
      setUserProfile(updatedProfile)
      setIsEditing(false)
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Failed to update profile:', error)
      setError('Failed to update profile. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleInputChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const downloadReport = async () => {
    try {
      // In real implementation, this would generate and download a PDF report
      const reportData = {
        profile: userProfile,
        stats: impactStats,
        achievements: achievements.filter(a => a.earned)
      }
      
      console.log('Generating report:', reportData)
      alert('Report download feature will be implemented with backend integration')
    } catch (error) {
      console.error('Failed to generate report:', error)
      setError('Failed to generate report')
    }
  }

  const getProgressPercentage = (current, goal) => {
    return Math.min((current / goal) * 100, 100)
  }

  const handleDownloadReport = async () => {
    setDownloadingReport(true)
    try {
      await downloadReport()
    } finally {
      setDownloadingReport(false)
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setEditLoading(true)
    try {
      await apiService.updateUserProfile(editForm)
      setUserProfile(prev => ({ ...prev, ...editForm }))
      setShowEditModal(false)
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Failed to update profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setEditLoading(false)
    }
  }

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setEditForm(prev => ({ ...prev, avatar: e.target.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
  }

  if (loading) {
    return (
      <div className='w-full max-w-4xl mx-auto p-8 bg-white text-black text-poppins'>
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#355E62]'></div>
          <span className='ml-3 text-gray-600'>Loading profile...</span>
        </div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className='w-full max-w-4xl mx-auto p-8 bg-white text-black text-poppins'>
        <div className='text-center py-12'>
          <div className='text-gray-400 text-lg mb-2'>Unable to load profile</div>
          <button 
            onClick={loadUserProfile}
            className='px-4 py-2 bg-[#355E62] text-white rounded-lg hover:bg-[#2a4a4e]'>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full max-w-6xl mx-auto p-8 bg-white text-black text-poppins'>
      {/* Header Section */}
      <div className='mb-8'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-[32px] font-semibold text-gray-700 mb-2'>Profile Information</h1>
            <p className='text-gray-500 text-lg'>Your account details and statistics</p>
          </div>
          <div className='flex gap-2'>
            <button 
              onClick={() => setShowPointsHistory(!showPointsHistory)}
              className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors'>
              Points History
            </button>
            <button 
              onClick={downloadReport}
              className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors'>
              Download Report
            </button>
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

      {/* Profile Card */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8'>
        <div className='flex items-start gap-6'>
          {/* Avatar */}
          <div className='w-24 h-24 bg-[#355E62] rounded-full flex items-center justify-center text-white text-2xl font-semibold flex-shrink-0'>
            {userProfile.avatar ? (
              <img 
                src={userProfile.avatar} 
                alt={userProfile.name}
                className='w-full h-full rounded-full object-cover'
              />
            ) : (
              <span>{getInitials(userProfile.name)}</span>
            )}
          </div>

          {/* Profile Details */}
          <div className='flex-1'>
            <h2 className='text-2xl font-semibold text-gray-800 mb-2'>{userProfile.name}</h2>
            
            <div className='space-y-2'>
              <div className='flex items-center text-gray-600'>
                <svg className='w-4 h-4 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                  <path d='M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z' />
                  <path d='M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z' />
                </svg>
                <span className='text-sm'>{userProfile.email}</span>
              </div>
              
              <div className='flex items-center text-gray-600'>
                <svg className='w-4 h-4 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z' clipRule='evenodd' />
                </svg>
                <span className='text-sm'>Member since {userProfile.memberSince}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Summary */}
      <div className='mb-6'>
        <h3 className='text-xl font-semibold text-gray-800 mb-4'>Impact Summary</h3>
        <p className='text-gray-500 mb-6'>Your contribution to the circular economy</p>
      </div>

      {/* Environmental Impact Card */}
      <div className='bg-[#F8FAF8] rounded-lg border border-gray-200 p-6'>
        <div className='mb-4'>
          <h4 className='text-lg font-medium text-gray-800 mb-2'>Environmental Impact</h4>
        </div>
        
        <div className='bg-white rounded-lg p-4 shadow-sm'>
          <p className='text-sm text-gray-600 leading-relaxed'>
            By recycling <span className='font-medium text-[#355E62]'>{impactStats.totalWeight}</span>, you've helped divert waste from landfills and contributed to reducing <span className='font-medium text-[#355E62]'>{impactStats.co2Reduced}</span> CO₂ emissions in Kenya.
          </p>
        </div>

        {/* Statistics Grid */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-6'>
          <div className='text-center p-4 bg-white rounded-lg shadow-sm'>
            <div className='text-2xl font-bold text-[#355E62] mb-1'>{impactStats.totalSubmissions}</div>
            <div className='text-xs text-gray-600 uppercase tracking-wide'>Total Submissions</div>
          </div>
          
          <div className='text-center p-4 bg-white rounded-lg shadow-sm'>
            <div className='text-2xl font-bold text-[#355E62] mb-1'>{impactStats.totalWeight}</div>
            <div className='text-xs text-gray-600 uppercase tracking-wide'>Waste Recycled</div>
          </div>
          
          <div className='text-center p-4 bg-white rounded-lg shadow-sm'>
            <div className='text-2xl font-bold text-[#355E62] mb-1'>{impactStats.co2Reduced}</div>
            <div className='text-xs text-gray-600 uppercase tracking-wide'>CO₂ Reduced</div>
          </div>
          
          <div className='text-center p-4 bg-white rounded-lg shadow-sm'>
            <div className='text-2xl font-bold text-[#355E62] mb-1'>{impactStats.pointsEarned}</div>
            <div className='text-xs text-gray-600 uppercase tracking-wide'>Points Earned</div>
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className='mt-8'>
        <h3 className='text-xl font-semibold text-gray-800 mb-4'>Achievements</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {achievements.map((achievement, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border-2 transition-all ${
                achievement.unlocked 
                  ? 'bg-[#355E62] border-[#355E62] text-white shadow-lg' 
                  : 'bg-gray-50 border-gray-200 text-gray-500'
              }`}
            >
              <div className='text-2xl mb-2'>{achievement.icon}</div>
              <h4 className='font-semibold text-sm mb-1'>{achievement.title}</h4>
              <p className='text-xs opacity-90'>{achievement.description}</p>
              {achievement.unlocked && (
                <div className='text-xs mt-2 opacity-75'>
                  Earned {achievement.earnedDate}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className='flex gap-4 mt-8'>
        <button 
          onClick={() => setShowEditModal(true)}
          className='px-6 py-2 bg-[#355E62] text-white rounded-lg font-medium hover:bg-[#2a4a4e] transition-colors'
        >
          Edit Profile
        </button>
        <button 
          onClick={handleDownloadReport}
          disabled={downloadingReport}
          className='px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50'
        >
          {downloadingReport ? 'Generating...' : 'Download Report'}
        </button>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto'>
            <div className='flex justify-between items-center mb-6'>
              <h3 className='text-xl font-semibold text-gray-800'>Edit Profile</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className='text-gray-400 hover:text-gray-600'
              >
                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Full Name
                </label>
                <input
                  type='text'
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#355E62]'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Email
                </label>
                <input
                  type='email'
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#355E62]'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Phone Number
                </label>
                <input
                  type='tel'
                  value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#355E62]'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Location
                </label>
                <input
                  type='text'
                  value={editForm.location}
                  onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#355E62]'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Profile Picture
                </label>
                <input
                  type='file'
                  accept='image/*'
                  onChange={handleAvatarUpload}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#355E62]'
                />
              </div>

              <div className='flex gap-3 pt-4'>
                <button
                  type='submit'
                  disabled={editLoading}
                  className='flex-1 px-4 py-2 bg-[#355E62] text-white rounded-lg font-medium hover:bg-[#2a4a4e] transition-colors disabled:opacity-50'
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type='button'
                  onClick={() => setShowEditModal(false)}
                  className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors'
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}