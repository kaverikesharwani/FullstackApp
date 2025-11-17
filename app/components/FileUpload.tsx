"use client"

import {
    ImageKitAbortError,
    ImageKitInvalidRequestError,
    ImageKitServerError,
    ImageKitUploadNetworkError,
    upload,
} from "@imagekit/next";
import { useRef, useState } from "react";

interface FileUploadProps {
    onSuccess: (res: any) => void
    onProgress?: (progress: number) => void
    fileType?: "image" | "video"
}

const FileUpload = ({
    onSuccess,
    onProgress,
    fileType = "image"
}: FileUploadProps) => {

    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)
     
    // File validation
    const validateFile = (file: File): boolean => {
        // Check file type
        if (fileType === "video") {
            if (!file.type.startsWith("video/")) {
                setError("Please upload a valid video file")
                return false
            }
        } else {
            if (!file.type.startsWith("image/")) {
                setError("Please upload a valid image file")
                return false
            }
        }
        
        // Check file size (100MB limit)
        if (file.size > 100 * 1024 * 1024) {
            setError("File size must be less than 100 MB")
            return false
        }
        
        return true
    }
    
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]

        if (!file || !validateFile(file)) return

        setUploading(true)
        setError(null)

        try {
            // Get authentication credentials
            const authRes = await fetch("/api/auth/imagekit-auth")
            
            if (!authRes.ok) {
                throw new Error("Failed to get authentication credentials")
            }
            
            const auth = await authRes.json()

            // Upload file
            const res = await upload({
                file,
                fileName: file.name,
                publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY!,
                signature: auth.signature,
                expire: auth.expire,
                token: auth.token,
                onProgress: (event) => {
                    if (event.lengthComputable && onProgress) {
                        const percent = (event.loaded / event.total) * 100
                        onProgress(Math.round(percent))
                    }
                },
            })

            onSuccess(res)
            
            // Reset input after successful upload
            if (inputRef.current) {
                inputRef.current.value = ""
            }
            
        } catch (error) {
            console.error("Upload failed:", error)
            
            // Handle specific ImageKit errors
            if (error instanceof ImageKitAbortError) {
                setError("Upload was aborted")
            } else if (error instanceof ImageKitInvalidRequestError) {
                setError("Invalid upload request")
            } else if (error instanceof ImageKitServerError) {
                setError("Server error occurred")
            } else if (error instanceof ImageKitUploadNetworkError) {
                setError("Network error occurred")
            } else {
                setError("Upload failed. Please try again.")
            }
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <input
                ref={inputRef}
                type="file"
                accept={fileType === "video" ? "video/*" : "image/*"}
                onChange={handleFileChange}
                disabled={uploading}
                className="file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            
            {uploading && (
                <span className="text-sm text-gray-600">Uploading...</span>
            )}
            
            {error && (
                <span className="text-sm text-red-600">{error}</span>
            )}
        </div>
    )
}

export default FileUpload