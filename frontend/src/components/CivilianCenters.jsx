"use client"
import React, { useState, useEffect } from 'react'
import apiService from '../lib/api'

export default function CivilianCenters() {
  const [collectionCenters, setCollectionCenters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCenter, setSelectedCenter] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const [sortBy, setSortBy] = useState('name')
  const [filters, setFilters] = useState({
    wasteTypes: [],
    openNow: false,
    maxDistance: 50 // in kilometers
  })

  // Load collection centers on component mount
  useEffect(() => {
    loadCollectionCenters()
    getCurrentLocation()
  }, [])

  // Filter and sort centers when search term or filters change
  useEffect(() => {
    filterAndSortCenters()
  }, [searchTerm, sortBy, filters, userLocation])

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        (error) => {
          console.log('Location access denied:', error)
          // Continue without location - will just not show distances
        }
      )
    }
  }

  const loadCollectionCenters = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiService.getCollectionCenters()
      const centersData = response?.data || response || []
      
      // Ensure all centers have required fields
      const validCenters = Array.isArray(centersData) ? centersData.filter(center => 
        center && typeof center === 'object' && center.name && center.id
      ) : []
      
      setOriginalCenters(validCenters.length > 0 ? validCenters : mockCenters)
      setCollectionCenters(validCenters.length > 0 ? validCenters : mockCenters)
    } catch (error) {
      console.error('Failed to load collection centers:', error)
      setError('Using demo data - API connection failed')
      // Fallback to mock data for development
      setOriginalCenters(mockCenters)
      setCollectionCenters(mockCenters)
    } finally {
      setLoading(false)
    }
  }

  const [originalCenters, setOriginalCenters] = useState([])

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const isOpenNow = (center) => {
    if (!center.hours) return false
    
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTime = currentHour * 100 + currentMinute
    
    // Simple check for "8:00 AM - 5:00 PM" format
    // In real app, you'd parse the actual hours format
    return currentTime >= 800 && currentTime <= 1700
  }

  const filterAndSortCenters = () => {
    if (!Array.isArray(originalCenters)) {
      setCollectionCenters([])
      return
    }
    
    let filtered = [...originalCenters]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(center => {
        if (!center) return false
        const name = (center.name || '').toLowerCase()
        const company = (center.company || '').toLowerCase()  
        const address = (center.address || '').toLowerCase()
        const search = searchTerm.toLowerCase()
        
        return name.includes(search) || 
               company.includes(search) || 
               address.includes(search)
      })
    }

    // Apply filters
    if (filters.openNow) {
      filtered = filtered.filter(center => isOpenNow(center))
    }

    if (filters.wasteTypes.length > 0) {
      filtered = filtered.filter(center =>
        filters.wasteTypes.some(type => 
          center.accepted_waste_types?.includes(type)
        )
      )
    }

    // Calculate distances if user location is available
    if (userLocation) {
      filtered = filtered.map(center => ({
        ...center,
        distance: center.latitude && center.longitude 
          ? calculateDistance(
              userLocation.latitude, 
              userLocation.longitude, 
              center.latitude, 
              center.longitude
            )
          : null
      }))

      // Filter by max distance
      if (filters.maxDistance < 50) {
        filtered = filtered.filter(center => 
          center.distance === null || center.distance <= filters.maxDistance
        )
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          const nameA = (a?.name || '').toString()
          const nameB = (b?.name || '').toString()
          return nameA.localeCompare(nameB)
        case 'distance':
          if (!userLocation) return 0
          return (a.distance || 999) - (b.distance || 999)
        case 'rating':
          return (b.rating || 0) - (a.rating || 0)
        default:
          return 0
      }
    })

    setCollectionCenters(filtered)
  }

  const viewCenterDetails = async (centerId) => {
    try {
      const details = await apiService.getCenterById(centerId)
      setSelectedCenter(details)
      setShowDetails(true)
    } catch (error) {
      console.error('Failed to load center details:', error)
      // Fallback to basic info
      const center = collectionCenters.find(c => c.id === centerId)
      setSelectedCenter(center)
      setShowDetails(true)
    }
  }

  const getDirections = (center) => {
    if (userLocation && center.latitude && center.longitude) {
      const url = `https://www.google.com/maps/dir/${userLocation.latitude},${userLocation.longitude}/${center.latitude},${center.longitude}`
      window.open(url, '_blank')
    } else {
      const address = encodeURIComponent(center.address)
      window.open(`https://www.google.com/maps/search/${address}`, '_blank')
    }
  }

  // Mock data for development
  const mockCenters = [
    {
      id: 1,
      name: "Safaricom E-Waste CBD",
      company: "Safaricom PLC",
      address: "Kenyatta Ave, Nairobi CBD",
      phone: "+254 722 000 000",
      hours: "Mon - Fri: 8:00 AM - 5:00 PM",
      latitude: -1.2841,
      longitude: 36.8155,
      accepted_waste_types: ['Electronic', 'Plastic', 'Metal'],
      rating: 4.8,
      isOpen: true
    },
    {
      id: 2,
      name: "Green Cycle Center Kilimani",
      company: "Green Cycle Kenya", 
      address: "Argwings Kodhek Rd, Kilimani",
      phone: "+254 722 111 000",
      hours: "Mon - Sat: 7:00 AM - 6:00 PM",
      latitude: -1.2921,
      longitude: 36.8219,
      accepted_waste_types: ['Plastic', 'Glass', 'Paper'],
      rating: 4.6,
      isOpen: true
    },
    {
      id: 3,
      name: "Eco Point Westlands",
      company: "Eco Solutions Ltd",
      address: "Waiyaki Way, Westlands", 
      phone: "+254 722 222 000",
      hours: "Mon - Fri: 8:00 AM - 5:00 PM",
      latitude: -1.2630,
      longitude: 36.8063,
      accepted_waste_types: ['Glass', 'Metal', 'Electronic'],
      rating: 4.7,
      isOpen: false
    }
  ]

  if (loading) {
    return (
      <div className='w-full max-w-4xl mx-auto p-8 bg-white text-black font-poppins'>
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-600'></div>
          <span className='ml-3 text-gray-600'>Loading collection centers...</span>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full max-w-6xl mx-auto p-8 bg-white text-black font-poppins'>
      {/* Header Section */}
      <div className='mb-8'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-[32px] font-semibold text-gray-700 mb-2'>Collection Centers</h1>
            <p className='text-gray-500 text-lg'>Find the nearest center to drop off your sorted waste</p>
          </div>
          <div className='text-sm text-gray-600'>
            {collectionCenters.length} centers found
            {userLocation && ' • Location enabled'}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className='bg-gray-50 rounded-lg p-6 mb-6'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
          {/* Search */}
          <div className='md:col-span-1'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Search Centers</label>
            <input
              type="text"
              placeholder="Search by name, company, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-green'
            />
          </div>

          {/* Sort By */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-eco-green'>
              <option value="name">Name (A-Z)</option>
              {userLocation && <option value="distance">Distance</option>}
              <option value="rating">Rating</option>
            </select>
          </div>

          {/* Max Distance Filter */}
          {userLocation && (
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Max Distance ({filters.maxDistance}km)
              </label>
              <input
                type="range"
                min="5"
                max="50"
                value={filters.maxDistance}
                onChange={(e) => setFilters(prev => ({...prev, maxDistance: parseInt(e.target.value)}))}
                className='w-full'
              />
            </div>
          )}
        </div>

        {/* Additional Filters */}
        <div className='flex flex-wrap gap-4'>
          <label className='flex items-center'>
            <input
              type="checkbox"
              checked={filters.openNow}
              onChange={(e) => setFilters(prev => ({...prev, openNow: e.target.checked}))}
              className='mr-2'
            />
            <span className='text-sm'>Open Now</span>
          </label>

          <div className='flex items-center space-x-2'>
            <span className='text-sm font-medium'>Waste Types:</span>
            {['Plastic', 'Glass', 'Metal', 'Electronic', 'Paper'].map(type => (
              <label key={type} className='flex items-center'>
                <input
                  type="checkbox"
                  checked={filters.wasteTypes.includes(type.toLowerCase())}
                  onChange={(e) => {
                    const wasteTypes = e.target.checked
                      ? [...filters.wasteTypes, type.toLowerCase()]
                      : filters.wasteTypes.filter(t => t !== type.toLowerCase())
                    setFilters(prev => ({...prev, wasteTypes}))
                  }}
                  className='mr-1'
                />
                <span className='text-xs'>{type}</span>
              </label>
            ))}
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

      {/* Collection Centers Grid */}
      <div className='space-y-4'>
        {collectionCenters.length === 0 ? (
          <div className='text-center py-12'>
            <div className='text-gray-400 text-lg mb-2'>No collection centers found</div>
            <div className='text-gray-500 text-sm'>
              {searchTerm || Object.values(filters).some(f => f !== 'all' && f !== 50 && f !== false && f?.length !== 0)
                ? 'Try adjusting your search or filters'
                : 'Collection centers will appear here'}
            </div>
          </div>
        ) : (
          collectionCenters.map((center) => (
            <div 
              key={center.id}
              className='bg-eco-light rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer'
              onClick={() => viewCenterDetails(center.id)}
            >
              <div className='flex justify-between items-start'>
                <div className='flex-1'>
                  {/* Center Name and Company */}
                  <div className='mb-4'>
                    <div className='flex items-center justify-between'>
                      <h3 className='text-lg font-semibold text-gray-800 mb-1'>{center.name}</h3>
                      {center.distance && (
                        <span className='text-sm bg-eco-green text-white px-2 py-1 rounded-full'>
                          {center.distance.toFixed(1)}km away
                        </span>
                      )}
                    </div>
                    <p className='text-sm text-gray-600'>{center.company}</p>
                    {isOpenNow(center) && (
                      <span className='inline-block mt-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full'>
                        Open Now
                      </span>
                    )}
                  </div>

                  {/* Contact Information */}
                  <div className='space-y-2 mb-4'>
                    {/* Address */}
                    <div className='flex items-start text-gray-600'>
                      <svg className='w-4 h-4 mr-2 flex-shrink-0 mt-0.5' fill='currentColor' viewBox='0 0 20 20'>
                        <path fillRule='evenodd' d='M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z' clipRule='evenodd' />
                      </svg>
                      <span className='text-sm'>{center.address}</span>
                    </div>

                    {/* Phone */}
                    <div className='flex items-center text-gray-600'>
                      <svg className='w-4 h-4 mr-2 flex-shrink-0' fill='currentColor' viewBox='0 0 20 20'>
                        <path d='M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z' />
                      </svg>
                      <span className='text-sm'>{center.phone}</span>
                    </div>

                    {/* Hours */}
                    <div className='flex items-center text-gray-600'>
                      <svg className='w-4 h-4 mr-2 flex-shrink-0' fill='currentColor' viewBox='0 0 20 20'>
                        <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z' clipRule='evenodd' />
                      </svg>
                      <span className='text-sm'>{center.hours}</span>
                    </div>
                  </div>

                  {/* Accepted Waste Types */}
                  {center.accepted_waste_types && (
                    <div className='mb-4'>
                      <div className='text-xs text-gray-600 mb-2'>Accepts:</div>
                      <div className='flex flex-wrap gap-1'>
                        {center.accepted_waste_types.slice(0, 4).map(type => (
                          <span key={type} className='text-xs bg-white text-gray-700 px-2 py-1 rounded-full'>
                            {type}
                          </span>
                        ))}
                        {center.accepted_waste_types.length > 4 && (
                          <span className='text-xs text-gray-500'>
                            +{center.accepted_waste_types.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className='flex flex-col gap-2 ml-4'>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      viewCenterDetails(center.id)
                    }}
                    className='px-3 py-2 text-xs bg-[#355E62] text-white rounded-lg hover:bg-[#2a4a4e] transition-colors'>
                    View Details
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      getDirections(center)
                    }}
                    className='px-3 py-2 text-xs bg-white text-[#355E62] border border-[#355E62] rounded-lg hover:bg-[#355E62] hover:text-white transition-colors'>
                    Get Directions
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Center Details Modal */}
      {showDetails && selectedCenter && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-xl font-semibold'>{selectedCenter.name}</h3>
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
                <label className='font-medium text-gray-700'>Company:</label>
                <p>{selectedCenter.company}</p>
              </div>
              <div>
                <label className='font-medium text-gray-700'>Address:</label>
                <p>{selectedCenter.address}</p>
              </div>
              <div>
                <label className='font-medium text-gray-700'>Phone:</label>
                <p>{selectedCenter.phone}</p>
              </div>
              <div>
                <label className='font-medium text-gray-700'>Operating Hours:</label>
                <p>{selectedCenter.hours}</p>
              </div>
              {selectedCenter.distance && (
                <div>
                  <label className='font-medium text-gray-700'>Distance:</label>
                  <p>{selectedCenter.distance.toFixed(1)} km away</p>
                </div>
              )}
              {selectedCenter.accepted_waste_types && (
                <div>
                  <label className='font-medium text-gray-700'>Accepted Waste Types:</label>
                  <div className='flex flex-wrap gap-1 mt-1'>
                    {selectedCenter.accepted_waste_types.map(type => (
                      <span key={type} className='text-xs bg-[#ECF1E6] text-gray-700 px-2 py-1 rounded-full'>
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {selectedCenter.description && (
                <div>
                  <label className='font-medium text-gray-700'>Description:</label>
                  <p className='text-gray-600'>{selectedCenter.description}</p>
                </div>
              )}
              
              <div className='flex gap-3 pt-4'>
                <button 
                  onClick={() => getDirections(selectedCenter)}
                  className='flex-1 bg-[#355E62] text-white py-2 rounded-lg hover:bg-[#2a4a4e] transition-colors'>
                  Get Directions
                </button>
                <a 
                  href={`tel:${selectedCenter.phone}`}
                  className='flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors text-center'>
                  Call Center
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
