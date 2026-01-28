"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Download, ExternalLink, Check } from "lucide-react";
import { useState } from "react";
import type { CreateLinkResult } from "@/app/actions";

interface ResultCardProps {
  result: CreateLinkResult & { success: true };
  onReset?: () => void;
}

export function ResultCard({ result, onReset }: ResultCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const downloadQr = () => {
    const link = document.createElement("a");
    // Use encodeURIComponent to safely handle SVG content
    link.href = `data:image/svg+xml;utf8,${encodeURIComponent(result.qrCode)}`;
    link.download = `qrcode-${result.slug}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-muted/40 animate-in fade-in zoom-in-95 duration-300">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Your Link is Ready!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-muted/50 p-4 rounded-lg flex items-center justify-between gap-2 border border-border">
          <div className="truncate font-mono text-sm flex-1">
            <a href={result.shortUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1 text-primary">
              <span className="truncate">{result.shortUrl}</span>
              <ExternalLink className="h-3 w-3 opacity-50" />
            </a>
          </div>
          <Button variant="ghost" size="icon" onClick={handleCopy} className="h-8 w-8 shrink-0">
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            <span className="sr-only">Copy URL</span>
          </Button>
        </div>
        
        <div className="flex justify-center p-6 bg-white rounded-xl border border-border shadow-sm">
          <div 
             className="w-48 h-48 [&>svg]:w-full [&>svg]:h-full"
             dangerouslySetInnerHTML={{ __html: result.qrCode }} 
          />
        </div>
        
        <div className="text-center text-sm text-muted-foreground break-all px-4">
           Original: {result.originalUrl}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button variant="outline" className="w-full" onClick={downloadQr}>
          <Download className="mr-2 h-4 w-4" />
          Download QR Code
        </Button>
        <Button variant="ghost" className="w-full" onClick={onReset}>
          Shorten Another
        </Button>
      </CardFooter>
    </Card>
  );
}
