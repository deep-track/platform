"use client"

import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface VerificationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function VerificationDialog({ open, onOpenChange }: VerificationDialogProps) {
    const [selectedOption, setSelectedOption] = useState("aml")
    const router = useRouter()

    const handleProceed = () => {
        onOpenChange(false)
        if (selectedOption === "identity") {
            router.push("/verify-id")
        } else {
            router.push("/aml-check")
        }
    }

    return (
					<Dialog open={open} onOpenChange={onOpenChange}>
						<DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
							<div className="flex flex-col h-full">
								{/* Header */}
								<div className="flex items-center p-6 pb-4">
									<DialogTitle className="text-xl font-medium">
										Select check
									</DialogTitle>
								</div>

								{/* Content */}
								<div className="px-6 pb-6 flex-1">
									<h3 className="text-lg font-medium mb-8">
										Select the verification you would like to conduct:
									</h3>

									<RadioGroup
										value={selectedOption}
										onValueChange={setSelectedOption}
										className="space-y-6"
									>
										<div className="flex items-start space-x-2">
											<RadioGroupItem
												value="identity"
												id="identity"
												className="mt-1"
											/>
											<div className="grid gap-1.5">
												<Label
													htmlFor="identity"
													className="font-medium text-base"
												>
													Identity Verification
												</Label>
												<p className="text-sm text-muted-foreground">
													Check authenticity of Identification documents e.g.
													Government issued IDs, Certificates
												</p>
											</div>
										</div>

										<div className="flex items-start space-x-2">
											<RadioGroupItem value="aml" id="aml" className="mt-1" />
											<div className="grid gap-1.5">
												<Label htmlFor="aml" className="font-medium text-base">
													Anti Money Laundering(AML) Check
												</Label>
												<p className="text-sm text-muted-foreground">
													Cross reference Personal and Business entities across
													Local and Global Databases
												</p>
											</div>
										</div>
									</RadioGroup>

									{/* Proceed Button */}
									<Button onClick={handleProceed} asChild>
										<Link
											className={buttonVariants({
												variant: "default",
												className: "w-full mt-6",
											})}
											href={
												selectedOption === "identity"
													? "/verify-id"
													: "/aml-check"
											}
										>
											Proceed
										</Link>
									</Button>
								</div>
							</div>
						</DialogContent>
					</Dialog>
				);
}