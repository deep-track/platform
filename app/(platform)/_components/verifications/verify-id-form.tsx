'use client'

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useUploadStatus } from "@/hooks/useUploadStatus";
import { verifyIdentityServerSide } from "@/lib/actions";
import { STEPS } from "@/lib/constants";
import {
	DocumentType,
	FileUploadResponse,
	VerificationResponse,
} from "@/lib/types";
import { Camera, ChevronLeft, Loader2, Upload } from "lucide-react";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FaIdCard, FaPassport, FaRegIdCard } from "react-icons/fa";
import { MdReceiptLong } from "react-icons/md";
import { TbCertificate } from "react-icons/tb";
import DocumentConfirmationDialog from "./documentConfirmation";
import { DocumentSelectionCard } from "./documentSelectionCard";
import MultiStepVerificationLoader from "./multistepLoader";
import { ProgressStepper } from "./progressStepper";
import { UploadProgress } from "./uploadProgress";
import { UploadSection } from "./uploadSection";
import VerificationResults from "./verificationResults";


const VerifyIdentityForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDocument, setSelectedDocument] = useState<DocumentType | null>(null);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResults, setVerificationResults] = useState<VerificationResponse | null>(null);
  const [_showConfirmation, setShowConfirmation] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [imageTypeToRemove, setImageTypeToRemove] = useState<'face' | 'frontId' | 'backId' | null>(null);

  const { uploadStatus, handleUploadProgress, handleUploadError, handleUploadCancel } = useUploadStatus()


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
    }
  };

  const handleFrontImageUpload = (res: FileUploadResponse[]) => {
    if (res && res.length > 0) {
      setUploadedImages(prev => ({
        ...prev,
        front_id_Image: res[0].url
      }));
    }
  };

  const handleBackImageUpload = (res: FileUploadResponse[]) => {
    if (res && res.length > 0) {
      setUploadedImages(prev => ({
        ...prev,
        back_id_Image: res[0].url
      }));
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

  // remove images on upload
  const handleRemoveImage = (type: 'face' | 'frontId' | 'backId') => {
    setImageTypeToRemove(type);
    setShowRemoveDialog(true);
  };

  const confirmRemoveImage = () => {
    if (imageTypeToRemove) {
      // Reset the corresponding image URL
      setUploadedImages(prev => ({
        ...prev,
        [imageTypeToRemove === 'face' ? 'face_Image' : imageTypeToRemove === 'frontId' ? 'front_id_Image' : 'back_id_Image']: ""
      }));

      // Reset upload status for the specific image type
      handleUploadCancel(imageTypeToRemove);

      // Optional: Show a toast notification
      toast.success("Image removed successfully");
    }
    setShowRemoveDialog(false);
    setImageTypeToRemove(null);
  };

  const handleUploadRetry = (type: 'face' | 'frontId' | 'backId') => {
    // Reset the error state and prepare for a new upload
    handleUploadError(type);

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
				<div className="min-h-screen flex items-center justify-center p-4 bg-muted">
					<Card className="w-full max-w-6xl">
						<CardHeader>
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

							<ProgressStepper currentStep={currentStep} />
						</CardHeader>
						<CardContent>
							<div className="min-h-[400px] flex flex-col">
								<div className="flex-1">
									{currentStep === 0 && (
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<DocumentSelectionCard
												icon={FaIdCard}
												title="Government-Issued ID Card"
												isSelected={selectedDocument === "id-card"}
												onClick={() => handleDocumentSelect("id-card")}
											/>
											{/* <DocumentSelectionCard
                    icon={FaRegIdCard}
                    title="Driving License"
                    isSelected={selectedDocument === "drivers-license"}
                    onClick={() => handleDocumentSelect("drivers-license")}
                  />
                  <DocumentSelectionCard
                    icon={FaPassport}
                    title="Passport"
                    isSelected={selectedDocument === "passport"}
                    onClick={() => handleDocumentSelect("passport")}
                  />
                  <DocumentSelectionCard
                    icon={TbCertificate}
                    title="Disability Certificate"
                    isSelected={selectedDocument === "disability-certificate"}
                    onClick={() => handleDocumentSelect("disability-certificate")}
                  />
                  <DocumentSelectionCard
                    icon={MdReceiptLong}
                    title="KRA PIN certificate"
                    isSelected={selectedDocument === "kra-pin-certificate"}
                    onClick={() => handleDocumentSelect("kra-pin-certificate")}
                  /> */}
										</div>
									)}
									{currentStep === 1 && (
										<div className="space-y-6">
											<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
												<UploadSection
													type="face"
													label="Face Image"
													description="Clear and Lively"
													uploadedUrl={uploadedImages.face_Image}
													uploadProgress={uploadStatus.face.progress}
													isUploading={uploadStatus.face.isUploading}
													isError={uploadStatus.face.isError}
													onRemove={() => handleRemoveImage("face")}
													onUpload={handleFaceImageUpload}
													onProgress={(p) => handleUploadProgress("face", p)}
													onError={() => handleUploadError("face")}
												/>
												<UploadSection
													type="frontId"
													label="Front Side"
													description="JPG, PNG, WebP"
													uploadedUrl={uploadedImages.front_id_Image}
													uploadProgress={uploadStatus.frontId.progress}
													isUploading={uploadStatus.frontId.isUploading}
													isError={uploadStatus.frontId.isError}
													onRemove={() => handleRemoveImage("frontId")}
													onUpload={handleFrontImageUpload}
													onProgress={(p) => handleUploadProgress("frontId", p)}
													onError={() => handleUploadError("frontId")}
												/>
												<UploadSection
													type="backId"
													label="Back Side"
													description="JPG, PNG, WebP"
													uploadedUrl={uploadedImages.back_id_Image}
													uploadProgress={uploadStatus.backId.progress}
													isUploading={uploadStatus.backId.isUploading}
													isError={uploadStatus.backId.isError}
													onRemove={() => handleRemoveImage("backId")}
													onUpload={handleBackImageUpload}
													onProgress={(p) => handleUploadProgress("backId", p)}
													onError={() => handleUploadError("backId")}
												/>
											</div>
											{(uploadStatus.face.isUploading ||
												uploadStatus.face.isError) && (
												<UploadProgress
													progress={uploadStatus.face.progress}
													fileName={uploadStatus.face.fileName}
													onCancel={() => handleUploadCancel("face")}
													onRetry={() => {
														handleUploadRetry("face");
														setUploadedImages((prev) => ({
															...prev,
															face_Image: "",
														}));
													}}
													isUploading={uploadStatus.face.isUploading}
													isError={uploadStatus.face.isError}
												/>
											)}

											{(uploadStatus.frontId.isUploading ||
												uploadStatus.frontId.isError) && (
												<UploadProgress
													progress={uploadStatus.frontId.progress}
													fileName={uploadStatus.frontId.fileName}
													onCancel={() => handleUploadCancel("frontId")}
													onRetry={() => {
														handleUploadRetry("frontId");
														setUploadedImages((prev) => ({
															...prev,
															front_id_Image: "",
														}));
													}}
													isUploading={uploadStatus.frontId.isUploading}
													isError={uploadStatus.frontId.isError}
												/>
											)}

											{(uploadStatus.backId.isUploading ||
												uploadStatus.backId.isError) && (
												<UploadProgress
													progress={uploadStatus.backId.progress}
													fileName={uploadStatus.backId.fileName}
													onCancel={() => handleUploadCancel("backId")}
													onRetry={() => {
														handleUploadRetry("backId");
														setUploadedImages((prev) => ({
															...prev,
															back_id_Image: "",
														}));
													}}
													isUploading={uploadStatus.backId.isUploading}
													isError={uploadStatus.backId.isError}
												/>
											)}
										</div>
									)}
									{currentStep === 2 && <VerificationInProgress />}
								</div>
								<div className="mt-8 flex flex-col space-y-4">
									<div className="flex items-center justify-center">
										{/* <Checkbox id="confirmSelection" className="mr-2" required /> */}
										<Label htmlFor="confirmSelection" className="">
											This information is used for personal verification only,
											and user data is not saved, kept private and confidential
											by Deeptrack.
										</Label>
									</div>
									<Button
										className={`w-full ${!(currentStep === 0 && !selectedDocument) ? "bg-[#00494c] hover:bg-[#00494c]/90" : ""}`}
										onClick={handleNext}
										disabled={
											(currentStep === 0 && !selectedDocument) ||
											!areAllImagesUploaded() ||
											isLoading
										}
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
												<span className="hidden md:block">
													Save and proceed to upload document
												</span>
											</div>
										)}
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				<AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Remove Image</AlertDialogTitle>
							<AlertDialogDescription>
								Are you sure you want to remove this image?
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel onClick={() => setShowRemoveDialog(false)}>
								Cancel
							</AlertDialogCancel>
							<AlertDialogAction onClick={confirmRemoveImage}>
								Remove
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</>
		);
};

export default VerifyIdentityForm;