import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

export default function ExpiredPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="rounded-full bg-muted p-4 mb-4">
          <Clock className="w-8 h-8 text-muted-foreground" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight">Link Expired</h1>
      <p className="mt-2 text-muted-foreground text-center max-w-md">
        This link has reached its expiration date or usage limit and is no longer active.
      </p>
      <div className="mt-8 flex gap-4">
        <Button asChild>
          <Link href="/">
            Create New Link
          </Link>
        </Button>
      </div>
    </div>
  );
}
