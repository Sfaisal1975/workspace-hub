import { useState } from "react";
import { useLocation } from "wouter";
import { useSendEmail, useListContacts } from "@workspace/api-client-react";
import { ArrowLeft, Paperclip, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ComposePage() {
  const [, setLocation] = useLocation();
  const { data: contacts } = useListContacts();
  const sendEmail = useSendEmail();

  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleToChange = (val: string) => {
    setTo(val);
    if (val.length > 0 && contacts) {
      const matches = contacts
        .filter((c) => c.email.toLowerCase().includes(val.toLowerCase()) || c.name.toLowerCase().includes(val.toLowerCase()))
        .map((c) => c.email)
        .slice(0, 5);
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  };

  const handleSend = async () => {
    if (!to.trim() || !subject.trim() || !body.trim()) return;
    await sendEmail.mutateAsync({
      data: { subject, recipients: to.split(",").map((s) => s.trim()), body, accountId: "acct-demo" },
    });
    setLocation("/");
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Toolbar */}
      <div className="h-14 border-b border-border flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLocation("/")}
            className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-sm font-semibold">New Message</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
            <Paperclip className="w-4 h-4" />
          </button>
          <button
            onClick={handleSend}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
              to.trim() && subject.trim() && body.trim()
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
            disabled={!to.trim() || !subject.trim() || !body.trim()}
          >
            <Send className="w-3.5 h-3.5" />
            Send
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-4">
          {/* To */}
          <div className="relative">
            <div className="flex items-center gap-3 border-b border-border pb-2">
              <span className="text-sm text-muted-foreground w-12">To</span>
              <input
                type="text"
                value={to}
                onChange={(e) => handleToChange(e.target.value)}
                placeholder="recipient@example.com"
                className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
              />
            </div>
            {suggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-card border border-border rounded-md shadow-lg overflow-hidden">
                {suggestions.map((email) => (
                  <button
                    key={email}
                    onClick={() => {
                      setTo(email);
                      setSuggestions([]);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                  >
                    {email}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Subject */}
          <div className="flex items-center gap-3 border-b border-border pb-2">
            <span className="text-sm text-muted-foreground w-12">Subject</span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What's this about?"
              className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Body */}
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your message here..."
            className="w-full min-h-[400px] text-sm bg-transparent outline-none resize-none text-foreground placeholder:text-muted-foreground leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
