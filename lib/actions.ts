"use server"

import { findUserById } from "@/actions/auth-actions"
import { auth } from "@clerk/nextjs/server"
import { revalidateTag } from "next/cache"
import {redirect} from "next/navigation"

interface UploadedImages {
  face_Image: string;
  front_id_Image: string;
  back_id_Image: string;
}

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
            `${process.env.DEEPTRACK_BACKEND_URL}/v1/users/api-keys/create`,
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
     const { userId } = await auth();
    if (!userId) return redirect("/sign-in");

    try {
      const data = await findUserById(userId);

        if (!data) {
            throw new Error("User not found or invalid response");
        }

        const companyId = data.companyId;

        const response = await fetch(
            `${process.env.DEEPTRACK_BACKEND_URL}/v1/users/api-keys/${userId}/${companyId}`,
            {
              method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
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
   const { userId } = await auth();
    if (!userId) return redirect("/sign-in");

  try {

     const data = await findUserById(userId);

        if (!data) {
            throw new Error("User not found or invalid response");
        }

        const companyId = data.companyId;

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(
      // the apiKeyId is embedded directly in the URL.
      `${process.env.DEEPTRACK_BACKEND_URL}/v1/users/api-keys/${apiKeyId}/revoke`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          companyId: companyId,
        }),

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

export async function verifyIdentityServerSide(uploadedImages: UploadedImages) {
    const { userId } = await auth();
    if (!userId) return redirect("/sign-in");

    try {
        const userData = await findUserById(userId);
        if (!userData?.companyId) {
            throw new Error("Company ID not found");
        }

        const apiKeys = await getApiKeys();
        
        // get the active DeepTrack API key
        const deepTrackKey = apiKeys.find((key: { status: string }) => key.status === 'Active')?.apiKey || apiKeys.find((key: { status: string }) => key.status === 'Active')?.key;
        
        if (!deepTrackKey) {
            throw new Error("DeepTrack API key not found. Please create one first.");
        }

        // Make the API request with proper credentials
        const response = await fetch(`${process.env.DEEPTRACK_BACKEND_URL}/v1/kyc/deeptrackai-id`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': deepTrackKey
            },
            body: JSON.stringify(uploadedImages)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("API error response:", errorText);
            throw new Error(`Verification failed: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error('Verification error:', error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Unknown verification error" 
        };
    }
}