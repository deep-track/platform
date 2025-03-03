import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    uploadedImages: {
        face_Image: string;
        front_id_Image: string;
        back_id_Image: string;
    };
    documentType: string;
}

const DocumentConfirmationDialog: React.FC<DocumentConfirmationDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    uploadedImages,
    documentType
}) => {
    if (!isOpen) return null;

    // Map document type to readable title
    const getDocumentTitle = () => {
        switch (documentType) {
            case "passport": return "Passport";
            case "id-card": return "ID Card";
            case "drivers-license": return "Driver's License";
            case "disability-certificate": return "Disability Certificate";
            case "kra-pin-certificate": return "KRA PIN Certificate";
            default: return "Identification Document";
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">
            <div className="bg-white rounded-lg w-full max-w-4xl">
                <div className="p-6 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-teal-700/90">Confirm before verification</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <p className="text-gray-600 pb-4 text-start">
                        Just one more check to confirm that these are the documents you want to verify
                    </p>

                    <div className="grid grid-cols-3 gap-6">
                        <div className="space-y-3">
                            <p className="font-medium text-center">{getDocumentTitle()} Photo</p>
                            <div className="relative group rounded-lg overflow-hidden border border-gray-200">
                                <img
                                    src={uploadedImages.face_Image}
                                    alt="Face"
                                    className="w-full aspect-square object-cover"
                                />
                                <button className="absolute top-2 right-2 bg-black/70 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X className="h-4 w-4 text-white" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="font-medium text-center">Front side</p>
                            <div className="relative group rounded-lg overflow-hidden border border-gray-200">
                                <img
                                    src={uploadedImages.front_id_Image}
                                    alt="Front ID"
                                    className="w-full aspect-square object-cover"
                                />
                                <button className="absolute top-2 right-2 bg-black/70 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X className="h-4 w-4 text-white" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="font-medium text-center">Back side</p>
                            <div className="relative group rounded-lg overflow-hidden border border-gray-200">
                                <img
                                    src={uploadedImages.back_id_Image}
                                    alt="Back ID"
                                    className="w-full aspect-square object-cover"
                                />
                                <button className="absolute top-2 right-2 bg-black/70 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X className="h-4 w-4 text-white" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={onConfirm}
                        className="w-full bg-[#00494c] hover:bg-black text-white font-medium py-3 rounded-lg mt-6"
                    >
                        Save and proceed to view results
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DocumentConfirmationDialog;