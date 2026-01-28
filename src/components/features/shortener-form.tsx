"use client";

import { useState } from "react";
import { createLink, type CreateLinkResult } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, LinkIcon, ArrowRight } from "lucide-react";

interface ShortenerFormProps {
  onSuccess?: (result: CreateLinkResult & { success: true }) => void;
}

export function ShortenerForm({ onSuccess }: ShortenerFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    
    try {
      const result = await createLink(formData);
      
      if (result.success) {
        onSuccess?.(result);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-muted/40">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Shorten your URL</CardTitle>
        <CardDescription>Enter a long URL to create a short, shareable link.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="originalUrl">Long URL</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                id="originalUrl" 
                name="originalUrl" 
                placeholder="https://example.com/very-long-url" 
                type="url" 
                required
                className="pl-9"
              />
            </div>
          </div>
          
          {error && (
            <div className="text-sm text-destructive font-medium px-1">
              {error}
            </div>
          )}
          
          <Button type="submit" className="w-full" disabled={loading} size="lg">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Shortening...
              </>
            ) : (
              <>
                Shorten URL
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
