"use client"
import React, { useState, useEffect } from 'react'
import apiService from '../lib/api'

export default function Upload() {
    const [selectedFile, setSelectedFile] = useState(null)
    const [uploadedFileId, setUploadedFileId] = useState(null)
    const [showLoadingModal, setShowLoadingModal] = useState(false)
    const [showFormModal, setShowFormModal] = useState(false)
    const [aiClassification, setAiClassification] = useState(null)
    const [loadingText, setLoadingText] = useState('Analyzing...')
    const [collectionCenters, setCollectionCenters] = useState([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState(null)
    const [formData, setFormData] = useState({
        weight: '',
        collectionCenter: '',
        notes: ''
    })

    const loadingTexts = [
        'Analyzing...',
        'Powered by AI',
        'Green Energy',
        'Processing Image...',
        'Detecting Waste Type...'
    ]

    // Load collection centers on component mount
    useEffect(() => {
        loadCollectionCenters()
    }, [])

    const loadCollectionCenters = async () => {
        try {
            const centers = await apiService.getCollectionCenters()
            setCollectionCenters(centers.data || [])
        } catch (error) {
            console.error('Failed to load collection centers:', error)
            setError('Failed to load collection centers')
        }
    }

    const handleFileSelect = async (file) => {
        setSelectedFile(file)
        setShowLoadingModal(true)
        setError(null)
        
        try {
            // Upload file to server
            const uploadResponse = await apiService.uploadWastePhoto(file)
            setUploadedFileId(uploadResponse.file_id)
            
            // Start AI analysis
            await performAIAnalysis(uploadResponse.file_id)
        } catch (error) {
            console.error('File upload failed:', error)
            setError('Failed to upload file. Please try again.')
            setShowLoadingModal(false)
        }
    }

    const performAIAnalysis = async (fileId) => {
        // Start text rotation
        let textIndex = 0
        const textInterval = setInterval(() => {
            textIndex = (textIndex + 1) % loadingTexts.length
            setLoadingText(loadingTexts[textIndex])
        }, 1500)

        try {
            // Call AI classification API
            const classificationResult = await apiService.classifyWaste(fileId)
            
            clearInterval(textInterval)
            setAiClassification(classificationResult)
            setShowLoadingModal(false)
            setShowFormModal(true)
        } catch (error) {
            console.error('AI classification failed:', error)
            clearInterval(textInterval)
            
            // Fallback to manual classification or show error
            setError('AI classification failed. Please select category manually.')
            setShowLoadingModal(false)
            setShowFormModal(true)
        }
    }

    const retryAnalysis = async () => {
        if (uploadedFileId) {
            setShowFormModal(false)
            setShowLoadingModal(true)
            setError(null)
            await performAIAnalysis(uploadedFileId)
        }
    }

    const handleTakePhoto = async () => {
        try {
            // Check if camera is available
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setError('Camera not available on this device')
                return
            }

            // Request camera access
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } // Prefer back camera
            })

            // Create video element for camera preview
            const video = document.createElement('video')
            video.srcObject = stream
            video.play()

            // For now, we'll simulate capturing - in real implementation,
            // you'd show camera preview and let user take photo
            setTimeout(() => {
                const canvas = document.createElement('canvas')
                const context = canvas.getContext('2d')
                canvas.width = video.videoWidth
                canvas.height = video.videoHeight
                context.drawImage(video, 0, 0)

                canvas.toBlob((blob) => {
                    const file = new File([blob], 'captured_photo.jpg', { type: 'image/jpeg' })
                    const fileWithUrl = {
                        ...file,
                        url: URL.createObjectURL(file)
                    }
                    handleFileSelect(fileWithUrl)
                }, 'image/jpeg', 0.8)

                // Stop camera
                stream.getTracks().forEach(track => track.stop())
            }, 1000)

        } catch (error) {
            console.error('Camera access failed:', error)
            setError('Failed to access camera. Please use file upload instead.')
        }
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

    const validateForm = () => {
        if (!formData.weight || parseFloat(formData.weight) <= 0) {
            setError('Please enter a valid weight')
            return false
        }
        if (!formData.collectionCenter) {
            setError('Please select a collection center')
            return false
        }
        if (!aiClassification && !error) {
            setError('Classification required. Please retry analysis.')
            return false
        }
        return true
    }

    const handleSubmit = async () => {
        if (!validateForm()) return

        setIsSubmitting(true)
        setError(null)

        try {
            const submissionData = {
                file_id: uploadedFileId,
                classification: aiClassification,
                weight: parseFloat(formData.weight),
                collection_center_id: formData.collectionCenter,
                notes: formData.notes || null,
                location: await getCurrentLocation() // Optional geolocation
            }

            const response = await apiService.submitWasteEntry(submissionData)
            
            // Success feedback
            alert(`Submission saved successfully! You earned ${response.points_earned} points.`)
            resetForm()
            
        } catch (error) {
            console.error('Submission failed:', error)
            setError('Failed to submit waste entry. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const getCurrentLocation = () => {
        return new Promise((resolve) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    }),
                    () => resolve(null) // Ignore geolocation errors
                )
            } else {
                resolve(null)
            }
        })
    }

    const resetForm = () => {
        setShowFormModal(false)
        setShowLoadingModal(false)
        setSelectedFile(null)
        setUploadedFileId(null)
        setAiClassification(null)
        setError(null)
        setFormData({ weight: '', collectionCenter: '', notes: '' })
    }

    const handleCancel = () => {
        resetForm()
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
                                className='w-full p-3 border border-gray-300 rounded-lg bg-[#ECF1E6] focus:outline-none focus:ring-2 focus:ring-[#355E62]'
                                disabled={collectionCenters.length === 0}>
                                <option value="">
                                    {collectionCenters.length === 0 ? 'Loading centers...' : 'Select a collection center'}
                                </option>
                                {collectionCenters.map((center) => (
                                    <option key={center.id} value={center.id}>
                                        {center.name} - {center.address}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Notes (Optional) */}
                        <div>
                            <label className='block text-sm font-medium mb-2'>Additional Notes (Optional)</label>
                            <textarea 
                                value={formData.notes}
                                onChange={(e) => handleFormChange('notes', e.target.value)}
                                placeholder="Any additional information about the waste..."
                                rows={3}
                                className='w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#355E62] resize-none'
                            />
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className='p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between'>
                                <div className='flex items-center'>
                                    <svg className='w-5 h-5 text-red-500 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                                        <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' />
                                    </svg>
                                    <span className='text-red-700 text-sm'>{error}</span>
                                </div>
                                {!aiClassification && uploadedFileId && (
                                    <button 
                                        onClick={retryAnalysis}
                                        className='text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700'>
                                        Retry Analysis
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button 
                            onClick={handleSubmit}
                            disabled={isSubmitting || !aiClassification}
                            className={`w-full py-3 rounded-lg font-medium transition-colors ${
                                isSubmitting || !aiClassification
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-[#355E62] hover:bg-[#2a4a4e]'
                            } text-white`}>
                            {isSubmitting ? 'Submitting...' : 'Save Submission'}
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
