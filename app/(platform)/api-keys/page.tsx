import { redirect } from "next/navigation";
import ApiKeysUI from "./ApiKeysUI";
import { auth } from "@clerk/nextjs/server";
import { findUserById } from "@/actions/auth-actions";

export interface ApiKey {
    id: number;
    keyPrefix: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    hashedKey?: string;
    ownerid?: number;
}

export default async function ApiKeysPage() {
    const { userId } = await auth();
        if (!userId) return redirect("/sign-in");

    let apiKeys: ApiKey[] = [];
    try {
         const data = await findUserById(userId);
        
                if (!data) {
                    throw new Error("User not found or invalid response");
                }
        
            const companyId = data.companyId;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); 

        // TODO: FIX FETCH FROM BACKEND
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/users/api-keys/${userId}/${companyId}`,
            {
                next: { tags: ["apikeys"] },
                signal: controller.signal,
            }
        );
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error("Failed to fetch API keys");
        apiKeys = await response.json();
        
    } catch (error) {
        console.error("API Error:", error);
    }

    return <ApiKeysUI initialApiKeys={apiKeys} />;
}
