import { useAccounts, useDeleteAccount } from "@/hooks/use-accounts";
import { Plus, Trash2, Mail, Cloud } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Accounts() {
  const { data: accounts, isLoading } = useAccounts();
  const deleteMutation = useDeleteAccount();

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between px-6 h-14 border-b shrink-0">
        <h1 className="text-lg font-semibold">Email Accounts</h1>
        <button className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" />
          Add Account
        </button>
      </header>

      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <p className="text-muted-foreground text-sm">Loading accounts...</p>
        ) : !accounts || accounts.length === 0 ? (
          <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-4">
            <div className="flex justify-center gap-4">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-red-50 text-red-600">
                <Mail className="h-6 w-6" />
              </div>
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-50 text-blue-600">
                <Cloud className="h-6 w-6" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold">Connect your email</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Add a Gmail (OAuth2) or iCloud (app-specific password) account to get started.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center justify-center h-10 w-10 rounded-lg ${
                      account.provider === "gmail"
                        ? "bg-red-50 text-red-600"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {account.provider === "gmail" ? (
                      <Mail className="h-5 w-5" />
                    ) : (
                      <Cloud className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{account.displayName}</p>
                    <p className="text-xs text-muted-foreground">{account.email}</p>
                    {account.lastSyncAt && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Last synced {formatDistanceToNow(new Date(account.lastSyncAt), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      account.isActive
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {account.isActive ? "Active" : "Inactive"}
                  </span>
                  <button
                    onClick={() => deleteMutation.mutate(account.id)}
                    disabled={deleteMutation.isPending}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
