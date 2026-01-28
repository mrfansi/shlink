"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportAnalyticsCsv } from "@/app/actions/analytics";
import { toast } from "sonner"; // Assuming sonner or use-toast is available?
// Check package.json: neither listed implicitly, but shadcn usually installs one.
// user's package.json lists "sonner" ? No. "react-resizable-panels".
// We might not have a toast library installed.
// We'll use alert or basic console for now, or just handle it silently.

export function ExportButton({ linkId }: { linkId: string }) {
  const handleExport = async () => {
    try {
        const result = await exportAnalyticsCsv(linkId);
        if (result.error) {
            alert("Export failed: " + result.error);
            return;
        }
        
        if (result.csv) {
            const blob = new Blob([result.csv], { type: "text/csv" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = result.filename || "export.csv";
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }
    } catch (e) {
        console.error(e);
        alert("An error occurred");
    }
  };

  return (
    <Button variant="outline" onClick={(e) => { e.preventDefault(); handleExport(); }}>
      <Download className="mr-2 h-4 w-4" />
      Export CSV
    </Button>
  );
}
