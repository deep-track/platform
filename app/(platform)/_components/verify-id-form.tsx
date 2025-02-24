'use client'
import { useState } from "react";
import { ChevronLeft, Camera, Upload, FileText, CreditCard } from "lucide-react";
import VerificationResults from "./verificationResults";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner"
import FileUpload from "@/components/file-upload";

type DocumentType = "id-card" | "drivers-license" | "passport";

interface Step {
  title: string;
  description: string;
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

  const handleDocumentSelect = (type: DocumentType) => {
    setSelectedDocument(type);
  };

  const handleNext = () => {
    if (currentStep === 0 && !selectedDocument) {
      toast("Please select a document type" );
      return;
    }
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else if (currentStep === STEPS.length - 1) {
      setVerificationComplete(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  if (verificationComplete) {
    return <VerificationResults />;
  }

  const Progress = () => (
    <div className="w-full mb-8">
      <div className="h-2 bg-gray-200 rounded-full relative">
        <div
          className="h-full bg-customTeal rounded-full transition-all duration-500 ease-out"
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
          className={`relative p-6 border rounded-lg transition-all duration-300 hover:border-customTeal hover:shadow-md cursor-pointer ${selectedDocument === "id-card" ? "border-customTeal shadow-md" : ""}`}
          onClick={() => handleDocumentSelect("id-card")}
        >
          <CreditCard className="w-6 h-6 text-customTeal mb-2" />
          <h3 className="font-medium">Government-Issued ID Card</h3>
        </div>
        <div
          className={`relative p-6 border rounded-lg transition-all duration-300 hover:border-customTeal hover:shadow-md cursor-pointer ${selectedDocument === "drivers-license" ? "border-customTeal shadow-md" : ""}`}
          onClick={() => handleDocumentSelect("drivers-license")}
        >
          <FileText className="w-6 h-6 text-customTeal mb-2" />
          <h3 className="font-medium">Driver&apos;s License</h3>
        </div>
        <div
          className={`relative p-6 border rounded-lg transition-all duration-300 hover:border-customTeal hover:shadow-md cursor-pointer ${selectedDocument === "passport" ? "border-customTeal shadow-md" : ""}`}
          onClick={() => handleDocumentSelect("passport")}
        >
          <FileText className="w-6 h-6 text-customTeal mb-2" />
          <h3 className="font-medium">Passport</h3>
        </div>
      </div>
    </div>
  );

  const DocumentUpload = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Upload Documents</h2>
      <p className="text-gray-500">Please upload clear photos of your documents</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="upload-area flex flex-col items-center overflow-hidden justify-center text-center">
          <Camera className="w-8 h-8 text-customTeal mb-2" />
          <p className="font-medium">Face Image</p>
          <p className="text-sm text-gray-500 mt-1">Clear and Lively</p>
          <FileUpload endpoint="imageUploader" onChange={(res) => {res[0].url, res[0].key} } />
        </div>
        <div className="upload-area flex flex-col items-center overflow-hidden justify-center text-center">
          <Upload className="w-8 h-8 text-customTeal mb-2" />
          <p className="font-medium">Front Side</p>
          <p className="text-sm text-gray-500 mt-1">JPG, PNG, WebP </p>
          <FileUpload endpoint="imageUploader" onChange={(res) => {res[0].url, res[0].key} } />
        </div>
        <div className="upload-area flex flex-col overflow-hidden p-4 items-center justify-center text-center">
          <Upload className="w-8 h-8 text-customTeal mb-2" />
          <p className="font-medium">Back Side</p>
          <p className="text-sm text-gray-500 mt-1">JPG, PNG, WebP </p>
          <FileUpload endpoint="imageUploader" onChange={(res) => {res[0].url, res[0].key} } />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-3xl p-6 space-y-6">
        <div className="flex items-center">
          {currentStep > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="mr-2"
              onClick={handleBack}
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
            {currentStep === 2 && (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold">Verification in Progress</h2>
                <p className="text-gray-500 mt-2">Please wait while we verify your documents</p>
              </div>
            )}
          </div>
          <div className="mt-8 flex flex-col space-y-4">
            <Button
              className={`w-full ${!(currentStep === 0 && !selectedDocument) ? "bg-customTeal hover:bg-customTeal/90" : ""}`}
              onClick={handleNext}
              disabled={currentStep === 0 && !selectedDocument}
            >
              {currentStep === STEPS.length - 1 ? "Complete Verification" : "Continue"}
            </Button>
            <p className="text-xs text-center text-gray-500">
              This information is used for personal verification only and user data is kept private and confidential.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default VerifyIdentityForm;