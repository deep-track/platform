import { getUserApiKeys } from "@/actions/api-keys";
import { findUser } from "@/actions/auth-actions";
import ApiKeysTable from "@/app/(platform)/api-keys/api-keys-table";
import { getAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import CreateApiKeyForm from "./create-api-key-form";

export default async function ApiKeysPage() {
	const { userId } = await getAuth();
	if (!userId) return redirect("/auth/login");

	const dbUser = await findUser(userId);

	if (!dbUser) return redirect("/new-user");

	const apiKeys = await getUserApiKeys(userId);
	return (
		<div className="space-y-4 p-6">
			<div className="flex items-center justify-end">
				<CreateApiKeyForm userId={userId} companyId="" />
			</div>
			<ApiKeysTable apiKeys={apiKeys as any} />
		</div>
	);
}
