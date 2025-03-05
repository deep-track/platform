'use client'

import { useState } from "react";
import { ChevronLeft, Camera, Upload, Loader2, Check, X, RefreshCw, Trash2 } from "lucide-react";
import { FaIdCard, FaRegIdCard, FaPassport } from "react-icons/fa";
import { TbCertificate } from "react-icons/tb";
import VerificationResults from "./verificationResults";
import { MdReceiptLong } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import FileUpload from "@/components/file-upload";
import { Checkbox } from "@/components/ui/checkbox";
import toast, { Toaster } from "react-hot-toast";
import MultiStepVerificationLoader from "./multistepLoader";
import { verifyIdentityServerSide } from "@/lib/actions";
import DocumentConfirmationDialog from "./documentConfirmation";

type DocumentType = "id-card" | "drivers-license" | "passport" | "disability-certificate" | "kra-pin-certificate";

interface Step {
  title: string;
  description: string;
}

interface UploadProgressProps {
  progress: number;
  fileName?: string;
  onCancel: () => void;
  onRetry: () => void;
  isUploading: boolean;
  isError: boolean;
}

// Define the verification response interface
interface VerificationResponse {
  message: string;
  document_verification: Array<{
    documentName: string;
    text: string;
    verification_data: Array<{
      type: string;
      fraudFlag: string;
      normalizedValue: string;
    }>;
  }>;
  face_match: {
    face_match: boolean;
    details: {
      similarity: number;
      confidence: number;
    };
  };
}

// Define FileUploadResponse type
interface FileUploadResponse {
  url: string;
  name: string;
}

const STEPS: Step[] = [
  {
    title: "Select Document",
    description: "Choose your identification document type",
  },
  {
    title: "Upload Documents",
    description: "Upload the required document images",
  },
  {
    title: "Verify",
    description: "Final verification step",
  },
];

const VerifyIdentityForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDocument, setSelectedDocument] = useState<DocumentType | null>(null);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResults, setVerificationResults] = useState<VerificationResponse | null>(null);
  const [_showConfirmation, setShowConfirmation] = useState(false);

  const [uploadStatus, setUploadStatus] = useState({
    face: { progress: 0, isUploading: false, isError: false, fileName: "Face Image" },
    frontId: { progress: 0, isUploading: false, isError: false, fileName: "Front ID" },
    backId: { progress: 0, isUploading: false, isError: false, fileName: "Back ID" }
  });

  // Functions to handle upload actions
  const handleUploadProgress = (type: 'face' | 'frontId' | 'backId', progress: number) => {
    setUploadStatus(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        progress,
        isUploading: progress < 100 && progress > 0,
        isError: false
      }
    }));
  };

  const handleUploadError = (type: 'face' | 'frontId' | 'backId') => {
    setUploadStatus(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        isUploading: false,
        isError: true
      }
    }));
  };

  const handleUploadCancel = (type: 'face' | 'frontId' | 'backId') => {
    // Logic to cancel the upload - this would interact with your upload library
    // For now, we'll just reset the progress
    setUploadStatus(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        progress: 0,
        isUploading: false,
        isError: false
      }
    }));

    // If there's an active upload, you would need to cancel it
    // This depends on what upload library you're using
    // For example: uploadCancelTokenSource.cancel();

    toast.error(`${uploadStatus[type].fileName} upload canceled`);
  };

  const handleUploadRetry = (type: 'face' | 'frontId' | 'backId') => {
    // Reset the error state and prepare for a new upload
    setUploadStatus(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        progress: 0,
        isUploading: false,
        isError: false
      }
    }));

    // Logic to retry the upload would go here
    // This would typically trigger the file selection dialog again
    toast(`Please select ${uploadStatus[type].fileName} again to retry`);

    // Clear the corresponding uploaded image to allow re-upload
    if (type === 'face') {
      setUploadedImages(prev => ({ ...prev, face_Image: "" }));
    } else if (type === 'frontId') {
      setUploadedImages(prev => ({ ...prev, front_id_Image: "" }));
    } else if (type === 'backId') {
      setUploadedImages(prev => ({ ...prev, back_id_Image: "" }));
    }
  };
  
  // State to store uploaded image URLs
  const [uploadedImages, setUploadedImages] = useState({
    face_Image: "",
    front_id_Image: "",
    back_id_Image: ""
  });

  const handleDocumentSelect = (type: DocumentType) => {
    setSelectedDocument(type);
  };

  const handleFaceImageUpload = (res: FileUploadResponse[]) => {
    if (res && res.length > 0) {
      setUploadedImages(prev => ({
        ...prev,
        face_Image: res[0].url
      }));
      console.log("Face image uploaded:", res[0].url);
    }
  };

  const handleFrontImageUpload = (res: FileUploadResponse[]) => {
    if (res && res.length > 0) {
      setUploadedImages(prev => ({
        ...prev,
        front_id_Image: res[0].url
      }));
      console.log("Front ID uploaded:", res[0].url);
    }
  };

  const handleBackImageUpload = (res: FileUploadResponse[]) => {
    if (res && res.length > 0) {
      setUploadedImages(prev => ({
        ...prev,
        back_id_Image: res[0].url
      }));
      console.log("Back ID uploaded:", res[0].url);
    }
  };

  const verifyIdentity = async () => {
    try {
      setIsLoading(true);

      // Check if all images are uploaded
      if (!uploadedImages.face_Image || !uploadedImages.front_id_Image || !uploadedImages.back_id_Image) {
        toast.error("Please upload all required images");
        return;
      }

      // Call the server action
      const result = await verifyIdentityServerSide(uploadedImages);

      if (result.success) {
        setVerificationResults(result.data);
        setVerificationComplete(true);
        toast.success("Verification completed successfully");
      } else {
        toast.error(result.error || "Verification failed. Please try again.");
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 0 && !selectedDocument) {
      toast.error("Please select a document type");
      return;
    }

    if (currentStep === 1) {
      // Check if all images are uploaded before proceeding
      if (!uploadedImages.face_Image || !uploadedImages.front_id_Image || !uploadedImages.back_id_Image) {
        toast.error("Please upload all required images");
        return;
      }
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else if (currentStep === STEPS.length - 1) {
      // Start verification process
      setShowConfirmation(true);
      verifyIdentity();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Check if all required images are uploaded for the current step
  const areAllImagesUploaded = (): boolean => {
    if (currentStep !== 1) return true;
    return !!(uploadedImages.face_Image && uploadedImages.front_id_Image && uploadedImages.back_id_Image);
  };

  if (verificationComplete && verificationResults) {
    return <VerificationResults verificationData={verificationResults} />;
  }

  const Progress = () => (
    <div className="w-full mb-8">
      <div className="h-2 bg-gray-200 rounded-full relative">
        <div
          className="h-full bg-[#14B4BC] transform-gpu rounded-full transition-transform duration-500 ease-out"
          style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
        />
      </div>
      <div className="mt-4 flex justify-between text-sm text-gray-500">
        <span>Step {currentStep + 1} of {STEPS.length}</span>
        <span>{STEPS[currentStep].title}</span>
      </div>
    </div>
  );

  const DocumentSelection = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Select Document Type</h2>
      <p className="text-gray-500 mb-6">Choose a valid government-issued document</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className={`flex flex-row gap-3 relative p-6 border-2 rounded-lg transition-all duration-300 hover:border-[#00494c] hover:shadow-md cursor-pointer ${selectedDocument === "id-card" ? "border-4 border-[#00494c] shadow-md" : ""}`}
          onClick={() => handleDocumentSelect("id-card")}
        >
          <FaIdCard className="w-6 h-6 text-[#00494c] mb-2" />
          <h3 className={`${selectedDocument === "id-card" ? "font-bold" : "font-normal"}`}>Government-Issued ID Card</h3>
        </div>
        <div
          className={`flex flex-row gap-3 relative p-6 border-2 rounded-lg transition-all duration-300 hover:border-[#00494c] hover:shadow-md cursor-pointer ${selectedDocument === "drivers-license" ? "border-4 border-[#00494c] shadow-md" : ""}`}
          onClick={() => handleDocumentSelect("drivers-license")}
        >
          <FaRegIdCard className="w-6 h-6 text-[#00494c] mb-2" />
          <h3 className={`${selectedDocument === "drivers-license" ? "font-bold" : "font-normal"}`}>Driver&apos;s License</h3>
        </div>
        <div
          className={`flex flex-row gap-3 relative p-6 border-2 rounded-lg transition-all duration-300 hover:border-[#00494c] hover:shadow-md cursor-pointer ${selectedDocument === "passport" ? "border-4 border-[#00494c] shadow-md" : ""}`}
          onClick={() => handleDocumentSelect("passport")}
        >
          <FaPassport className="w-6 h-6 text-[#00494c] mb-2" />
          <h3 className={`${selectedDocument === "passport" ? "font-bold" : "font-normal"}`}>Passport</h3>
        </div>
        <div
          className={`flex flex-row gap-3 relative p-6 border-2 rounded-lg transition-all duration-300 hover:border-[#00494c] hover:shadow-md cursor-pointer ${selectedDocument === "disability-certificate" ? "border-4 border-[#00494c] shadow-md" : ""}`}
          onClick={() => handleDocumentSelect("disability-certificate")}
        >
          <TbCertificate className="w-6 h-6 text-[#00494c] mb-2" />
          <h3 className={`${selectedDocument === "disability-certificate" ? "font-bold" : "font-normal"}`}>Disablity Certificate</h3>
        </div>
        <div
          className={`flex flex-row gap-3 relative p-6 border-2 rounded-lg transition-all duration-300 hover:border-[#00494c] hover:shadow-md cursor-pointer ${selectedDocument === "kra-pin-certificate" ? "border-4 border-[#00494c] shadow-md" : ""}`}
          onClick={() => handleDocumentSelect("kra-pin-certificate")}
        >
          <MdReceiptLong className="w-6 h-6 text-[#00494c] mb-2" />
          <h3 className={`${selectedDocument === "kra-pin-certificate" ? "font-bold" : "font-normal"}`}>KRA PIN Certificate</h3>
        </div>
      </div>
    </div>
  );

  const UploadProgress = ({
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
              <button
                onClick={onCancel}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Cancel upload"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            )}
            {isError && (
              <button
                onClick={onRetry}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Retry upload"
              >
                <RefreshCw className="w-4 h-4 text-gray-600" />
              </button>
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
    );
  };

  // remove images on upload
  const handleRemoveImage = (type: 'face' | 'frontId' | 'backId') => {
    // Confirm before deletion
    const confirmRemove = window.confirm("Are you sure you want to remove this image?");

    if (confirmRemove) {
      // Reset the corresponding image URL
      setUploadedImages(prev => ({
        ...prev,
        [type === 'face' ? 'face_Image' : type === 'frontId' ? 'front_id_Image' : 'back_id_Image']: ""
      }));

      // Reset upload status for the specific image type
      setUploadStatus(prev => ({
        ...prev,
        [type]: {
          progress: 0,
          isUploading: false,
          isError: false,
          fileName: type === 'face' ? "Face Image" : type === 'frontId' ? "Front ID" : "Back ID"
        }
      }));

      // Optional: Show a toast notification
      toast.success("Image removed successfully");
    }
  };

  const DocumentUpload = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Upload Documents</h2>
        <p className="text-gray-500">Please upload clear photos of your documents</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Face Image Upload */}
          <div className="upload-area flex flex-col items-center justify-center text-center p-4 border rounded-lg relative">
            {uploadedImages.face_Image ? (
              <>
                <div className="absolute top-2 right-2 z-10">
                  <Button
                    variant="destructive"
                    size="icon"
                    className="w-8 h-8"
                    onClick={() => handleRemoveImage('face')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <img
                  src={uploadedImages.face_Image}
                  alt="Face Preview"
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="text-green-600 text-sm flex items-center justify-center mt-2">
                  <Check className="w-4 h-4 mr-1" /> Uploaded
                </div>
              </>
            ) : (
              <>
                <Camera className="w-8 h-8 text-[#00494c] mb-2" />
                <p className="font-medium">Face Image</p>
                <p className="text-sm text-gray-500 mt-1">Clear and Lively</p>
                <div className="mt-2 w-full">
                  <FileUpload
                    endpoint="imageUploader"
                    onChange={handleFaceImageUpload}
                    onProgress={(progress) => handleUploadProgress('face', progress)}
                    onError={() => handleUploadError('face')}
                    disabled={uploadStatus.face.isUploading}
                  />
                </div>
              </>
            )}
          </div>

          {/* Front ID Upload (Similar structure, just replace 'face' with 'frontId') */}
          <div className="upload-area flex flex-col items-center justify-center text-center p-4 border rounded-lg relative">
            {uploadedImages.front_id_Image ? (
              <>
                <div className="absolute top-2 right-2 z-10">
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="w-8 h-8"
                    onClick={() => handleRemoveImage('frontId')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <img
                  src={uploadedImages.front_id_Image}
                  alt="Front ID Preview"
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="text-green-600 text-sm flex items-center justify-center mt-2">
                  <Check className="w-4 h-4 mr-1" /> Uploaded
                </div>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-[#00494c] mb-2" />
                <p className="font-medium">Front Side</p>
                <p className="text-sm text-gray-500 mt-1">JPG, PNG, WebP</p>
                <div className="mt-2 w-full">
                  <FileUpload
                    endpoint="imageUploader"
                    onChange={handleFrontImageUpload}
                    onProgress={(progress) => handleUploadProgress('frontId', progress)}
                    onError={() => handleUploadError('frontId')}
                    disabled={uploadStatus.frontId.isUploading}
                  />
                </div>
              </>
            )}
          </div>

          {/* Back ID Upload (Similar structure, just replace 'face' with 'backId') */}
          <div className="upload-area flex flex-col items-center justify-center text-center p-4 border rounded-lg relative">
            {uploadedImages.back_id_Image ? (
              <>
                <div className="absolute top-2 right-2 z-10">
                  <Button
                    variant="destructive"
                    size="icon"
                    className="w-8 h-8"
                    onClick={() => handleRemoveImage('backId')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <img
                  src={uploadedImages.back_id_Image}
                  alt="Back ID Preview"
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="text-green-600 text-sm flex items-center justify-center mt-2">
                  <Check className="w-4 h-4 mr-1" /> Uploaded
                </div>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-[#00494c] mb-2" />
                <p className="font-medium">Back Side</p>
                <p className="text-sm text-gray-500 mt-1">JPG, PNG, WebP</p>
                <div className="mt-2 w-full">
                  <FileUpload
                    endpoint="imageUploader"
                    onChange={handleBackImageUpload}
                    onProgress={(progress) => handleUploadProgress('backId', progress)}
                    onError={() => handleUploadError('backId')}
                    disabled={uploadStatus.backId.isUploading}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Add progress bars for each upload that's in progress or has error */}
        {(uploadStatus.face.isUploading || uploadStatus.face.isError) && (
          <UploadProgress
            progress={uploadStatus.face.progress}
            fileName={uploadStatus.face.fileName}
            onCancel={() => handleUploadCancel('face')}
            onRetry={() => handleUploadRetry('face')}
            isUploading={uploadStatus.face.isUploading}
            isError={uploadStatus.face.isError}
          />
        )}

        {(uploadStatus.frontId.isUploading || uploadStatus.frontId.isError) && (
          <UploadProgress
            progress={uploadStatus.frontId.progress}
            fileName={uploadStatus.frontId.fileName}
            onCancel={() => handleUploadCancel('frontId')}
            onRetry={() => handleUploadRetry('frontId')}
            isUploading={uploadStatus.frontId.isUploading}
            isError={uploadStatus.frontId.isError}
          />
        )}

        {(uploadStatus.backId.isUploading || uploadStatus.backId.isError) && (
          <UploadProgress
            progress={uploadStatus.backId.progress}
            fileName={uploadStatus.backId.fileName}
            onCancel={() => handleUploadCancel('backId')}
            onRetry={() => handleUploadRetry('backId')}
            isUploading={uploadStatus.backId.isUploading}
            isError={uploadStatus.backId.isError}
          />
        )}
      </div>
    );
  };

  const VerificationInProgress = () => {
    const [showConfirmation, setShowConfirmation] = useState(false);

    return (
      <div className="text-center py-12 flex flex-col items-center justify-center">
        {isLoading ? (
          <MultiStepVerificationLoader />
        ) : (
          <>
            <h2 className="text-xl font-semibold">Ready to Verify</h2>
            <p className="text-gray-500 mt-2">Please review your documents before verification</p>

            {/* Document preview section */}
            <div className="mt-8 w-full max-w-3xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Face Image Preview */}
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <div className="aspect-square relative">
                    {uploadedImages.face_Image ? (
                      <img
                        src={uploadedImages.face_Image}
                        alt="Face Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <Camera className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-2 bg-gray-50 text-center">
                    <p className="text-sm font-medium">Face Photo</p>
                  </div>
                </div>

                {/* Front ID Preview */}
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <div className="aspect-square relative">
                    {uploadedImages.front_id_Image ? (
                      <img
                        src={uploadedImages.front_id_Image}
                        alt="Front ID Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <Upload className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-2 bg-gray-50 text-center">
                    <p className="text-sm font-medium">Front Side</p>
                  </div>
                </div>

                {/* Back ID Preview */}
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <div className="aspect-square relative">
                    {uploadedImages.back_id_Image ? (
                      <img
                        src={uploadedImages.back_id_Image}
                        alt="Back ID Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <Upload className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-2 bg-gray-50 text-center">
                    <p className="text-sm font-medium">Back Side</p>
                  </div>
                </div>
              </div>

              <Button
                className="mt-6 bg-[#00494c] hover:bg-[#00494c]/90 text-white"
                onClick={() => setShowConfirmation(true)}
              >
                Review and Confirm
              </Button>
            </div>

            {/* Confirmation Dialog */}
            <DocumentConfirmationDialog
              isOpen={showConfirmation}
              onClose={() => setShowConfirmation(false)}
              onConfirm={verifyIdentity}
              uploadedImages={uploadedImages}
              documentType={selectedDocument || ""}
            />
          </>
        )}
      </div>
    );
  };

  return (
    <>
    <Toaster />
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-4xl p-6 space-y-6">
        <div className="flex items-center">
          {currentStep > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="mr-2"
              onClick={handleBack}
              disabled={isLoading}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          )}
          <h1 className="text-2xl font-bold">Verify Identity</h1>
        </div>

        <Progress />

        <div className="min-h-[400px] flex flex-col">
          <div className="flex-1">
            {currentStep === 0 && <DocumentSelection />}
            {currentStep === 1 && <DocumentUpload />}
              {currentStep === 2 && <VerificationInProgress />}
          </div>
          <div className="mt-8 flex flex-col space-y-4">
            <Button
              className={`w-full ${!(currentStep === 0 && !selectedDocument) ? "bg-[#00494c] hover:bg-[#00494c]/90" : ""}`}
              onClick={handleNext}
              disabled={(currentStep === 0 && !selectedDocument) || !areAllImagesUploaded() || isLoading}
            >
              {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
              ) : currentStep === STEPS.length - 1 ? (
              "Complete Verification"
              ) : (
              <div>
                <span className="block md:hidden">Continue</span>
                <span className="hidden md:block">Save and proceed to upload document</span>
              </div>
              )}
            </Button>
            <div className="flex items-center justify-center">
              <Checkbox
              id="confirmSelection"
              className="mr-2"
              required
              />
              <label htmlFor="confirmSelection" className="text-xs text-gray-500">
                This information is used for personal verification only, and user dater not saved kept private and confidential by Deeptrack.
              </label>
            </div>
          </div>
        </div>
      </Card>
    </div>
    </>
  );
};

export default VerifyIdentityForm;