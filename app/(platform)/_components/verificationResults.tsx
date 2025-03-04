import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import ErrorModal from "./errorModal";

interface VerificationData {
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

// Process the verification data into a format suitable for display
const processVerificationData = (data: VerificationData) => {
  // Extract text from documents
  const frontIdData = data.document_verification.find(doc => doc.documentName === "front_id_Image")?.text || "";
  const backIdData = data.document_verification.find(doc => doc.documentName === "back_id_Image")?.text || "";

  // Parse personal information from ID text
  const extractData = (text: string, pattern: RegExp): string => {
    const match = text.match(pattern);
    return match ? match[1].trim() : "";
  };

  // Extract information from front ID
  const idNumber = extractData(frontIdData, /ID NUMBER:?\s*(\d+)/i);
  const fullName = extractData(frontIdData, /FULL NAMES?\s*([A-Z\s]+)/i);
  const sex = extractData(frontIdData, /SEX\s*([A-Z]+)/i);
  const dateOfBirth = extractData(frontIdData, /DATE OF BIRTH\s*([\d\.]+)/i);
  const districtOfBirth = extractData(frontIdData, /ICT OF BIRTH\s*([A-Z\s]+)/i);
  const placeOfIssue = extractData(frontIdData, /PLACE OF ISSUE\s*([A-Z\s]+)/i);
  const dateOfIssue = extractData(frontIdData, /DATE OF ISSUE\s*([\d\.]+)/i);
  const serialNumber = extractData(frontIdData, /SERIAL NUMBER:?\s*(\d+)/i);

  // Extract information from back ID
  const district = extractData(backIdData, /^([A-Z]+)/m);
  const location = extractData(backIdData, /LOCATION\s*([A-Z\s]+)/i);
  const subLocation = extractData(backIdData, /SUB-LOCATION\s*([A-Z\s]+)/i);

  return {
    idNumber,
    name: fullName,
    sex,
    dateOfBirth,
    districtOfBirth,
    placeOfIssue,
    dateOfIssue,
    serialNumber,
    pin: extractData(backIdData, /([A-Z0-9]+)$/m), // Last line for PIN or MRZ
    districtOfResidence: district,
    location,
    serialNumberZone: subLocation
  };
};

// Calculate pass rate based on verification data
const calculatePassRate = (data: VerificationData): number => {
  let totalChecks = 0;
  let passedChecks = 0;

  // Ensure document_verification is defined and is an array
  if (Array.isArray(data.document_verification)) {
    // Count verification data checks
    data.document_verification.forEach(doc => {
      if (Array.isArray(doc.verification_data)) {
        doc.verification_data.forEach(check => {
          totalChecks++;
          if (check.fraudFlag === "PASS") {
            passedChecks++;
          }
        });
      }
    });
  }

  // Add face match check
  totalChecks++;
  if (data.face_match && data.face_match.face_match) {
    passedChecks++;
  }

  return totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 0;
};

interface VerificationResultsProps {
  verificationData?: VerificationData;
  error?: boolean;
  onRetry?: () => void;
}

const VerificationResults = ({ verificationData, error, onRetry }: VerificationResultsProps) => {
  
  const [isModalOpen, setIsModalOpen] = useState(error || false);

  if (!verificationData) {
    return null;
  }

  // Process the data
  const parsedData = processVerificationData(verificationData);
  const passRate = calculatePassRate(verificationData).toFixed(1);
  const isVerificationSuccessful = verificationData.face_match.face_match &&
    verificationData.document_verification.every(doc =>
      Array.isArray(doc.verification_data) && doc.verification_data.every(check => check.fraudFlag === "PASS")
    );

  const ResultSection = ({ title, items }: { title: string; items: { label: string; status: "PASSED" | "FAILED" }[] }) => (
    <div className="bg-gray-50 rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold text-teal-700 mb-4">{title}</h3>
      <div className="space-y-5">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-gray-700" />
              <span className="text-gray-700 font-medium">{item.label}</span>
            </div>
            <span className={`px-4 py-1 text-xs font-medium uppercase rounded ${item.status === "PASSED"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
              }`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const documentChecks = verificationData.document_verification.flatMap(doc =>
    Array.isArray(doc.verification_data) ? doc.verification_data.map(check => ({
      label: check.type
        .replace("fraud_signals_", "")
        .split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      status: check.fraudFlag === "PASS" ? "PASSED" : "FAILED" as "PASSED" | "FAILED"
    })) : []
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="p-6 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4 -m-6 mb-6">
            <div className={`flex flex-col items-center justify-center w-full sm:w-[80%] md:w-[60%] lg:w-[497px] mx-auto px-6 py-2 rounded-b-full font-medium ${isVerificationSuccessful
              ? "bg-cyan-100 text-black"
              : "bg-red-100 text-red-800"
              }`}>
              {isVerificationSuccessful ? "VERIFICATION SUCCESSFUL" : "VERIFICATION FAILED"}
            </div>
            <div className="flex flex-col w-[40%] sm:w-[30%] md:w-[25%] lg:w-[250px] items-center justify-center mx-auto px-4 py-1 bg-green-500 text-white text-sm font-semibold">
              {passRate}% PASS RATE
            </div>
          </div>

          {/* Personal Information Grid - Redesigned for better responsiveness */}
          <div className="bg-[#3D3D3D] text-white p-4 sm:p-6 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6">
              {/* First row */}
              <div className="space-y-1">
                <div className="text-gray-400 text-xs sm:text-sm">ID NUMBER</div>
                <div className="font-medium">{parsedData.idNumber || "-"}</div>
              </div>
              <div className="space-y-1">
                <div className="text-gray-400 text-xs sm:text-sm">NAME</div>
                <div className="font-medium">{parsedData.name || "-"}</div>
              </div>
              <div className="space-y-1">
                <div className="text-gray-400 text-xs sm:text-sm">SEX</div>
                <div className="font-medium">{parsedData.sex || "-"}</div>
              </div>

              {/* Second row */}
              <div className="space-y-1">
                <div className="text-gray-400 text-xs sm:text-sm">DATE OF BIRTH</div>
                <div className="font-medium">{parsedData.dateOfBirth || "-"}</div>
              </div>
              <div className="space-y-1">
                <div className="text-gray-400 text-xs sm:text-sm">DISTRICT OF BIRTH</div>
                <div className="font-medium">{parsedData.districtOfBirth || "-"}</div>
              </div>
              <div className="space-y-1">
                <div className="text-gray-400 text-xs sm:text-sm">PLACE/DISTRICT OF ISSUE</div>
                <div className="font-medium">{parsedData.placeOfIssue || "-"}</div>
              </div>

              {/* Third row */}
              <div className="space-y-1">
                <div className="text-gray-400 text-xs sm:text-sm">DATE OF ISSUE</div>
                <div className="font-medium">{parsedData.dateOfIssue || "-"}</div>
              </div>
              <div className="space-y-1">
                <div className="text-gray-400 text-xs sm:text-sm">SERIAL NUMBER</div>
                <div className="font-medium">{parsedData.serialNumber || "-"}</div>
              </div>
              <div className="space-y-1">
                <div className="text-gray-400 text-xs sm:text-sm">PIN</div>
                <div className="font-medium">{parsedData.pin || "-"}</div>
              </div>

              {/* Fourth row */}
              <div className="space-y-1">
                <div className="text-gray-400 text-xs sm:text-sm">DISTRICT OF RESIDENCE</div>
                <div className="font-medium">{parsedData.districtOfResidence || "-"}</div>
              </div>
              <div className="space-y-1">
                <div className="text-gray-400 text-xs sm:text-sm">LOCATION</div>
                <div className="font-medium">{parsedData.location || "-"}</div>
              </div>
              <div className="space-y-1">
                <div className="text-gray-400 text-xs sm:text-sm">SERIAL NUMBER</div>
                <div className="font-medium">{parsedData.serialNumberZone || "-"}</div>
              </div>
            </div>
          </div>

          {/* Verification Results Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ResultSection
              title="Image quality and metadata"
              items={documentChecks.filter(check =>
                check.label.includes("Identity Document") ||
                check.label.includes("Image Manipulation") ||
                check.label.includes("Online Duplicate")
              )}
            />
            <ResultSection
              title="Returning Personal Info"
              items={[
                { label: "Records found in the Government Database", status: "PASSED" },
                { label: "Positively matches Government Records", status: "PASSED" }
              ]}
            />
            <ResultSection
              title="Verifying Attachments"
              items={[
                { label: "SELFIE VIDEO looks authentic", status: "PASSED" },
                { label: "FRONT ID looks authentic", status: "PASSED" },
                { label: "BACK ID looks authentic", status: "PASSED" }
              ]}
            />
            <ResultSection
              title="Face match to document"
              items={[
                {
                  label: "No IMPERSONATION FRAUD detected",
                  status: verificationData.face_match.face_match ? "PASSED" : "FAILED"
                },
                { label: "Deepfake detection", status: "PASSED" },
                { label: "No Facial inconsistencies detected", status: "PASSED" }
              ]}
            />
          </div>

          {/* Face Match Details Section */}
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-teal-700 mb-4">Face Match Details</h3>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-gray-700" />
                  <span className="text-gray-700 font-medium">Face Match Result</span>
                </div>
                <span className={`px-4 py-1 text-xs font-medium uppercase rounded ${verificationData.face_match.face_match
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
                  }`}>
                  {verificationData.face_match.face_match ? "PASSED" : "FAILED"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-gray-700" />
                  <span className="text-gray-700 font-medium">Similarity</span>
                </div>
                <span className="text-gray-700 font-medium">
                  {verificationData.face_match.details.similarity.toFixed(2)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-gray-700" />
                  <span className="text-gray-700 font-medium">Confidence</span>
                </div>
                <span className="text-gray-700 font-medium">
                  {verificationData.face_match.details.confidence.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="flex justify-center sm:justify-end">
            <Link href="/verifications">
              <button className="text-cyan-500 hover:text-cyan-600 font-medium flex items-center gap-2">
                Go to All Verifications
                <span className="text-lg">»</span>
              </button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Modal for failure or retry */}
      <ErrorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Verification Failed</h2>
          <p className="text-gray-700 mb-6">There was an issue with the verification process. Please try again.</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Close
            </button>
            <button
              onClick={onRetry}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </ErrorModal>
    </div>
  );
};

export default VerificationResults;