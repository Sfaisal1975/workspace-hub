import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">Page not found</p>
      <Link href="/">
        <span className="text-sm text-primary hover:underline cursor-pointer">
          Back to Inbox
        </span>
      </Link>
    </div>
  );
}
