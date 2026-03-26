
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function LogoLink() {
	return (
		<Link href="/">
			<Image
				src="/deeptrack-logo.png"
				alt="Deeptrack Sentinel Logo"
				width={128}
				height={28}
				className="h-auto"
			/>
		</Link>
	);
}