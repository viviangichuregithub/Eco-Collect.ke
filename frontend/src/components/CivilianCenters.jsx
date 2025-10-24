import React from 'react'

export default function CivilianCenters() {
  const collectionCenters = [
    {
      id: 1,
      name: "Safaricom E-Waste CBD",
      company: "Safaricom PLC",
      address: "Kenyatta Ave, Nairobi CBD",
      phone: "+254 722 000 000",
      hours: "Mon - Fri: 8:00 AM - 5:00 PM"
    },
    {
      id: 2,
      name: "Safaricom E-Waste CBD",
      company: "Safaricom PLC", 
      address: "Kenyatta Ave, Nairobi CBD",
      phone: "+254 722 000 000",
      hours: "Mon - Fri: 8:00 AM - 5:00 PM"
    },
    {
      id: 3,
      name: "Safaricom E-Waste CBD",
      company: "Safaricom PLC",
      address: "Kenyatta Ave, Nairobi CBD", 
      phone: "+254 722 000 000",
      hours: "Mon - Fri: 8:00 AM - 5:00 PM"
    }
  ]

  return (
    <div className='w-full max-w-4xl mx-auto p-8 bg-white text-black text-poppins'>
      {/* Header Section */}
      <div className='mb-8'>
        <h1 className='text-[32px] font-semibold text-gray-700 mb-2'>Collection Centers</h1>
        <p className='text-gray-500 text-lg'>Find the nearest center to drop off your sorted waste</p>
      </div>

      {/* Collection Centers Grid */}
      <div className='space-y-4'>
        {collectionCenters.map((center) => (
          <div 
            key={center.id}
            className='bg-[#ECF1E6] rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200'
          >
            {/* Center Name and Company */}
            <div className='mb-4'>
              <h3 className='text-lg font-semibold text-gray-800 mb-1'>{center.name}</h3>
              <p className='text-sm text-gray-600'>{center.company}</p>
            </div>

            {/* Contact Information */}
            <div className='space-y-2'>
              {/* Address */}
              <div className='flex items-center text-gray-600'>
                <svg className='w-4 h-4 mr-2 flex-shrink-0' fill='currentColor' viewBox='0 0 20 20'>
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
          </div>
        ))}
      </div>
    </div>
  )
}
