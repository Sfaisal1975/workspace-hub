import { useListDatabases } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Database, ArrowRight, Loader2, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function Databases() {
  const { data: databases, isLoading } = useListDatabases();

  if (isLoading) {
    return (
      <div className="p-8 h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <Database className="w-8 h-8 text-primary" />
          Databases
        </h1>
        <p className="text-muted-foreground mt-2">Manage and view all your structured content.</p>
      </header>

      {(!databases || databases.length === 0) ? (
        <div className="py-24 text-center border rounded-2xl border-dashed border-border bg-card/50">
          <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-foreground mb-1">No databases found</h3>
          <p className="text-muted-foreground">You don't have any databases in your workspace yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {databases.map((db) => (
            <Link key={db.id} href={`/databases/${db.id}`} className="block group">
              <Card className="h-full hover:border-primary/50 transition-all cursor-pointer shadow-sm hover:shadow-md hover-elevate">
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">{db.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground gap-4">
                    {db.createdAt && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(db.createdAt), "MMM d, yyyy")}
                      </span>
                    )}
                    <span className="flex-1" />
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
