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
};

const FileUpload = ({ onChange, endpoint }: Props) => {
	return (
		<>
		<Toaster />
		<UploadDropzone
			className=" ut-label:text-sm  ut-label:italic ut-allowed-content:ut-uploading:text-primary-foreground ut-button:bg-white ut-button:text-black underline  ut-button:ut-readying:bg-primary/50 ut-label:hover:text-primary/50 ut-label:text-primary bg-transparent ut-button:hover:bg-customTeal  ut-button:hover:cursor-pointer"
			endpoint={endpoint}
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
			}}
			onUploadError={(error: Error) => {
				toast.error(error.message);
			}}
		/>
		</>
	);
};

export default FileUpload;