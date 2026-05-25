import { useSearchNotion, getSearchNotionQueryKey } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, FileText, Database, Loader2, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { format } from "date-fns";

export default function SearchPage() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialQuery = searchParams.get("q") || "";
  
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      if (query) {
        setLocation(`/search?q=${encodeURIComponent(query)}`, { replace: true });
      } else {
        setLocation('/search', { replace: true });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [query, setLocation]);

  const { data: results, isLoading } = useSearchNotion({ q: debouncedQuery }, {
    query: {
      enabled: debouncedQuery.length > 0,
      queryKey: getSearchNotionQueryKey({ q: debouncedQuery })
    }
  });

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <SearchIcon className="w-8 h-8 text-primary" />
          Search
        </h1>
        
        <div className="relative max-w-2xl">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages and databases..." 
            className="pl-12 h-14 text-lg shadow-sm rounded-xl border-border bg-card"
            autoFocus
          />
        </div>
      </header>

      <div className="space-y-4">
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && debouncedQuery && results?.length === 0 && (
          <div className="py-24 text-center border rounded-2xl border-dashed border-border bg-card/50">
            <SearchIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-foreground mb-1">No results found</h3>
            <p className="text-muted-foreground">We couldn't find anything matching "{debouncedQuery}".</p>
          </div>
        )}

        {!isLoading && !debouncedQuery && (
          <div className="py-24 text-center border rounded-2xl border-dashed border-border bg-card/50">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
            <p className="text-muted-foreground">Type something above to start searching your workspace.</p>
          </div>
        )}

        {!isLoading && results && results.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Found {results.length} result{results.length === 1 ? '' : 's'}
            </p>
            {results.map((result) => (
              <Link key={result.id} href={`/${result.type}s/${result.id}`}>
                <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-all cursor-pointer group hover-elevate">
                  <div className="p-3 bg-muted rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    {result.type === "page" ? <FileText className="w-5 h-5" /> : <Database className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {result.title || 'Untitled'}
                    </h3>
                    <div className="flex gap-3 text-sm text-muted-foreground mt-1">
                      <span className="capitalize">{result.type}</span>
                      {result.createdAt && (
                        <>
                          <span>•</span>
                          <span>{format(new Date(result.createdAt), "MMM d, yyyy")}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0 text-primary" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
