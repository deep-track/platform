"use server"

import { findUserById } from "@/actions/auth-actions"
import { getSession } from "@/lib/session"
import { auth } from "@clerk/nextjs/server"
import { revalidateTag } from "next/cache"
import {redirect} from "next/navigation"

export async function createApiKey() {
    const { userId } = await auth();
    if (!userId) return redirect("/sign-in");

    try {
        const data = await findUserById(userId);

        if (!data) {
            throw new Error("User not found or invalid response");
        }

        const companyId = data.companyId;

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/users/api-keys/create`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: userId,
                    companyId: companyId,
                }),
            }
        );

        if (!response.ok) throw new Error("Failed to create API key");

        revalidateTag("apikeys");
        const responseData = await response.json();
        return { success: true, apiKey: responseData.apiKey };

    } catch (error) {
        console.error("Error:", error);
        return { success: false, error: (error as Error).message };
    }
}

export async function getApiKeys() {
    const session = await getSession()
    if (!session) return []

    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/users/api-keys/${session.user.id}`,
            {
                headers: { Authorization: `Bearer ${session.accessToken}` },
                next: { tags: ['apikeys'] }
            }
        )

        if (!response.ok) throw new Error("Failed to fetch API keys")
        return await response.json()
    } catch (error) {
        console.error("API Error:", error)
        return []
    }
}

export async function revokeApiKey(apiKeyId: string) {
  try {
    const { userId } = await auth();

    if (!userId) throw new Error("User session not found")

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(
      // the apiKeyId is embedded directly in the URL.
      `${process.env.NEXT_PUBLIC_API_URL}/users/${apiKeyId}/api-keys/revoke`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      }
    )
    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json()
      return {
        success: false,
        error: errorData.error || "Failed to revoke API key",
      }
    }

    // revalidate the cache for API keys after revocation.
    revalidateTag("apikeys")
    return { success: true }
  } catch (error: unknown) {
    console.error("API Error:", error)
    return { success: false, error: (error as Error).message }
  }
}