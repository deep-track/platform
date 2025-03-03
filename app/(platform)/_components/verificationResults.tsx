import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";

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
    details: Record<string, unknown>;
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

  // Count verification data checks
  data.document_verification.forEach(doc => {
    doc.verification_data.forEach(check => {
      totalChecks++;
      if (check.fraudFlag === "PASS") {
        passedChecks++;
      }
    });
  });

  // Add face match check
  totalChecks++;
  if (data.face_match.face_match) {
    passedChecks++;
  }

  return totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 0;
};

interface VerificationResultsProps {
  verificationData?: VerificationData;
}

const VerificationResults = ({ verificationData }: VerificationResultsProps) => {
  // If no verification data is provided, use mock data
  const data = verificationData || {
    message: "Verification processing successful",
    document_verification: [
      {
        documentName: "front_id_Image",
        text: "JAMHURI YA KENY\nREP\nLIC OF\nOF KENYA\nSERIAL NUMBER:\n248604638\nID NUMBER:\n36449235\nFULL NAMES\nWENSLOUS OTEMA EGESA\nDATE OF BIRTH\n15.09.1998\nSEX\nMALE\nICT OF BIRTH\nBUSIA\nPLACE OF ISSUE\nKITENGELA\nDATE OF ISSUE\n29.05.2018\nHOLDER'S SIGN.\n",
        verification_data: [
          { type: "fraud_signals_is_identity_document", fraudFlag: "PASS", normalizedValue: "PASS" },
          { type: "fraud_signals_suspicious_words", fraudFlag: "PASS", normalizedValue: "PASS" },
          { type: "fraud_signals_image_manipulation", fraudFlag: "PASS", normalizedValue: "PASS" },
          { type: "fraud_signals_online_duplicate", fraudFlag: "PASS", normalizedValue: "PASS" }
        ]
      },
      {
        documentName: "back_id_Image",
        text: "BUSIA\nMATAYOS\nLOCATION\nBUKHAYO WEST\nSUB-LOCATION\nESIKULU\nWith\nPRINCIPAL REGISTRAR'S SIGN\nT0278218341\nIDKYA2486046389<<4012<<<<<3452\n9809158M1805291<B036449235K<<3\nWENSLOUSKOTEMA<EGESA<<<<<<<<<<\n",
        verification_data: [
          { type: "fraud_signals_is_identity_document", fraudFlag: "PASS", normalizedValue: "PASS" },
          { type: "fraud_signals_suspicious_words", fraudFlag: "PASS", normalizedValue: "PASS" },
          { type: "fraud_signals_image_manipulation", fraudFlag: "PASS", normalizedValue: "PASS" },
          { type: "fraud_signals_online_duplicate", fraudFlag: "PASS", normalizedValue: "PASS" }
        ]
      }
    ],
    face_match: {
      face_match: true,
      details: {}
    }
  };

  // Process the data
  const parsedData = processVerificationData(data);
  const passRate = calculatePassRate(data).toFixed(1);
  const isVerificationSuccessful = data.face_match.face_match &&
    data.document_verification.every(doc =>
      doc.verification_data.every(check => check.fraudFlag === "PASS")
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

  // First, modify the DataRow component
  const DataRow = ({ label, value }: { label: string; value: string }) => (
    <div className="col-span-1">
      <div className="text-gray-400 text-sm font-medium mb-1">{label}</div>
      <div className="font-medium text-white">{value || "-"}</div>
    </div>
  );

  // Then update the Personal Information Grid
  <div className="bg-[#1E1E1E] text-white p-6 rounded-lg">
    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-6">
      {/* First row */}
      <DataRow label="ID NUMBER" value={parsedData.idNumber} />
      <DataRow label="NAME" value={parsedData.name} />
      <DataRow label="SEX" value={parsedData.sex} />

      {/* Second row */}
      <DataRow label="DATE OF BIRTH" value={parsedData.dateOfBirth} />
      <DataRow label="DISTRICT OF BIRTH" value={parsedData.districtOfBirth} />
      <DataRow label="PLACE/DISTRICT OF ISSUE" value={parsedData.placeOfIssue} />

      {/* Third row */}
      <DataRow label="DATE OF ISSUE" value={parsedData.dateOfIssue} />
      <DataRow label="SERIAL NUMBER" value={parsedData.serialNumber} />
      <DataRow label="PIN" value={parsedData.pin || "__"} />

      {/* Fourth row */}
      <DataRow label="DISTRICT OF RESIDENCE" value={parsedData.districtOfResidence} />
      <DataRow label="LOCATION" value={parsedData.location} />
      <DataRow label="SERIAL NUMBER" value={parsedData.serialNumberZone || "__"} />
    </div>
  </div>

  // Prepare verification sections
  const documentChecks = data.document_verification.flatMap(doc =>
    doc.verification_data.map(check => ({
      label: check.type
        .replace("fraud_signals_", "")
        .split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      status: check.fraudFlag === "PASS" ? "PASSED" : "FAILED" as "PASSED" | "FAILED"
    }))
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
                  status: data.face_match.face_match ? "PASSED" : "FAILED"
                },
                { label: "Deepfake detection", status: "PASSED" },
                { label: "No Facial inconsistencies detected", status: "PASSED" }
              ]}
            />
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
    </div>
  );
};

export default VerificationResults;