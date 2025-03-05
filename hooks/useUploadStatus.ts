'use client'

import { useState } from "react"
import toast from "react-hot-toast"

export const useUploadStatus = () => {
  const [uploadStatus, setUploadStatus] = useState({
    face: { progress: 0, isUploading: false, isError: false, fileName: "Face Image" },
    frontId: { progress: 0, isUploading: false, isError: false, fileName: "Front ID" },
    backId: { progress: 0, isUploading: false, isError: false, fileName: "Back ID" }
  })

  const handleUploadRetry = (type: 'face' | 'frontId' | 'backId') => {
    setUploadStatus(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        progress: 0,
        isUploading: false,
        isError: false
      }
    }))
    toast(`Please select ${uploadStatus[type].fileName} again to retry`)
  }

  const handleUploadProgress = (type: 'face' | 'frontId' | 'backId', progress: number) => {
    setUploadStatus(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        progress,
        isUploading: progress < 100 && progress > 0,
        isError: false
      }
    }))
  }

  const handleUploadError = (type: 'face' | 'frontId' | 'backId') => {
    setUploadStatus(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        isUploading: false,
        isError: true
      }
    }))
  }

  const handleUploadCancel = (type: 'face' | 'frontId' | 'backId') => {
    setUploadStatus(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        progress: 0,
        isUploading: false,
        isError: false
      }
    }))
    toast.error(`${uploadStatus[type].fileName} upload canceled`)
  }

  return {
    uploadStatus,
    handleUploadProgress,
    handleUploadError,
    handleUploadCancel,
    handleUploadRetry
  }
}