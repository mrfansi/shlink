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

import { ChevronsUpDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// ... existing code

export function ShortenerForm({ onSuccess }: ShortenerFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  async function handleSubmit(formData: FormData) {
    // ... same handleSubmit logic
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

          <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
             <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" type="button" className="w-full flex justify-between">
                   Advanced Options <ChevronsUpDown className="h-4 w-4" />
                </Button>
             </CollapsibleTrigger>
             <CollapsibleContent className="space-y-4 pt-2">
                <div className="space-y-2">
                   <Label htmlFor="slug">Custom Slug (Optional)</Label>
                   <Input 
                      id="slug" 
                      name="slug" 
                      placeholder="e.g. my-custom-link" 
                      pattern="^[a-zA-Z0-9_-]{3,50}$"
                      title="3-50 characters, letters, numbers, hyphens, and underscores."
                   />
                   <p className="text-xs text-muted-foreground">Leave empty for a random short link.</p>
                </div>
                
                <div className="space-y-2 border-t pt-4">
                   <Label className="text-xs font-semibold uppercase text-muted-foreground">UTM Builder</Label>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                         <Label htmlFor="utm_source" className="text-xs">Source</Label>
                         <Input id="utm_source" name="utm_source" placeholder="google, newsletter" className="h-8 text-sm" />
                      </div>
                      <div className="space-y-1">
                         <Label htmlFor="utm_medium" className="text-xs">Medium</Label>
                         <Input id="utm_medium" name="utm_medium" placeholder="cpc, banner" className="h-8 text-sm" />
                      </div>
                   </div>
                   <div className="space-y-1">
                      <Label htmlFor="utm_campaign" className="text-xs">Campaign</Label>
                      <Input id="utm_campaign" name="utm_campaign" placeholder="spring_sale" className="h-8 text-sm" />
                   </div>
                </div>
             </CollapsibleContent>
          </Collapsible>
          
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
