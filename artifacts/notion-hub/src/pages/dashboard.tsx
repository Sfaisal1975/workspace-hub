import { useGetWorkspaceOverview } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Search, FileText, Database, ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const { data: overview, isLoading } = useGetWorkspaceOverview();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Welcome to your Hub</h1>
        <p className="text-lg text-muted-foreground">Everything from your workspace, organized in one place.</p>
        
        <form onSubmit={handleSearch} className="max-w-xl relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pages and databases..." 
            className="pl-10 h-12 text-base shadow-sm rounded-xl border-border bg-card"
          />
        </form>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover-elevate transition-all border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Total Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground">{overview?.totalPages || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="hover-elevate transition-all border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Database className="w-4 h-4" />
              Total Databases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground">{overview?.totalDatabases || 0}</div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Recent Items</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {overview?.recentItems?.map((item) => (
            <Link key={item.id} href={`/${item.type}s/${item.id}`} className="group">
              <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer border-border shadow-sm">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      {item.type === "page" ? <FileText className="w-5 h-5" /> : <Database className="w-5 h-5" />}
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300" />
                  </div>
                  <CardTitle className="text-base mt-4 line-clamp-1">{item.title}</CardTitle>
                  <CardDescription className="capitalize">{item.type}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
          {(!overview?.recentItems || overview.recentItems.length === 0) && (
            <div className="col-span-full py-12 text-center text-muted-foreground border rounded-xl border-dashed">
              No recent items found.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
