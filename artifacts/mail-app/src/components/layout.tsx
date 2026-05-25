import React from "react";
import { Link, useLocation } from "wouter";
import { 
  Inbox, 
  PenSquare, 
  Calendar as CalendarIcon, 
  Users, 
  Settings as SettingsIcon,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useListMailAccounts } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
}

function NavItem({ href, icon: Icon, label, isActive }: NavItemProps) {
  return (
    <Link href={href}>
      <div className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer group",
        isActive 
          ? "bg-primary text-primary-foreground font-medium" 
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}>
        <Icon className={cn("w-4 h-4", isActive ? "text-primary-foreground" : "text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground")} />
        <span className="text-sm">{label}</span>
      </div>
    </Link>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: accounts, isLoading: accountsLoading } = useListMailAccounts();

  const primaryAccount = accounts?.[0];

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-sidebar flex flex-col h-full border-r border-sidebar-border">
        {/* Account Selector */}
        <div className="p-4 border-b border-sidebar-border/10 flex items-center gap-3">
          {accountsLoading ? (
            <div className="flex items-center gap-3 w-full">
              <Skeleton className="w-8 h-8 rounded-full bg-sidebar-accent" />
              <div className="flex-col flex gap-1 flex-1">
                <Skeleton className="h-3 w-24 bg-sidebar-accent" />
                <Skeleton className="h-2 w-32 bg-sidebar-accent" />
              </div>
            </div>
          ) : primaryAccount ? (
            <div className="flex items-center gap-3 w-full group cursor-pointer p-1 -m-1 rounded hover:bg-sidebar-accent transition-colors">
              <Avatar className="w-8 h-8 rounded bg-primary/20 text-primary">
                <AvatarImage src={primaryAccount.avatarUrl || ""} />
                <AvatarFallback className="rounded bg-primary text-primary-foreground font-medium text-xs">
                  {primaryAccount.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col flex-1 overflow-hidden">
                <span className="text-sm font-medium text-sidebar-foreground truncate">{primaryAccount.name}</span>
                <span className="text-xs text-sidebar-foreground/60 truncate">{primaryAccount.email}</span>
              </div>
            </div>
          ) : null}
        </div>

        {/* Global Compose Button */}
        <div className="p-4">
          <Link href="/compose">
            <div className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 px-4 rounded-md shadow-sm transition-all font-medium text-sm cursor-pointer shadow-primary/20">
              <PenSquare className="w-4 h-4" />
              <span>Compose</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className="px-2 flex-1 flex flex-col gap-1 overflow-y-auto">
          <div className="text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider px-3 py-2 mt-2">
            Workspace
          </div>
          <NavItem href="/" icon={Inbox} label="Inbox" isActive={location === "/"} />
          <NavItem href="/calendar" icon={CalendarIcon} label="Calendar" isActive={location.startsWith("/calendar")} />
          <NavItem href="/contacts" icon={Users} label="Contacts" isActive={location.startsWith("/contacts")} />
        </div>

        {/* Settings */}
        <div className="p-2 border-t border-sidebar-border/10">
          <NavItem href="/settings" icon={SettingsIcon} label="Settings" isActive={location.startsWith("/settings")} />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-background">
        {children}
      </main>
    </div>
  );
}
