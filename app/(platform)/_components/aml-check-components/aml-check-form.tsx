"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { CompanyCodes } from "@/lib/countries";
import type { PersonData, VerificationResponse } from "@/lib/types";
import axios from "axios";
import { ArrowLeft, Loader2, Search } from "lucide-react";
import type React from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import VerificationUI from "./aml-person-respone";

export default function AMLCheckForm() {
	const [checkType, setCheckType] = useState("person");
	const [isLoading, setIsLoading] = useState(false);
	const [verificationResult, setVerificationResult] =
		useState<VerificationResponse | null>(null);
	const [formData, setFormData] = useState({
		officialName: "",
		day: "",
		month: "",
		year: "",
		country: "",
		companyName: "",
		registrationNumber: "",
	});

	// Create person data from form data
	const personData: PersonData = {
		country: formData.country,
		idNumber: formData.registrationNumber || "N/A",
		name: formData.officialName || formData.companyName,
		dateOfBirth:
			formData.day && formData.month && formData.year
				? `${formData.day}/${formData.month}/${formData.year}`
				: "N/A",
		gender: "N/A", // Not collected in form
		stateOfExistence: "ALIVE",
		role: checkType === "business" ? "COMPANY" : "INDIVIDUAL",
		religiousAffiliation: "N/A", // Not collected in form
		ethnicity: "N/A", // Not collected in form
	};

	const countries = Object.keys(CompanyCodes);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSelectChange = (value: string) => {
		setFormData((prev) => ({ ...prev, country: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		setIsLoading(true);
		try {
			const apiKey = "d1aa9ed2-b982-4c09-97e8-fcbe4701b006";
			const birthDate =
				formData.day && formData.month && formData.year
					? `${formData.year}-${formData.month}-${formData.day}`
					: undefined;
			const nationality =
				formData.country &&
				CompanyCodes[formData.country as keyof typeof CompanyCodes]?.code;

			const response = await axios.get(
				`${process.env.NEXT_PUBLIC_API_URL}/aml/check-sanctions`,
				{
					params: {
						fullName:
							checkType === "person"
								? formData.officialName
								: formData.companyName,
						birthDate,
						nationality,
					},
					headers: {
						"x-api-key": "4e41d614-bcf8-4828-a7c0-8d194a12f301",
						"Content-Type": "application/json",
					},
				},
			);

			// Set the verification result from the API response
			setVerificationResult(response.data as VerificationResponse);
			toast.success("Check completed successfully!");
		} catch (error) {
			toast.error("Failed to complete check. Please try again.");
			console.error("API Error:", error);
			setVerificationResult(null);
		} finally {
			setIsLoading(false);
		}
	};

	const isSubmitDisabled = !formData.officialName && !formData.companyName;

	// If we have a verification result, show the verification UI
	if (verificationResult) {
		return (
			<div className="max-w-full w-full">
				<div className="mb-6 p-4">
					<Button onClick={() => setVerificationResult(null)}>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to AML Check Form
					</Button>
				</div>
				<VerificationUI
					verificationData={verificationResult}
					personData={personData}
				/>
			</div>
		);
	}

	// Otherwise, show the form
	return (
		<div className="max-w-4xl mx-auto p-6 bg-white rounded-lg">
			<div className="mb-6">
				<Button variant="outline">
					<ArrowLeft />
					Conduct AML Check
				</Button>
			</div>

			<form onSubmit={handleSubmit}>
				<RadioGroup
					value={checkType}
					onValueChange={setCheckType}
					className="space-y-8"
				>
					<div className="space-y-4">
						<div className="flex items-center">
							<RadioGroupItem
								value="person"
								id="person"
								className="text-teal-500"
							/>
							<Label htmlFor="person" className="ml-2 font-medium">
								Check by person
							</Label>
						</div>

						<div className="pl-6 space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="md:col-span-1">
									<Label htmlFor="officialName">Full Name</Label>
									<Input
										id="officialName"
										name="officialName"
										value={formData.officialName}
										onChange={handleInputChange}
									/>
								</div>

								<div>
									<Label htmlFor="dateOfBirth">Date of Birth</Label>
									<div className="flex space-x-2">
										<Input
											name="day"
											placeholder="DD"
											value={formData.day}
											onChange={handleInputChange}
											className="w-16"
											maxLength={2}
										/>
										<Input
											name="month"
											placeholder="MM"
											value={formData.month}
											onChange={handleInputChange}
											className="w-16"
											maxLength={2}
										/>
										<Input
											name="year"
											placeholder="YY"
											value={formData.year}
											onChange={handleInputChange}
											className="w-16"
											maxLength={4}
										/>
									</div>
								</div>

								<div>
									<Label htmlFor="country">Nationality</Label>
									<Select
										value={formData.country}
										onValueChange={handleSelectChange}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select country" />
										</SelectTrigger>
										<SelectContent>
											{countries.map((country) => (
												<SelectItem key={country} value={country}>
													<div className="flex items-center">
														<span className="mr-2">
															{
																CompanyCodes[
																	country as keyof typeof CompanyCodes
																].flag
															}
														</span>
														<span className="mr-2">
															{
																CompanyCodes[
																	country as keyof typeof CompanyCodes
																].code
															}
														</span>
														{country}
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
						</div>
					</div>

					<div className="space-y-4">
						<div className="flex items-center text-muted">
							<RadioGroupItem
								value="business"
								id="business"
								className="text-teal-500"
								disabled
							/>
							<Label htmlFor="business" className="ml-2 font-medium">
								Check by business
							</Label>
						</div>

						{checkType === "business" && (
							<div className="pl-6 space-y-4">
								<div>
									<Label htmlFor="companyName">Company Name</Label>
									<Input
										id="companyName"
										name="companyName"
										value={formData.companyName}
										onChange={handleInputChange}
									/>
								</div>
							</div>
						)}
					</div>
				</RadioGroup>

				<Button
					type="submit"
					className="w-full bg-teal-500 hover:bg-teal-600 text-white mt-4"
					disabled={isLoading || isSubmitDisabled}
				>
					{isLoading ? (
						<span className="flex items-center justify-center">
							<Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
							Checking...
						</span>
					) : (
						"Submit"
					)}
				</Button>
			</form>
		</div>
	);
}

