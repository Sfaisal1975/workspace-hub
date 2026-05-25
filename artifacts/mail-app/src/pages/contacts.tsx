import { useState } from "react";
import { useListContacts, useCreateContact, useDeleteContact, getListContactsQueryKey } from "@workspace/api-client-react";
import { Search, Plus, Trash2, User, Building2, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQueryClient } from "@tanstack/react-query";

export default function ContactsPage() {
  const { data: contacts, isLoading } = useListContacts();
  const createContact = useCreateContact();
  const deleteContact = useDeleteContact();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newCompany, setNewCompany] = useState("");

  const filtered = contacts?.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.company && c.company.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAdd = async () => {
    if (!newName.trim() || !newEmail.trim()) return;
    await createContact.mutateAsync({
      data: { name: newName, email: newEmail, phone: newPhone, company: newCompany },
    });
    queryClient.invalidateQueries({ queryKey: getListContactsQueryKey() });
    setShowAdd(false);
    setNewName("");
    setNewEmail("");
    setNewPhone("");
    setNewCompany("");
  };

  const handleDelete = async (id: string) => {
    await deleteContact.mutateAsync({ id });
    queryClient.invalidateQueries({ queryKey: getListContactsQueryKey() });
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="h-14 border-b border-border flex items-center justify-between px-6 flex-shrink-0">
        <h1 className="text-sm font-semibold">Contacts</h1>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-accent border-transparent focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary rounded-md outline-none transition-all"
          />
        </div>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="p-4 border-b border-border bg-accent/30 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Name *"
              className="px-3 py-2 text-sm rounded-md border border-border bg-background outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <input
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Email *"
              className="px-3 py-2 text-sm rounded-md border border-border bg-background outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <input
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="Phone"
              className="px-3 py-2 text-sm rounded-md border border-border bg-background outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <input
              value={newCompany}
              onChange={(e) => setNewCompany(e.target.value)}
              placeholder="Company"
              className="px-3 py-2 text-sm rounded-md border border-border bg-background outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="px-4 py-1.5 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : filtered?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <User className="w-10 h-10 mb-3 opacity-20" />
            <p className="text-sm">No contacts found</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered?.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors group"
              >
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {contact.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{contact.name}</span>
                    {contact.company && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Building2 className="w-3 h-3" />
                        {contact.company}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-muted-foreground">{contact.email}</span>
                    {contact.phone && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        {contact.phone}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(contact.id)}
                  className="p-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
