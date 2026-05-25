import { useListMailAccounts } from "@workspace/api-client-react";
import { Mail, Bell, Shield, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function SettingsPage() {
  const { data: accounts } = useListMailAccounts();
  const account = accounts?.[0];

  const sections = [
    {
      icon: Mail,
      title: "Account",
      items: [
        { label: "Email address", value: account?.email || "alex.morgan@example.com" },
        { label: "Display name", value: account?.name || "Alex Morgan" },
        { label: "Provider", value: account?.provider || "Example Mail" },
      ],
    },
    {
      icon: Bell,
      title: "Notifications",
      items: [
        { label: "New mail notifications", value: "Enabled" },
        { label: "Calendar reminders", value: "15 min before" },
        { label: "Sound alerts", value: "Off" },
      ],
    },
    {
      icon: Shield,
      title: "Privacy & Security",
      items: [
        { label: "Two-factor auth", value: "Not set up" },
        { label: "Session management", value: "1 active session" },
        { label: "Blocked senders", value: "0 blocked" },
      ],
    },
    {
      icon: Palette,
      title: "Appearance",
      items: [
        { label: "Theme", value: "Light" },
        { label: "Density", value: "Comfortable" },
        { label: "Font size", value: "Medium" },
      ],
    },
  ];

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="h-14 border-b border-border flex items-center px-6 flex-shrink-0">
        <h1 className="text-sm font-semibold">Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-6 space-y-8">
          {/* Profile */}
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">
                {account?.name?.charAt(0) || "A"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{account?.name || "Alex Morgan"}</h2>
              <p className="text-sm text-muted-foreground">{account?.email || "alex.morgan@example.com"}</p>
            </div>
          </div>

          {/* Sections */}
          {sections.map((section) => (
            <div key={section.title}>
              <div className="flex items-center gap-2 mb-3">
                <section.icon className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {section.title}
                </h3>
              </div>
              <div className="border border-border rounded-lg divide-y divide-border bg-card">
                {section.items.map((item) => (
                  <div key={item.label} className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm text-foreground">{item.label}</span>
                    <span className="text-sm text-muted-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
