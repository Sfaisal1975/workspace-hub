const API_BASE = "/api/correspondence";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export interface CorrespondenceAccount {
  id: string;
  displayName: string;
  email: string;
  provider: "gmail" | "icloud";
  isActive: boolean;
  lastSyncAt: string | null;
  createdAt: string | null;
}

export const api = {
  listAccounts: () => request<CorrespondenceAccount[]>("/accounts"),
  getAccount: (id: string) => request<CorrespondenceAccount>(`/accounts/${id}`),
  createAccount: (data: {
    displayName: string;
    email: string;
    provider: "gmail" | "icloud";
    credentialsJson: Record<string, unknown>;
  }) => request<CorrespondenceAccount>("/accounts", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  deleteAccount: (id: string) => request<{ success: boolean }>(`/accounts/${id}`, { method: "DELETE" }),
  getGmailAuthUrl: () => request<{ url: string }>("/auth/gmail/url"),
};
