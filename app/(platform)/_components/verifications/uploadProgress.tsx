'use client'

import { X, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UploadProgressProps {
    progress: number
    fileName?: string
    onCancel: () => void
    onRetry: () => void
    isUploading: boolean
    isError: boolean
}

export const UploadProgress = ({
    progress = 0,
    fileName = "File",
    onCancel,
    onRetry,
    isUploading = false,
    isError = false
}: UploadProgressProps) => {
    return (
        <div className="w-full my-6">
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">{fileName}</span>
                <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">{Math.round(progress)}%</span>
                    {isUploading && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onCancel}
                            className="p-1 hover:bg-gray-100 rounded-full"
                            aria-label="Cancel upload"
                        >
                            <X className="w-4 h-4 text-gray-600" />
                        </Button>
                    )}
                    {isError && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onRetry}
                            className="p-1 hover:bg-gray-100 rounded-full"
                            aria-label="Retry upload"
                        >
                            <RefreshCw className="w-4 h-4 text-gray-600" />
                        </Button>
                    )}
                </div>
            </div>
            <div className="h-2 bg-gray-200 rounded-full relative">
                <div
                    className={`h-full ${isError ? 'bg-red-500' : 'bg-[#00BCD4]'} transform-gpu rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    )
}