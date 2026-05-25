import React, { useState } from "react";
import { 
  useListMailAccounts, 
  useListMailFolders, 
  useListFolderEmails, 
  useGetEmail,
  useUpdateEmail
} from "@workspace/api-client-react";
import { format, isToday, isYesterday } from "date-fns";
import { 
  Search, 
  Inbox, 
  Send, 
  FileEdit, 
  Trash2, 
  AlertOctagon, 
  Archive,
  Star,
  MoreVertical,
  Reply,
  Forward,
  Paperclip
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const FOLDER_ICONS: Record<string, React.ElementType> = {
  inbox: Inbox,
  sent: Send,
  drafts: FileEdit,
  trash: Trash2,
  spam: AlertOctagon,
  archive: Archive,
};

function formatEmailDate(dateStr: string) {
  const date = new Date(dateStr);
  if (isToday(date)) {
    return format(date, "h:mm a");
  }
  if (isYesterday(date)) {
    return "Yesterday";
  }
  return format(date, "MMM d");
}

export default function InboxPage() {
  const { data: accounts } = useListMailAccounts();
  const primaryAccount = accounts?.[0];
  
  const { data: folders, isLoading: foldersLoading } = useListMailFolders(primaryAccount?.id || "", {
    query: { enabled: !!primaryAccount?.id }
  });

  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  
  // Set default active folder
  React.useEffect(() => {
    if (folders?.length && !activeFolderId) {
      const inbox = folders.find(f => f.type === "inbox") || folders[0];
      setActiveFolderId(inbox.id);
    }
  }, [folders, activeFolderId]);

  const { data: emails, isLoading: emailsLoading } = useListFolderEmails(activeFolderId || "", {
    query: { enabled: !!activeFolderId }
  });

  const [activeEmailId, setActiveEmailId] = useState<string | null>(null);

  const { data: activeEmail, isLoading: emailLoading } = useGetEmail(activeEmailId || "", {
    query: { enabled: !!activeEmailId }
  });

  return (
    <div className="flex h-full w-full">
      {/* Folder List (Pane 1) */}
      <div className="w-56 flex-shrink-0 border-r border-border bg-card flex flex-col h-full">
        <div className="p-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Mailboxes</h2>
        </div>
        <ScrollArea className="flex-1 px-2">
          {foldersLoading ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
          ) : (
            <div className="space-y-1">
              {folders?.map(folder => {
                const Icon = FOLDER_ICONS[folder.type] || Inbox;
                const isActive = activeFolderId === folder.id;
                return (
                  <div 
                    key={folder.id}
                    onClick={() => setActiveFolderId(folder.id)}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors text-sm",
                      isActive ? "bg-primary/10 text-primary font-medium" : "text-foreground/70 hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
                      <span>{folder.name}</span>
                    </div>
                    {folder.unreadCount ? (
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      )}>
                        {folder.unreadCount}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Email List (Pane 2) */}
      <div className="w-80 flex-shrink-0 border-r border-border bg-background flex flex-col h-full">
        <div className="p-4 border-b border-border flex flex-col gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search emails..." 
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-accent border-transparent focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary rounded-md outline-none transition-all"
            />
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          {emailsLoading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              ))}
            </div>
          ) : emails?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
              <Inbox className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm font-medium text-foreground/60">No emails found</p>
              <p className="text-xs mt-1">This folder is empty.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {emails?.map(email => (
                <div 
                  key={email.id}
                  onClick={() => setActiveEmailId(email.id)}
                  className={cn(
                    "p-4 cursor-pointer hover:bg-accent/50 transition-colors flex flex-col gap-1 relative",
                    activeEmailId === email.id ? "bg-accent" : "",
                    !email.isRead ? "bg-primary/5" : ""
                  )}
                >
                  {!email.isRead && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn("text-sm truncate", !email.isRead ? "font-bold text-foreground" : "font-medium text-foreground/80")}>
                      {email.sender.name || email.sender.email}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatEmailDate(email.sentAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-sm truncate", !email.isRead ? "font-semibold text-foreground" : "font-medium text-foreground/90")}>
                      {email.subject}
                    </span>
                    {email.hasAttachments && <Paperclip className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {email.preview}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Email Reader (Pane 3) */}
      <div className="flex-1 bg-card flex flex-col h-full overflow-hidden">
        {activeEmailId ? (
          emailLoading ? (
            <div className="p-8 space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </div>
          ) : activeEmail ? (
            <div className="flex flex-col h-full">
              {/* Email Toolbar */}
              <div className="h-14 border-b border-border flex items-center justify-between px-6 flex-shrink-0 bg-background/50">
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                    <Reply className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                    <Forward className="w-4 h-4" />
                  </button>
                  <div className="w-px h-4 bg-border mx-2" />
                  <button className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                    <Archive className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                    <Star className={cn("w-4 h-4", activeEmail.isStarred ? "fill-yellow-400 text-yellow-400" : "")} />
                  </button>
                  <button className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <ScrollArea className="flex-1 bg-card">
                <div className="max-w-3xl mx-auto p-8">
                  <h1 className="text-2xl font-bold text-foreground mb-8 leading-tight">
                    {activeEmail.subject}
                  </h1>
                  
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-10 h-10 border border-border">
                        <AvatarImage src={activeEmail.sender.avatarUrl || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {activeEmail.sender.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{activeEmail.sender.name}</span>
                          <span className="text-xs text-muted-foreground">&lt;{activeEmail.sender.email}&gt;</span>
                        </div>
                        <span className="text-xs text-muted-foreground mt-0.5">
                          to {activeEmail.recipients.map(r => r.name || r.email).join(", ")}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(activeEmail.sentAt), "MMM d, yyyy, h:mm a")}
                    </span>
                  </div>
                  
                  {/* Attachments */}
                  {activeEmail.attachments && activeEmail.attachments.length > 0 && (
                    <div className="mb-8 p-4 rounded-md border border-border bg-accent/50 flex flex-wrap gap-3">
                      {activeEmail.attachments.map(att => (
                        <div key={att.id} className="flex items-center gap-3 bg-card border border-border rounded p-2 shadow-sm cursor-pointer hover:border-primary/50 transition-colors">
                          <Paperclip className="w-4 h-4 text-muted-foreground" />
                          <div className="flex flex-col">
                            <span className="text-xs font-medium max-w-[150px] truncate">{att.name}</span>
                            <span className="text-[10px] text-muted-foreground">{Math.round(att.size / 1024)} KB</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="prose prose-sm dark:prose-invert max-w-none font-serif text-base leading-relaxed text-foreground/90">
                    <div dangerouslySetInnerHTML={{ __html: activeEmail.body }} />
                  </div>
                </div>
              </ScrollArea>
            </div>
          ) : null
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-accent/20">
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-6">
              <Inbox className="w-8 h-8 text-foreground/30" />
            </div>
            <p className="text-lg font-medium text-foreground/70">Select an item to read</p>
            <p className="text-sm mt-2">Nothing is selected</p>
          </div>
        )}
      </div>
    </div>
  );
}
