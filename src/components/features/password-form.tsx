"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { verifyLinkPassword } from "@/app/actions/verify-password";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function PasswordForm({ slug }: { slug: string }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
        const result = await verifyLinkPassword(slug, password);
        if (result.success) {
            toast.success("Access Granted");
            // Reload window to trigger server redirect logic or router push to slug
            // Since the route handler handles the slug, navigating to /[slug] is enough.
            // window.location.href might be safer to ensure fresh request to server route handler.
            window.location.href = `/${slug}`; 
        } else {
            toast.error(result.error || "Incorrect password");
            setLoading(false);
        }
    } catch {
        toast.error("Something went wrong");
        setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-20">
      <CardHeader>
        <div className="mx-auto bg-muted rounded-full p-3 mb-2 w-fit">
            <Lock className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-center">Password Protected</CardTitle>
        <CardDescription className="text-center">
          This link is password protected. Please enter the password to continue.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            type="password" 
            placeholder="Enter password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Verifying..." : "Unlock Link"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
