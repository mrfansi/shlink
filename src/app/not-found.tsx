import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background text-foreground">
      <h1 className="text-6xl font-black text-primary">404</h1>
      <h2 className="mt-4 text-2xl font-bold tracking-tight">Page Not Found</h2>
      <p className="mt-2 text-muted-foreground text-center max-w-md">
        Sorry, we couldn't find the page you're looking for. It might have been removed, renamed, or doesn't exist.
      </p>
      <div className="mt-8 flex gap-4">
        <Button asChild>
          <Link href="/">
            Go Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
