import { useGetDatabase, useListDatabaseEntries, getGetDatabaseQueryKey, getListDatabaseEntriesQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Loader2, Kanban, Table as TableIcon, LayoutGrid, Calendar, Hash, CheckSquare, Type, List, FileText } from "lucide-react";
import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { format } from "date-fns";

type ViewMode = "table" | "kanban" | "gallery";

export default function DatabaseDetail() {
  const { id } = useParams<{ id: string }>();
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  
  const { data: database, isLoading: isLoadingDb } = useGetDatabase(id!, {
    query: { enabled: !!id, queryKey: getGetDatabaseQueryKey(id!) }
  });

  const { data: entries, isLoading: isLoadingEntries } = useListDatabaseEntries(id!, {
    query: { enabled: !!id, queryKey: getListDatabaseEntriesQueryKey(id!) }
  });

  // Try to find a property to group by for kanban
  const groupByProperty = useMemo(() => {
    if (!database?.properties) return null;
    const props = Object.entries(database.properties);
    // Find status or select property
    const statusProp = props.find(([_, prop]: [string, any]) => prop?.type === "status");
    if (statusProp) return { name: statusProp[0], type: "status", ...statusProp[1] };
    
    const selectProp = props.find(([_, prop]: [string, any]) => prop?.type === "select");
    if (selectProp) return { name: selectProp[0], type: "select", ...selectProp[1] };
    
    return null;
  }, [database]);

  // Set default view mode based on properties
  useMemo(() => {
    if (groupByProperty && viewMode === "table") {
      setViewMode("kanban");
    }
  }, [groupByProperty]);

  if (isLoadingDb || isLoadingEntries) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!database || !entries) {
    return (
      <div className="p-8">
        <div className="py-24 text-center border rounded-2xl border-dashed border-border bg-card/50">
          <h3 className="text-lg font-medium text-foreground mb-1">Database not found</h3>
          <p className="text-muted-foreground">This database doesn't exist or you don't have access to it.</p>
        </div>
      </div>
    );
  }

  const renderKanban = () => {
    if (!groupByProperty) return null;
    
    // Group entries
    const groups: Record<string, typeof entries> = {};
    const propDef = (groupByProperty as any)[(groupByProperty as any).type];
    const options = propDef?.options || [];
    
    // Initialize groups with options
    options.forEach((opt: any) => {
      groups[opt.name] = [];
    });
    groups["No Status"] = []; // Fallback

    entries.forEach(entry => {
      const propValue = entry.properties?.[groupByProperty.name] as any;
      const valueName = groupByProperty.type === "status" ? propValue?.status?.name : propValue?.select?.name;
      if (valueName && groups[valueName]) {
        groups[valueName].push(entry);
      } else {
        groups["No Status"].push(entry);
      }
    });

    // Remove empty "No Status" if there are options
    if (options.length > 0 && groups["No Status"].length === 0) {
      delete groups["No Status"];
    }

    return (
      <ScrollArea className="w-full pb-4">
        <div className="flex gap-6 pb-4">
          {Object.entries(groups).map(([groupName, groupEntries]) => (
            <div key={groupName} className="flex-none w-80 flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-medium text-sm text-foreground flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary/40"></span>
                  {groupName}
                </h3>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{groupEntries.length}</span>
              </div>
              <div className="flex flex-col gap-3">
                {groupEntries.map(entry => (
                  <Link key={entry.id} href={`/pages/${entry.id}`}>
                    <div className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 shadow-sm transition-all cursor-pointer group hover-elevate">
                      <h4 className="font-medium text-foreground group-hover:text-primary transition-colors text-sm mb-2">
                        {entry.title || "Untitled"}
                      </h4>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {entry.createdAt ? format(new Date(entry.createdAt), "MMM d") : ""}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
                {groupEntries.length === 0 && (
                  <div className="p-4 rounded-xl border border-dashed border-border text-center text-sm text-muted-foreground bg-card/30">
                    No items
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    );
  };

  const renderPropertyIcon = (type: string) => {
    switch (type) {
      case 'title':
      case 'rich_text': return <Type className="w-3.5 h-3.5" />;
      case 'number': return <Hash className="w-3.5 h-3.5" />;
      case 'select':
      case 'multi_select': return <List className="w-3.5 h-3.5" />;
      case 'date': return <Calendar className="w-3.5 h-3.5" />;
      case 'checkbox': return <CheckSquare className="w-3.5 h-3.5" />;
      default: return <FileText className="w-3.5 h-3.5" />;
    }
  };

  const renderTable = () => {
    // Determine columns from first entry's properties
    const sampleEntry = entries[0];
    if (!sampleEntry?.properties) return null;
    
    // Get all properties except title (we'll show it first)
    const propertyKeys = Object.keys(sampleEntry.properties).filter(k => (sampleEntry.properties as any)?.[k]?.type !== 'title');

    return (
      <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
        <ScrollArea className="w-full">
          <div className="min-w-max">
            <div className="flex border-b border-border bg-muted/30 p-3 px-4">
              <div className="w-64 flex-none font-medium text-xs text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                <Type className="w-3.5 h-3.5" />
                Title
              </div>
              {propertyKeys.map(key => {
                const propType = (sampleEntry.properties as any)?.[key]?.type;
                return (
                  <div key={key} className="w-48 flex-none font-medium text-xs text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                    {renderPropertyIcon(propType)}
                    {key}
                  </div>
                );
              })}
            </div>
            
            <div className="divide-y divide-border">
              {entries.map(entry => (
                <Link key={entry.id} href={`/pages/${entry.id}`} className="flex p-3 px-4 hover:bg-muted/30 transition-colors cursor-pointer group">
                  <div className="w-64 flex-none font-medium text-sm text-foreground flex items-center group-hover:text-primary transition-colors pr-4 truncate">
                    {entry.title || "Untitled"}
                  </div>
                  {propertyKeys.map(key => {
                    const prop = entry.properties?.[key] as any;
                    let displayValue = "";
                    
                    if (!prop) displayValue = "";
                    else if (prop.type === "rich_text") displayValue = prop.rich_text?.[0]?.plain_text || "";
                    else if (prop.type === "number") displayValue = prop.number?.toString() || "";
                    else if (prop.type === "select") displayValue = prop.select?.name || "";
                    else if (prop.type === "multi_select") displayValue = prop.multi_select?.map((s: any) => s.name).join(", ") || "";
                    else if (prop.type === "status") displayValue = prop.status?.name || "";
                    else if (prop.type === "date") displayValue = prop.date?.start ? format(new Date(prop.date.start), "MMM d, yyyy") : "";
                    else if (prop.type === "checkbox") displayValue = prop.checkbox ? "Yes" : "No";

                    return (
                      <div key={key} className="w-48 flex-none text-sm text-muted-foreground flex items-center pr-4 truncate">
                        {prop?.type === "status" || prop?.type === "select" ? (
                          displayValue ? <Badge variant="secondary" className="font-normal">{displayValue}</Badge> : null
                        ) : (
                          displayValue
                        )}
                      </div>
                    );
                  })}
                </Link>
              ))}
              {entries.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  No entries found in this database.
                </div>
              )}
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    );
  };

  return (
    <div className="p-8 max-w-full mx-auto space-y-8 animate-in fade-in duration-500 h-full flex flex-col">
      <header className="space-y-4 flex-none">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/databases" className="hover:text-foreground transition-colors">Databases</Link>
          <span>/</span>
          <span className="text-foreground">{database.title}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{database.title}</h1>
          
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border">
            {groupByProperty && (
              <Button 
                variant={viewMode === "kanban" ? "secondary" : "ghost"} 
                size="sm" 
                className="h-8 px-3 rounded-md"
                onClick={() => setViewMode("kanban")}
              >
                <Kanban className="w-4 h-4 mr-1.5" />
                Board
              </Button>
            )}
            <Button 
              variant={viewMode === "table" ? "secondary" : "ghost"} 
              size="sm" 
              className="h-8 px-3 rounded-md"
              onClick={() => setViewMode("table")}
            >
              <TableIcon className="w-4 h-4 mr-1.5" />
              Table
            </Button>
            <Button 
              variant={viewMode === "gallery" ? "secondary" : "ghost"} 
              size="sm" 
              className="h-8 px-3 rounded-md"
              onClick={() => setViewMode("gallery")}
            >
              <LayoutGrid className="w-4 h-4 mr-1.5" />
              Gallery
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0">
        {viewMode === "kanban" && renderKanban()}
        {viewMode === "table" && renderTable()}
        {viewMode === "gallery" && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {entries.map(entry => (
              <Link key={entry.id} href={`/pages/${entry.id}`}>
                <div className="aspect-[4/3] p-4 rounded-xl border border-border bg-card hover:border-primary/50 shadow-sm transition-all cursor-pointer group hover-elevate flex flex-col">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground group-hover:text-primary transition-colors text-base line-clamp-2">
                      {entry.title || "Untitled"}
                    </h4>
                  </div>
                  <div className="flex items-center justify-between mt-4 border-t border-border/50 pt-3">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {entry.createdAt ? format(new Date(entry.createdAt), "MMM d, yyyy") : ""}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
