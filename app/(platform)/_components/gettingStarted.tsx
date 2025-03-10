"use client"

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { JSX, ReactNode, useState } from "react";
import VerificationDialog from "./verifications/verification-dialog";


interface BannerProps {
    title: string;
    description: string;
    buttonText: string;
    onButtonClick: () => void;
    imageSrc?: string;
    decorationSrc?: string;
}

interface ActionButtonProps {
    text: string;
    onClick: () => void; 
    className?: string;
}

export const ActionButton = ({
	text,
	onClick,
	className = "",
}: ActionButtonProps): JSX.Element => (
	<Button
		onClick={onClick}
		className={`bg-white hover:bg-customTeal/90 text-black font-bold py-2 px-4 md:py-2 md:px-6 rounded uppercase tracking-wide transition-colors text-sm md:text-base ${className}`}
	>
		{text}
	</Button>
);

export const Banner = ({
    title,
    description,
    buttonText,
    onButtonClick,
    imageSrc = "/banner-img.png",
    decorationSrc = "/banner-img-01.png"
}: BannerProps): JSX.Element => {
    return (
        <div className="bg-black rounded-xl text-white px-4 lg:px-6 min-h-[300px] md:min-h-[250px] w-full max-w-[1640px] mx-auto">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-16 items-center py-6">
                <div className="space-y-3 md:space-y-4">
                    <h2 className="text-xl md:text-3xl lg:text-2xl font-bold tracking-tight">
                        {title}
                    </h2>
                    <p className="text-gray-400 leading-relaxed text-base md:text-lg">
                        {description}
                    </p>
                    <ActionButton
                    className="mt-4 md:mt-6"
                    text={buttonText}
                    onClick={onButtonClick}
                    />
                </div>
                <div className="relative flex justify-center lg:justify-end items-center order-first lg:order-last">
                    <div className="relative w-[160px] h-[160px] md:w-[200px] md:h-[200px] lg:w-[320px] lg:h-[220px]">
                        <Image
                            src={imageSrc}
                            alt="Banner image"
                            fill
                            className="object-cover drop-shadow-lg z-10"
                            priority
                            sizes="(max-width: 768px) 160px, 200px"
                        />
                    </div>
                    <div className="absolute w-[80px] h-[80px] md:w-[100px] md:h-[100px] right-0 md:-right-4 top-1/2 transform -translate-y-1/2">
                        <Image
                            src={decorationSrc}
                            alt="Decorative element"
                            fill
                            className="object-cover opacity-80 animate-pulse"
                            priority
                            sizes="(max-width: 768px) 80px, 100px"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Page component type
interface PageProps {
    children?: ReactNode;
}

// Example usage in a page component
export default function GettingStarted({ }: PageProps): JSX.Element {

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    return (
        <>
            <Banner
                title="Get started"
                description="Ensure the validity of individuals' documents, tax status, images, and online reputation to maintain proper compliance and prevent money laundering."
                buttonText="CONDUCT VERIFICATION"
                onButtonClick={() => setIsDialogOpen(true)}
            />
            <VerificationDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
            />
        </>
    );
}