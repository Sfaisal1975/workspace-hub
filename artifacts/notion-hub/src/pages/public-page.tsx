import { useGetPublishedPage, getGetPublishedPageQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Loader2, ArrowLeft, Calendar, Globe } from "lucide-react";
import { format } from "date-fns";

export default function PublicPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: page, isLoading } = useGetPublishedPage(slug!, {
    query: { enabled: !!slug, queryKey: getGetPublishedPageQueryKey(slug!) }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center py-24 px-4">
          <h1 className="text-2xl font-bold text-foreground mb-2">Page not found</h1>
          <p className="text-muted-foreground mb-6">
            This page isn't published or doesn't exist.
          </p>
          <Link href="/content-hub">
            <span className="text-primary hover:underline">Go to Content Hub</span>
          </Link>
        </div>
      </div>
    );
  }

  const renderContentBlock = (block: any, index: number) => {
    switch (block.type) {
      case 'heading_1':
        return <h1 key={index} className="text-3xl font-bold mt-10 mb-5 text-foreground">{block.text}</h1>;
      case 'heading_2':
        return <h2 key={index} className="text-2xl font-bold mt-8 mb-4 text-foreground">{block.text}</h2>;
      case 'heading_3':
        return <h3 key={index} className="text-xl font-bold mt-6 mb-3 text-foreground">{block.text}</h3>;
      case 'paragraph':
        return <p key={index} className="leading-relaxed mb-4 text-foreground/90">{block.text || '\u00A0'}</p>;
      case 'bulleted_list_item':
        return <li key={index} className="ml-4 list-disc mb-1 text-foreground/90">{block.text}</li>;
      case 'numbered_list_item':
        return <li key={index} className="ml-4 list-decimal mb-1 text-foreground/90">{block.text}</li>;
      case 'quote':
        return <blockquote key={index} className="border-l-4 border-primary/40 pl-4 italic text-muted-foreground my-6">{block.text}</blockquote>;
      case 'code':
        return (
          <pre key={index} className="bg-muted/80 p-4 rounded-lg overflow-x-auto text-sm font-mono my-6 border border-border">
            <code>{block.text}</code>
          </pre>
        );
      case 'divider':
        return <hr key={index} className="my-8 border-border" />;
      default:
        return <p key={index} className="text-muted-foreground text-sm mb-2">[Unsupported block: {block.type}]</p>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Public header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/content-hub" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors group">
            <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            Content Hub
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="w-4 h-4" />
            <span>Publicly shared</span>
          </div>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            {page.title || "Untitled"}
          </h1>
          {page.description && (
            <p className="text-lg text-muted-foreground">{page.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
            {page.publishedAt && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Published {format(new Date(page.publishedAt), "MMMM d, yyyy")}
              </span>
            )}
          </div>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          {page.content && page.content.length > 0 ? (
            page.content.map((block, i) => renderContentBlock(block, i))
          ) : (
            <div className="py-12 text-center text-muted-foreground italic">
              This page is empty.
            </div>
          )}
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-3xl mx-auto px-6 py-8 text-center text-sm text-muted-foreground">
          Published from Notion via Notion Hub
        </div>
      </footer>
    </div>
  );
}
