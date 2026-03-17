import { getUserApiKeys } from "@/actions/api-keys";
import { findUserById } from "@/actions/auth-actions";
import ApiKeysTable from "@/app/(platform)/api-keys/api-keys-table";
import { getAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import CreateApiKeyForm from "./create-api-key-form";

export default async function ApiKeysPage() {
	const { userId } = await getAuth();
	if (!userId) return redirect("/auth/login");

	const dbUser = await findUserById(userId);
	const apiKeys = await getUserApiKeys(userId);

	if (!dbUser || !dbUser.companyId) return redirect("/new-user");
	return (
		<div className="space-y-4 p-6">
			<div className="flex items-center justify-end">
				<CreateApiKeyForm userId={userId} companyId={dbUser.companyId} />
			</div>
			<ApiKeysTable apiKeys={apiKeys} />
		</div>
	);
}
