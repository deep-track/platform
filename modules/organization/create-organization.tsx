"use client";

import { createCompanyAction } from "@/actions/organization";
import SubmitButton from "@/components/submit-button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { checkPhoneNumber } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type Props = {
	userId: string;
};

const formSchema = z.object({
	organizationName: z.string({
		message: "Please enter an organization name",
	}),
	organizationEmail: z
		.string({
			message: "Please enter an organization email",
		})
		.email({
			message: "Please enter a valid organization email",
		}),
	organizationPhone: z.string({
		message: "Please enter an organization phone number",
	}),
	organizationDomain: z.enum(["finance", "media"], {
		message: "Please select a valid domain",
	}),
});

function CreateOrganization({ userId }: Props) {
	const router = useRouter();
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			organizationName: "",
			organizationEmail: "",
			organizationPhone: "",
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		if (
			values.organizationPhone &&
			!checkPhoneNumber(values.organizationPhone)
		) {
			toast.error("Please enter a valid organization phone number");
			return;
		}
		try {
			const response = await createCompanyAction({
				name: values.organizationName,
				email: values.organizationEmail,
				phone: values.organizationPhone,
				companyDomain: values.organizationDomain,
				companyHeadId: userId,
			});

			if (response.status === 200) {
				toast.success(response.message, {
					description: "You will be redirected to the dashboard",
				});
				form.reset();
				router.push("/dashboard");
			} else {
				toast.error(response.message || "An error occurred");
			}
		} catch (error) {
			console.error("Form submission error:", error);
			toast.error("Failed to submit the form. Please try again.");
		}
	}
	return (
		<Card className="w-full max-w-3xl mx-auto">
			<CardHeader>
				<CardTitle>Create Organization</CardTitle>
				<CardDescription>
					Fill in the details to create a new organization. This will allow you
					to invite members and manage resources. You will be automatically
					created an API key that allows you to begin using KYC and Anti Money
					Laundering services.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="organizationName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Organization Name</FormLabel>
									<FormControl>
										<Input placeholder="Org A" type="" {...field} />
									</FormControl>
									<FormDescription>
										This is the name of the organization
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="organizationEmail"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Organization Email</FormLabel>
									<FormControl>
										<Input placeholder="name@org.com" type="email" {...field} />
									</FormControl>
									<FormDescription>
										The email of the organization
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="organizationPhone"
							render={({ field }) => (
								<FormItem className="flex flex-col items-start">
									<FormLabel>Organization Phone Number</FormLabel>
									<FormControl className="w-full">
										<PhoneInput
											placeholder="Placeholder"
											{...field}
											defaultCountry="KE"
											international
										/>
									</FormControl>
									<FormDescription>Enter your phone number.</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="organizationDomain"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Organization Domain</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Choose organization domain" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="finance">Finance</SelectItem>
											<SelectItem value="media">Media</SelectItem>
										</SelectContent>
									</Select>
									<FormDescription>
										Which dsector does the organization specialize in?
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex items-center justify-end">
							<SubmitButton
								isSubmitting={form.formState.isSubmitting}
								text="Create Organization"
							/>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}

export default CreateOrganization;