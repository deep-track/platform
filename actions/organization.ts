"use server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export interface CompanyMember {
	id: string;
	companyId?: string;
	userId: string;
	email: string;
	fullName: string;
	role: "admin" | "user";
	createdAt?: Date;
	updatedAt?: Date;
}

export async function createOrganization(params: {
  name: string;
  email?: string;
  phone?: string;
  domain?: string;
  headExternalId: string;
}): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const res = await fetch(`${APP_URL}/api/organizations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: text };
    }

    const data = await res.json();
    return { success: true, data: data.data };
  } catch (err) {
    console.error("createOrganization error:", err);
    return { success: false, error: "Failed to create organization" };
  }
}

export async function createCompanyAction(props: {
	name: string;
	email?: string;
	phone?: string;
	companyDomain?: string;
	companyHeadId: string;
	domain?: string;
}): Promise<unknown> {
  return createOrganization({
    name: props.name,
    email: props.email,
    phone: props.phone,
    domain: props.companyDomain || props.domain,
    headExternalId: props.companyHeadId,
  });
}

export async function getOrganizationByUser(
  userId: string
): Promise<{ org: unknown | null; isHead: boolean }> {
  try {
    const res = await fetch(
      `${APP_URL}/api/organizations/${encodeURIComponent(userId)}`,
      { cache: "no-store" }
    );

    if (!res.ok) return { org: null, isHead: false };

    const data = await res.json();
    return data.data ?? { org: null, isHead: false };
  } catch (err) {
    console.error("getOrganizationByUser error:", err);
    return { org: null, isHead: false };
  }
}

export async function findCompanyAction(userId: string): Promise<unknown> {
  const result = await getOrganizationByUser(userId);
  return result.org;
}

export async function getCompanyAction(userId: string): Promise<unknown> {
  const result = await getOrganizationByUser(userId);
  return result.org;
}

export async function checkIfCompanyHeadAction(userId: string): Promise<boolean> {
  const result = await getOrganizationByUser(userId);
  return result.isHead;
}

export async function getCompanyMembersAction(userId: string): Promise<CompanyMember[]> {
  try {
    const res = await fetch(
      `${APP_URL}/api/organizations/${encodeURIComponent(userId)}`,
      { cache: "no-store" }
    );

    if (!res.ok) return [];

    const data = await res.json();
    return data.data?.org?.members ?? [];
  } catch (err) {
    console.error("getCompanyMembersAction error:", err);
    return [];
  }
}