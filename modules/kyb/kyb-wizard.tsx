"use client";

import { Button } from "@/components/ui/button";
import type { KYBStepData } from "@/lib/kyb-types";
import { createInitialKYBData } from "@/lib/kyb-types";
import { cn } from "@/lib/utils";
import { BusinessInfoStep } from "@/modules/kyb/steps/business-info-step";
import { DocumentsStep } from "@/modules/kyb/steps/documents-step";
import { ReviewStep } from "@/modules/kyb/steps/review-step";
import { UBODirectorsStep } from "@/modules/kyb/steps/ubo-directors-step";
import {
	Building2,
	CheckCircle,
	ClipboardCheck,
	FileText,
	Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const STEPS = [
	{ id: 1, title: "Business Info", icon: Building2 },
	{ id: 2, title: "Business Documents", icon: FileText },
	{ id: 3, title: "UBO & Directors", icon: Users },
	{ id: 4, title: "Review & Submit", icon: ClipboardCheck },
];

interface KYBWizardProps {
	onComplete?: (reference: string) => void;
}

export function KYBWizard({ onComplete }: KYBWizardProps) {
	const [currentStep, setCurrentStep] = useState(1);
	const [data, setData] = useState<KYBStepData>(createInitialKYBData());
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [submittedReference, setSubmittedReference] = useState<string | null>(
		null,
	);

	function updateData(updates: Partial<KYBStepData>) {
		setData((prev) => ({ ...prev, ...updates }));
	}

	function handleBusinessInfoSubmit(values: KYBStepData["businessInfo"]) {
		updateData({ businessInfo: values });
		setCurrentStep(2);
		window.scrollTo({ top: 0, behavior: "smooth" });
	}

	function handleDocumentsSubmit(values: KYBStepData["documents"]) {
		updateData({ documents: values });
		setCurrentStep(3);
		window.scrollTo({ top: 0, behavior: "smooth" });
	}

	function handleUBOSubmit(values: KYBStepData["ubos"]) {
		updateData({ ubos: values });
		setCurrentStep(4);
		window.scrollTo({ top: 0, behavior: "smooth" });
	}

	function handleSubmitSuccess(reference: string) {
		setIsSubmitted(true);
		setSubmittedReference(reference);
		if (onComplete) {
			onComplete(reference);
		}
	}

	function goBack() {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1);
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	}

	if (isSubmitted) {
		return (
			<div className="max-w-3xl mx-auto">
				<div className="bg-white rounded-2xl shadow-sm border p-8 text-center">
					<div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
						<CheckCircle className="w-10 h-10 text-green-600" />
					</div>
					<h2 className="text-2xl font-bold text-gray-900 mb-4">
						Submission Received
					</h2>
					<p className="text-gray-600 mb-6 max-w-md mx-auto">
						Your KYB submission has been received. All listed UBOs and directors
						will receive an email from Shufti Pro to complete their identity
						verification. You will be notified once the review is complete.
					</p>
					{submittedReference && (
						<p className="text-sm text-gray-500 mb-6">
							Reference:{" "}
							<span className="font-mono font-medium">
								{submittedReference}
							</span>
						</p>
					)}
					<div className="flex justify-center">
						<Button asChild>
							<Link href="/kyb">Back to Dashboard</Link>
						</Button>
					</div>
					<p className="text-sm text-gray-500 mt-4">
						Redirecting to dashboard in 5 seconds...
					</p>
				</div>
				<AutoRedirect />
			</div>
		);
	}

	return (
		<div className="max-w-3xl mx-auto">
			<div className="mb-8">
				<div className="flex items-center justify-between">
					{STEPS.map((step, index) => {
						const isCompleted = currentStep > step.id;
						const isCurrent = currentStep === step.id;
						const Icon = step.icon;

						return (
							<div key={step.id} className="flex items-center">
								<div className="flex flex-col items-center">
									<div
										className={cn(
											"w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
											isCompleted && "bg-green-600 border-green-600 text-white",
											isCurrent && "bg-primary border-primary text-white",
											!isCompleted &&
												!isCurrent &&
												"bg-gray-50 border-gray-300 text-gray-400",
										)}
									>
										{isCompleted ? (
											<CheckCircle className="w-5 h-5" />
										) : (
											<Icon className="w-5 h-5" />
										)}
									</div>
									<span
										className={cn(
											"text-xs mt-2 font-medium hidden sm:block",
											isCurrent && "text-primary",
											!isCurrent && "text-gray-500",
										)}
									>
										{step.title}
									</span>
								</div>
								{index < STEPS.length - 1 && (
									<div
										className={cn(
											"w-12 sm:w-20 h-0.5 mx-2",
											currentStep > step.id ? "bg-green-600" : "bg-gray-300",
										)}
									/>
								)}
							</div>
						);
					})}
				</div>
			</div>

			<div className="bg-white rounded-2xl shadow-sm border p-6 sm:p-8">
				{currentStep === 1 && (
					<BusinessInfoStep
						initialData={data.businessInfo}
						onSubmit={handleBusinessInfoSubmit}
					/>
				)}
				{currentStep === 2 && (
					<DocumentsStep
						initialData={data.documents}
						onSubmit={handleDocumentsSubmit}
						onBack={goBack}
					/>
				)}
				{currentStep === 3 && (
					<UBODirectorsStep
						initialData={data.ubos}
						onSubmit={handleUBOSubmit}
						onBack={goBack}
					/>
				)}
				{currentStep === 4 && (
					<ReviewStep
						data={data}
						onBack={goBack}
						onSubmitSuccess={handleSubmitSuccess}
					/>
				)}
			</div>
		</div>
	);
}

function AutoRedirect() {
	if (typeof window !== "undefined") {
		setTimeout(() => {
			window.location.href = "/kyb";
		}, 5000);
	}
	return null;
}
