'use client'

import { useState } from "react";
import { ChevronLeft, Camera, Upload, Loader2, Check } from "lucide-react";
import { FaIdCard, FaRegIdCard, FaPassport } from "react-icons/fa";
import VerificationResults from "./verificationResults";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import FileUpload from "@/components/file-upload";
import { Checkbox } from "@/components/ui/checkbox";
import toast, { Toaster } from "react-hot-toast";

type DocumentType = "id-card" | "drivers-license" | "passport" | "disability-certificate" | "kra-pin-certificate";

interface Step {
  title: string;
  description: string;
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
    details: Record<string, unknown>;
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

// Fixed API endpoint and key handling
const API_ENDPOINT = "https://api.deeptrack.io/v1/kyc/deeptrackai-id";
const API_KEY = "555865ca-d030-4ce6-94a0-da42c514ff5d";

const VerifyIdentityForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDocument, setSelectedDocument] = useState<DocumentType | null>(null);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResults, setVerificationResults] = useState<VerificationResponse | null>(null);
  
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
        setIsLoading(false);
        return;
      }

      // Log the request data for debugging
      console.log("Sending verification request with data:", uploadedImages);

      // Make the API request with correct headers and endpoint
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify(uploadedImages)
      });

      // Log response status for debugging
      console.log("API response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error response:", errorText);
        throw new Error(`Verification failed: ${response.status} ${errorText}`);
      }

      const data: VerificationResponse = await response.json();
      console.log("Verification successful, received data:", data);

      // Store the verification results
      setVerificationResults(data);

      // Mark verification as complete
      setVerificationComplete(true);
    } catch (error) {
      console.error('Verification error:', error);
      toast.error("Verification failed. Please try again.");
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
          className="h-full bg-[#00494c] transform-gpu rounded-full transition-transform duration-500 ease-out"
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
      </div>
    </div>
  );

  const DocumentUpload = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Upload Documents</h2>
      <p className="text-gray-500">Please upload clear photos of your documents</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="upload-area flex flex-col items-center overflow-hidden justify-center text-center p-4 border rounded-lg">
          <Camera className="w-8 h-8 text-[#00494c] mb-2" />
          <p className="font-medium">Face Image</p>
          <p className="text-sm text-gray-500 mt-1">Clear and Lively</p>
          <div className="mt-2 w-full">
            <FileUpload endpoint="imageUploader" onChange={handleFaceImageUpload} />
          </div>
          {uploadedImages.face_Image && (
            <div className="mt-2 text-green-600 text-sm flex items-center">
              <Check className="w-4 h-4 mr-1" /> Uploaded
            </div>
          )}
        </div>
        <div className="upload-area flex flex-col items-center overflow-hidden justify-center text-center p-4 border rounded-lg">
          <Upload className="w-8 h-8 text-[#00494c] mb-2" />
          <p className="font-medium">Front Side</p>
          <p className="text-sm text-gray-500 mt-1">JPG, PNG, WebP</p>
          <div className="mt-2 w-full">
            <FileUpload endpoint="imageUploader" onChange={handleFrontImageUpload} />
          </div>
          {uploadedImages.front_id_Image && (
            <div className="mt-2 text-green-600 text-sm flex items-center">
              <Check className="w-4 h-4 mr-1" /> Uploaded
            </div>
          )}
        </div>
        <div className="upload-area flex flex-col overflow-hidden p-4 items-center justify-center text-center border rounded-lg">
          <Upload className="w-8 h-8 text-[#00494c] mb-2" />
          <p className="font-medium">Back Side</p>
          <p className="text-sm text-gray-500 mt-1">JPG, PNG, WebP</p>
          <div className="mt-2 w-full">
            <FileUpload endpoint="imageUploader" onChange={handleBackImageUpload} />
          </div>
          {uploadedImages.back_id_Image && (
            <div className="mt-2 text-green-600 text-sm flex items-center">
              <Check className="w-4 h-4 mr-1" /> Uploaded
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const VerificationInProgress = () => (
    <div className="text-center py-12 flex flex-col items-center justify-center">
      {isLoading ? (
        <>
          <Loader2 className="w-12 h-12 text-[#00494c] animate-spin mb-4" />
          <h2 className="text-xl font-semibold">Verification in Progress</h2>
          <p className="text-gray-500 mt-2">Please wait while we verify your documents</p>
        </>
      ) : (
        <>
          <h2 className="text-xl font-semibold">Ready to Verify</h2>
          <p className="text-gray-500 mt-2">Click the Complete Verification button to proceed</p>
        </>
      )}
    </div>
  );

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