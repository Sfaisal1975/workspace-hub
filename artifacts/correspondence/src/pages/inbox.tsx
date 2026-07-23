import { useAccounts } from "@/hooks/use-accounts";
import { Mail, Plus } from "lucide-react";
import { Link } from "wouter";

export default function Inbox() {
  const { data: accounts, isLoading } = useAccounts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!accounts || accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Mail className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-lg font-semibold">No email accounts connected</h2>
        <p className="text-sm text-muted-foreground max-w-md text-center">
          Connect a Gmail or iCloud account to start reading and sending emails.
        </p>
        <Link href="/accounts">
          <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" />
            Add Account
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between px-6 h-14 border-b shrink-0">
        <h1 className="text-lg font-semibold">Inbox</h1>
        <span className="text-xs text-muted-foreground">
          {accounts.length} account{accounts.length !== 1 ? "s" : ""} connected
        </span>
      </header>

      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center space-y-2">
          <Mail className="h-8 w-8 mx-auto" />
          <p className="text-sm">Unified inbox coming in Phase 2</p>
          <p className="text-xs">
            Connected: {accounts.map((a) => a.email).join(", ")}
          </p>
        </div>
      </div>
    </div>
  );
}
