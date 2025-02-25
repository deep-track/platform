"use client";
import { createCompanyAction } from "@/actions/organization";
import SubmitButton from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
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
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { redirect, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { VscAdd } from "react-icons/vsc";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
	organizationName: z.string({
		message: "Please enter an organization name",
	}),
	organizationEmail: z.string({
		message: "Please enter an organization email",
	}),
	organizationPhone: z.string({
		message: "Please enter an organization phone number",
	}),
	organizationDomain: z.enum(["finance", "media"], {
		message: "Please select a valid domain",
	}),
});

export default function CreateOrganizationDialog() {
const router = useRouter();
const user = useUser();
if (!user) redirect("/sign-in");
const [open, setOpen] = useState(false);
const form = useForm<z.infer<typeof formSchema>>({
	resolver: zodResolver(formSchema),
	defaultValues: {
		organizationName: "",
		organizationEmail: "",
		organizationPhone: "",
	},
});

async function onSubmit(values: z.infer<typeof formSchema>) {
	if (!user.user?.id) {
		toast.error("Please log in");
		return;
	}
	try {
		const response = await createCompanyAction({
			name: values.organizationName,
			email: values.organizationEmail,
			phone: values.organizationPhone,
			companyDomain: values.organizationDomain,
			companyHeadId: user.user.id,
		});

		if (response.status === 200) {
			toast.success(response.message);
			setOpen(false);
			form.reset();
			router.refresh();
		} else {
			toast.error(response.message || "An error occurred");
		}
	} catch (error) {
		console.error("Form submission error:", error);
		toast.error("Failed to submit the form. Please try again.");
	} finally {
		form.reset();
	}
}

return (
	<Dialog open={open} onOpenChange={setOpen}>
		<DialogTrigger asChild>
			<Button>
				<VscAdd />
				Create Organization
			</Button>
		</DialogTrigger>
		<DialogContent className="sm:max-w-4xl">
			<DialogHeader>
				<DialogTitle>Create Organization</DialogTitle>
				<DialogDescription>
					Fill in the details to create a new organization.
				</DialogDescription>
			</DialogHeader>
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
								<FormDescription>The email of the organization</FormDescription>
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

					<SubmitButton
						isSubmitting={form.formState.isSubmitting}
						text="Create Organization"
					/>
				</form>
			</Form>
		</DialogContent>
	</Dialog>
);
}