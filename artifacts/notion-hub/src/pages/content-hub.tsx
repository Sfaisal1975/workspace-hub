import { useListPublishedPages } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Globe, ArrowRight, Calendar, Loader2, FileText } from "lucide-react";
import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ContentHub() {
  const { data: pages, isLoading } = useListPublishedPages();

  if (isLoading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <Globe className="w-8 h-8 text-primary" />
          Content Hub
        </h1>
        <p className="text-lg text-muted-foreground">
          Published pages from your Notion workspace, shared as a public website.
        </p>
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Published Pages
          </h2>
          <span className="text-sm text-muted-foreground">
            {pages?.length || 0} page{pages?.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pages?.map((page) => (
            <Link key={page.notionPageId} href={`/content/${page.slug}`} className="group">
              <Card className="h-full hover:border-primary/50 transition-all cursor-pointer border-border shadow-sm hover-elevate">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <FileText className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300" />
                  </div>
                  <CardTitle className="text-base mt-4 line-clamp-1">{page.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {page.description || "No description"}
                  </CardDescription>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-3">
                    <Calendar className="w-3 h-3" />
                    {page.publishedAt
                      ? `Published ${format(new Date(page.publishedAt), "MMM d, yyyy")}`
                      : "Recently published"}
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}

          {(!pages || pages.length === 0) && (
            <div className="col-span-full py-16 text-center border rounded-2xl border-dashed border-border bg-card/50">
              <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-medium text-foreground mb-1">
                No published pages yet
              </h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Open any Notion page in the hub and click "Publish to Content Hub" to share it publicly.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
