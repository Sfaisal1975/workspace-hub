import { Link, useLocation } from "wouter";
import { Inbox, PenSquare, Settings2, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Inbox", icon: Inbox },
  { href: "/compose", label: "Compose", icon: PenSquare },
  { href: "/accounts", label: "Accounts", icon: Settings2 },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex h-screen w-screen">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r bg-sidebar text-sidebar-foreground flex flex-col">
        <div className="flex items-center gap-2 px-4 h-14 border-b border-sidebar-border">
          <Mail className="h-5 w-5 text-sidebar-primary" />
          <span className="font-semibold text-sm">Correspondence</span>
        </div>
        <nav className="flex-1 py-2 px-2 space-y-0.5">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium cursor-pointer transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
