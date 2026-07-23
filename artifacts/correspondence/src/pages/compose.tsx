import { Mail } from "lucide-react";

export default function Compose() {
  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center px-6 h-14 border-b shrink-0">
        <h1 className="text-lg font-semibold">Compose</h1>
      </header>

      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center space-y-2">
          <Mail className="h-8 w-8 mx-auto" />
          <p className="text-sm">Compose with account selection coming in Phase 2</p>
        </div>
      </div>
    </div>
  );
}
