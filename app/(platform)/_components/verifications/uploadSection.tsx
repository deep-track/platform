'use client'

import FileUpload from "@/components/file-upload"
import { Button } from "@/components/ui/button"
import { FileUploadResponse } from "@/lib/types"
import { Trash2, Camera, Upload, Check } from "lucide-react"

export const UploadSection = ({
    type,
    label,
    description,
    uploadedUrl,
    uploadProgress,
    isUploading,
    isError,
    onRemove,
    onUpload,
    onProgress,
    onError
}: {
    type: 'face' | 'frontId' | 'backId'
    label: string
    description: string
    uploadedUrl: string
    uploadProgress: number
    isUploading: boolean
    isError: boolean
    onRemove: () => void
    onUpload: (res: FileUploadResponse[]) => void
    onProgress: (progress: number) => void
    onError: () => void
}) => (
    <div className="upload-area flex flex-col items-center justify-center text-center p-4 border rounded-lg relative">
        {uploadedUrl ? (
            <>
                <div className="absolute top-2 right-2 z-10">
                    <Button
                        variant="destructive"
                        size="icon"
                        className="w-8 h-8"
                        onClick={onRemove}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
                <img
                    src={uploadedUrl}
                    alt={`${label} Preview`}
                    className="w-full h-full object-cover rounded-lg"
                />
                <div className="text-green-600 text-sm flex items-center justify-center mt-2">
                    <Check className="w-4 h-4 mr-1" /> Uploaded
                </div>
            </>
        ) : (
            <>
                {type === 'face' ? (
                    <Camera className="w-8 h-8 text-[#00494c] mb-2" />
                ) : (
                    <Upload className="w-8 h-8 text-[#00494c] mb-2" />
                )}
                <p className="font-medium">{label}</p>
                <p className="text-sm text-gray-500 mt-1">{description}</p>
                <div className="mt-2 w-full">
                    <FileUpload
                        endpoint="imageUploader"
                        onChange={onUpload}
                        onProgress={onProgress}
                        onError={onError}
                        disabled={isUploading}
                    />
                </div>
            </>
        )}
    </div>
)