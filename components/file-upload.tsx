"use client";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { UploadDropzone } from "@/utils/uploadthing";
import React from "react";
import toast, { Toaster } from "react-hot-toast";

type UploadthingResponse = {
	url: string;
	name: string;
	key: string;
	size: number;
	type: string;
}[];

type Props = {
	onChange: (res: UploadthingResponse) => void;
	endpoint: keyof typeof ourFileRouter;
	onProgress?: (progress: number) => void;
	onError?: () => void;
	disabled?: boolean;
};

const FileUpload = ({ onChange, endpoint, onProgress, onError, disabled = false }: Props) => {
	return (
		<>
			<Toaster />
			<UploadDropzone
				className={`ut-label:text-sm ut-label:italic ut-allowed-content:ut-uploading:text-primary-foreground ut-button:bg-white ut-button:text-black underline ut-button:ut-readying:bg-primary/50 ut-label:hover:text-primary/50 ut-label:text-primary bg-transparent ut-button:hover:bg-customTeal/80 ut-button:hover:cursor-pointer ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
				appearance={{
					button:{
						
					}
				}}
				endpoint={endpoint}
				onUploadBegin={() => {
					if (onProgress) onProgress(1); // Start with a small progress value
				}}
				onUploadProgress={(progress) => {
					if (onProgress) onProgress(progress);
				}}
				onClientUploadComplete={(res) => {
					onChange(
						res.map((file) => ({
							url: file.ufsUrl,
							key: file.key,
							name: file.name,
							size: file.size,
							type: file.type,
						})),
					);
					if (onProgress) onProgress(100);
				}}
				onUploadError={(error: Error) => {
					toast.error(error.message);
					if (onProgress) onProgress(0);
					if (onError) onError();
				}}
			/>
		</>
	);
};

export default FileUpload;