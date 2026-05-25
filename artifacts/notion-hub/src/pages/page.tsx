import { useGetPage, getGetPageQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Loader2, ArrowLeft, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function PageDetail() {
  const { id } = useParams<{ id: string }>();
  
  const { data: page, isLoading } = useGetPage(id!, {
    query: { enabled: !!id, queryKey: getGetPageQueryKey(id!) }
  });

  if (isLoading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div className="py-24 text-center border rounded-2xl border-dashed border-border bg-card/50">
          <h3 className="text-lg font-medium text-foreground mb-1">Page not found</h3>
          <p className="text-muted-foreground">This page doesn't exist or you don't have access to it.</p>
        </div>
      </div>
    );
  }

  const renderContentBlock = (block: any, index: number) => {
    switch (block.type) {
      case 'heading_1':
        return <h1 key={index} className="text-3xl font-bold mt-8 mb-4">{block.text}</h1>;
      case 'heading_2':
        return <h2 key={index} className="text-2xl font-bold mt-6 mb-3">{block.text}</h2>;
      case 'heading_3':
        return <h3 key={index} className="text-xl font-bold mt-4 mb-2">{block.text}</h3>;
      case 'paragraph':
        return <p key={index} className="leading-relaxed mb-4">{block.text || '\u00A0'}</p>;
      case 'bulleted_list_item':
        return <li key={index} className="ml-4 list-disc mb-1">{block.text}</li>;
      case 'numbered_list_item':
        return <li key={index} className="ml-4 list-decimal mb-1">{block.text}</li>;
      case 'quote':
        return <blockquote key={index} className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4">{block.text}</blockquote>;
      case 'code':
        return (
          <pre key={index} className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono my-4">
            <code>{block.text}</code>
          </pre>
        );
      case 'divider':
        return <hr key={index} className="my-8 border-border" />;
      default:
        return <p key={index} className="text-muted-foreground text-sm mb-2">[Unsupported block type: {block.type}]</p>;
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 min-h-full pb-24 bg-card shadow-sm border-x border-border">
      <header className="space-y-6 pt-4">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors group">
          <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Back to Hub
        </Link>
        
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">{page.title || "Untitled"}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {page.createdAt && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Created {format(new Date(page.createdAt), "MMMM d, yyyy")}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="prose prose-slate dark:prose-invert max-w-none">
        {page.content && page.content.length > 0 ? (
          page.content.map((block, i) => renderContentBlock(block, i))
        ) : (
          <div className="py-12 text-center text-muted-foreground italic">
            This page is empty.
          </div>
        )}
      </div>
    </div>
  );
}
