export interface LoginResponse {
    user:         User;
    accessToken:  string;
    refreshToken: string;
}

export interface User {
    id:   number;
    name: string;
    role: string;
}

export enum Role {
  ADMIN = "admin",
  USER = "user",
}

export interface Step {
  title: string;
  description: string;
}

export type DocumentType = "id-card" | "drivers-license" | "passport" | "disability-certificate" | "kra-pin-certificate";

export interface UploadProgressProps {
  progress: number;
  fileName?: string;
  onCancel: () => void;
  onRetry: () => void;
  isUploading: boolean;
  isError: boolean;
}

// Define the verification response interface
export interface VerificationResponse {
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
export interface FileUploadResponse {
  url: string;
  name: string;
}
