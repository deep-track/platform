"use server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export type APIKey = {
	id: string;
	name: string;
	status?: string;
	createdAt?: Date;
	updatedAt?: Date;
	apiKey?: string;
};

export async function getAPIKeys(): Promise<unknown[]> {
  try {
    const res = await fetch(`${APP_URL}/api/api-keys`, {
      cache: "no-store",
    });

    if (!res.ok) return [];

    const data = await res.json();
    return data.data ?? [];
  } catch (err) {
    console.error("getAPIKeys error:", err);
    return [];
  }
}

export async function getUserApiKeys(userId: string): Promise<unknown[]> {
  return getAPIKeys();
}

export async function createAPIKey(
  name: string
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const res = await fetch(`${APP_URL}/api/api-keys`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: text };
    }

    const data = await res.json();
    return { success: true, data: data.data };
  } catch (err) {
    console.error("createAPIKey error:", err);
    return { success: false, error: "Failed to create API key" };
  }
}

export async function createApiKey(
	userId: string,
	name: string,
	companyId: string,
): Promise<unknown> {
  return createAPIKey(name);
}

export async function revokeAPIKey(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${APP_URL}/api/api-keys/${id}/revoke`, {
      method: "PATCH",
    });

    if (!res.ok) {
      return { success: false, error: "Failed to revoke key" };
    }

    return { success: true };
  } catch (err) {
    console.error("revokeAPIKey error:", err);
    return { success: false, error: "Failed to revoke API key" };
  }
}

export async function revokeApiKey(
	apiKeyId: string,
	userId: string,
	companyId: string,
): Promise<boolean> {
  const result = await revokeAPIKey(apiKeyId);
  return result.success;
}