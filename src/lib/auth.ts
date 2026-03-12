import { headers } from "next/headers";

export interface CHSUser {
  id: string;
  name: string;
  email: string;
  orgId: string;
  orgName: string;
  dept: string;
  deptId: string;
  role: "super-admin" | "dept-admin" | "user" | "viewer";
  accessLevel: "full" | "readonly";
  permissions: Record<string, boolean>;
  authenticated: boolean;
}

export async function getCHSUser(): Promise<CHSUser | null> {
  const h = await headers();
  const userId = h.get("x-chs-user-id");
  if (!userId) return null;

  return {
    id: userId,
    name: h.get("x-chs-user-name") || "Usuario",
    email: h.get("x-chs-user-email") || "",
    orgId: h.get("x-chs-org-id") || "",
    orgName: h.get("x-chs-org-name") || "CHS",
    dept: h.get("x-chs-dept") || "",
    deptId: h.get("x-chs-dept-id") || "",
    role: (h.get("x-chs-role") as CHSUser["role"]) || "viewer",
    accessLevel: (h.get("x-chs-access-level") as CHSUser["accessLevel"]) || "readonly",
    permissions: parseJSON(h.get("x-chs-permissions")),
    authenticated: h.get("x-chs-authenticated") === "true",
  };
}

export function getCHSUserFromRequest(req: Request): CHSUser | null {
  const userId = req.headers.get("x-chs-user-id");
  if (!userId) return null;

  return {
    id: userId,
    name: req.headers.get("x-chs-user-name") || "Usuario",
    email: req.headers.get("x-chs-user-email") || "",
    orgId: req.headers.get("x-chs-org-id") || "",
    orgName: req.headers.get("x-chs-org-name") || "",
    dept: req.headers.get("x-chs-dept") || "",
    deptId: req.headers.get("x-chs-dept-id") || "",
    role: (req.headers.get("x-chs-role") as CHSUser["role"]) || "viewer",
    accessLevel: (req.headers.get("x-chs-access-level") as CHSUser["accessLevel"]) || "readonly",
    permissions: parseJSON(req.headers.get("x-chs-permissions")),
    authenticated: req.headers.get("x-chs-authenticated") === "true",
  };
}

function parseJSON(str: string | null): Record<string, boolean> {
  if (!str) return {};
  try {
    return JSON.parse(str);
  } catch {
    return {};
  }
}
