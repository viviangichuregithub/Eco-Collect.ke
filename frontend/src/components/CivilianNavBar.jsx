"use client"
import React, { useState } from 'react'
import Upload from './Upload.jsx'
import CivilianCenters from './CivilianCenters.jsx'
import History from './History.jsx'
import Profile from './Profile.jsx'

export default function CivilianNavBar() {
    const [activeTab, setActiveTab] = useState(1) // 0: Upload, 1: Centers, 2: History, 3: Profile
    
    const navItems = [
        { id: 0, label: 'Upload' },
        { id: 1, label: 'Centers' },
        { id: 2, label: 'History' },
        { id: 3, label: 'Profile' }
    ]

    const handleTabClick = (tabId) => {
        setActiveTab(tabId)
    }

    // Function to render the appropriate component based on active tab
    const renderActiveComponent = () => {
        switch (activeTab) {
            case 0:
                return <Upload />
            case 1:
                return <CivilianCenters />
            case 2:
                return <History />
            case 3:
                return <Profile />
            default:
                return <CivilianCenters />
        }
    }

    return (
        <div className='w-full flex flex-col items-center'>
            {/* Navigation Bar */}
            <div className='relative flex items-center bg-[#355E62] w-[678px] h-[36px] rounded-[64px] align-center justify-center mb-6'>
                {/* White Background for Active Tab */}
                <div 
                    className='absolute top-[4px] h-[28px] bg-white rounded-[28px] transition-all duration-300 ease-in-out z-0'
                    style={{
                        width: `${(672/4) - 4}px`,
                        left: `${activeTab * (672/4) + 2}px`,
                    }}
                />

                {/* Navigation Items */}
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => handleTabClick(item.id)}
                        className={`
                            relative flex items-center justify-center text-sm font-medium transition-colors duration-300 ease-in-out z-10
                            ${activeTab === item.id 
                                ? 'text-[#355E62]' 
                                : 'text-white hover:text-gray-200'
                            }
                        `}
                        style={{
                            width: `${672/4}px`,
                            height: '36px'
                        }}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {/* Rendered Component */}
            <div className='w-full'>
                {renderActiveComponent()}
            </div>
        </div>
    )
}
