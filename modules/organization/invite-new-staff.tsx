"use client";

import { createInvitation } from "@/actions/invitations";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { VscAdd } from "react-icons/vsc";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
	email: z.string().email({
		message: "Please enter a valid email address",
	}),
	role: z.enum(["admin", "user"], {
		message: "Please select a valid role",
	}),
});

type Props = {
	companyId: string;
};

export default function InviteStaffDialog({ companyId }: Props) {
	const [open, setOpen] = useState(false);
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			await createInvitation(
				values.email,
				`${process.env.NEXT_PUBLIC_APP_URL}/sign-up` as string,
				values.role,
				companyId,
			);

			form.reset();

			toast.success("Invitation sent successfully!", {
				description:
					"You will receive an email shortly with a link to sign up.",
			});
			setOpen(false);
			// loadInvitations(); // Refresh the list after creating a new invitation
		} catch (error) {
			console.error("Failed to create invitation:", error);
			toast.error("Something went wrong while creating the invitation.");
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<VscAdd className="mr-2" />
					Invite Staff
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Invite Staff Member</DialogTitle>
					<DialogDescription>
						Send an invitation to a new staff member to join your organization.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email Address</FormLabel>
									<FormControl>
										<Input
											placeholder="name@company.com"
											type="email"
											{...field}
										/>
									</FormControl>
									<FormDescription>
										The email address of the person you want to invite
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="role"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Role</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select a role" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="admin">Admin</SelectItem>
											<SelectItem value="user">Member</SelectItem>
										</SelectContent>
									</Select>
									<FormDescription>
										The role determines what permissions they will have
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<SubmitButton
							isSubmitting={form.formState.isSubmitting}
							text="Send Invitation"
						/>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}