"use client"
import React, { useState, useEffect } from 'react'

export default function Upload() {
    const [selectedFile, setSelectedFile] = useState(null)
    const [showLoadingModal, setShowLoadingModal] = useState(false)
    const [showFormModal, setShowFormModal] = useState(false)
    const [aiClassification, setAiClassification] = useState(null)
    const [loadingText, setLoadingText] = useState('Analyzing...')
    const [formData, setFormData] = useState({
        weight: '',
        collectionCenter: ''
    })

    const loadingTexts = [
        'Analyzing...',
        'Powered by AI',
        'Green Energy'
    ]

    const handleFileSelect = (file) => {
        setSelectedFile(file)
        setShowLoadingModal(true)
        simulateAIAnalysis()
    }

    const simulateAIAnalysis = () => {
        // Start text rotation
        let textIndex = 0
        const textInterval = setInterval(() => {
            textIndex = (textIndex + 1) % loadingTexts.length
            setLoadingText(loadingTexts[textIndex])
        }, 1500)

        // Simulate AI analysis delay (3-5 seconds)
        setTimeout(() => {
            clearInterval(textInterval)
            // Mock AI classification results
            const mockClassifications = [
                { type: 'Plastic Bottles', confidence: 95, points: 25 },
                { type: 'Electronic Waste', confidence: 89, points: 40 },
                { type: 'Metal Cans', confidence: 92, points: 30 },
                { type: 'Glass Containers', confidence: 87, points: 20 },
                { type: 'Paper/Cardboard', confidence: 93, points: 15 }
            ]
            
            const randomClassification = mockClassifications[Math.floor(Math.random() * mockClassifications.length)]
            setAiClassification(randomClassification)
            setShowLoadingModal(false)
            setShowFormModal(true)
        }, 4500) // 4.5 seconds analysis time
    }

    const handleTakePhoto = () => {
        // Simulate taking a photo - in real app this would open camera
        const mockFile = {
            name: 'captured_photo.jpg',
            type: 'image/jpeg',
            url: '/api/placeholder/300/200' // placeholder for demo
        }
        handleFileSelect(mockFile)
    }

    const handleFileUpload = (event) => {
        const file = event.target.files[0]
        if (file) {
            const fileWithUrl = {
                ...file,
                url: URL.createObjectURL(file)
            }
            handleFileSelect(fileWithUrl)
        }
    }

    const handleFormChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSubmit = () => {
        console.log('Submitting:', { 
            file: selectedFile, 
            aiClassification: aiClassification,
            ...formData 
        })
        // Handle form submission logic here
        alert('Submission saved!')
        setShowFormModal(false)
        setShowLoadingModal(false)
        setSelectedFile(null)
        setAiClassification(null)
        setFormData({ weight: '', collectionCenter: '' })
    }

    const handleCancel = () => {
        setShowFormModal(false)
        setShowLoadingModal(false)
        setSelectedFile(null)
        setAiClassification(null)
        setFormData({ weight: '', collectionCenter: '' })
    }

    return (
        <div className='w-full h-full flex items-center justify-center bg-white text-black text-poppins flex-col p-8'>
            {!showLoadingModal && !showFormModal ? (
                <div className='uploadModal shadow-custom rounded-lg p-8 max-w-2xl w-full'>
                    <h1 className='text-[34px] mb-4'>Upload Waste Photo</h1>
                    <p className='mb-8 text-gray-600'>
                        Take a photo of your recyclable waste for AI-powered classification
                    </p>
                    <div className="actionBtns flex flex-row gap-4">
                        <button 
                            onClick={handleTakePhoto}
                            className="takePhoto w-[200px] h-[36px] bg-[#ECF1E6]
                            rounded-[64px] text-black hover:cursor-pointer hover:bg-[#d8e2cc]">
                            Take Photo
                        </button>
                        <label className="uploadPhoto w-[200px] h-[36px] bg-[#ECF1E6]
                            rounded-[64px] text-black hover:cursor-pointer hover:bg-[#d8e2cc] 
                            flex items-center justify-center">
                            Choose File
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>
            ) : showLoadingModal ? (
                /* AI Analysis Loading Modal */
                <div className='loadingModal shadow-custom rounded-lg p-8 max-w-md w-full text-center'>
                    <h2 className='text-2xl font-semibold mb-8'>AI Analysis in Progress</h2>
                    
                    {/* Loading Animation - Placeholder for now */}
                    <div className='mb-8'>
                        <div className='loading-spinner mx-auto mb-4'>
                            <div className='w-16 h-16 border-4 border-[#ECF1E6] border-t-[#355E62] rounded-full animate-spin mx-auto'></div>
                        </div>
                        
                        {/* Waste Image Preview */}
                        {selectedFile?.url && (
                            <div className='w-24 h-24 mx-auto mb-4 rounded-lg overflow-hidden border-2 border-gray-200'>
                                <img 
                                    src={selectedFile.url} 
                                    alt="Analyzing waste" 
                                    className='w-full h-full object-cover'
                                />
                            </div>
                        )}
                    </div>

                    {/* Alternating Text */}
                    <div className='text-lg text-[#355E62] font-medium animate-pulse'>
                        {loadingText}
                    </div>
                    
                    <p className='text-sm text-gray-500 mt-2'>
                        Please wait while we classify your waste...
                    </p>
                </div>
            ) : (
                <div className='formModal shadow-custom rounded-lg p-8 max-w-md w-full'>
                    <h2 className='text-2xl font-semibold mb-6'>Fill in the Data</h2>
                    
                    <div className='space-y-6'>
                        {/* Waste Photo Preview */}
                        <div className='border rounded-lg p-4'>
                            <label className='block text-sm font-medium mb-2'>Waste Photo</label>
                            <div className='w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden'>
                                {selectedFile?.url ? (
                                    <img 
                                        src={selectedFile.url} 
                                        alt="Waste photo" 
                                        className='w-full h-full object-cover'
                                    />
                                ) : (
                                    <div className='w-full h-full bg-blue-100 flex items-center justify-center'>
                                        <span className='text-blue-600'>Photo Preview</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* AI Classification Result */}
                        <div>
                            <label className='block text-sm font-medium mb-2'>AI Classification</label>
                            <div className='w-full p-3 border border-gray-300 rounded-lg bg-[#F0F8F0] flex items-center justify-between'>
                                <div className='flex items-center'>
                                    <div className='w-3 h-3 bg-green-500 rounded-full mr-2'></div>
                                    <span className='text-sm font-medium text-gray-800'>
                                        {aiClassification?.type || 'Classification Result'}
                                    </span>
                                </div>
                                <div className='flex items-center'>
                                    <span className='text-xs text-gray-500 mr-2'>
                                        {aiClassification?.confidence}% confident
                                    </span>
                                    <span className='text-xs bg-[#355E62] text-white px-2 py-1 rounded-full'>
                                        +{aiClassification?.points} pts
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Weight */}
                        <div>
                            <label className='block text-sm font-medium mb-2'>Weight (kg)</label>
                            <input 
                                type="number"
                                placeholder="Enter weight in kilograms"
                                value={formData.weight}
                                onChange={(e) => handleFormChange('weight', e.target.value)}
                                className='w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#355E62]'
                            />
                        </div>

                        {/* Collection Center */}
                        <div>
                            <label className='block text-sm font-medium mb-2'>Collection Center</label>
                            <select 
                                value={formData.collectionCenter}
                                onChange={(e) => handleFormChange('collectionCenter', e.target.value)}
                                className='w-full p-3 border border-gray-300 rounded-lg bg-[#ECF1E6] focus:outline-none focus:ring-2 focus:ring-[#355E62]'>
                                <option value="">Select a collection center</option>
                                <option value="Downtown Recycling Center">Downtown Recycling Center</option>
                                <option value="Green Valley Center">Green Valley Center</option>
                                <option value="Westside Collection Point">Westside Collection Point</option>
                            </select>
                        </div>

                        {/* Submit Button */}
                        <button 
                            onClick={handleSubmit}
                            className='w-full bg-[#355E62] text-white py-3 rounded-lg font-medium hover:bg-[#2a4a4e] transition-colors'>
                            Save Submission
                        </button>

                        {/* Cancel Button */}
                        <button 
                            onClick={handleCancel}
                            className='w-full bg-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors'>
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
