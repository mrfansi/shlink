"use client";

import { useState } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { bulkCreateLinks } from "@/app/actions/bulk";
import { toast } from "sonner";
import { UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";

export function BulkUploader() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                // Expected header: url, slug (optional)
                const rows = results.data as { url: string; slug?: string }[];
                const validRows = rows.filter(r => r.url && r.url.startsWith("http"));
                
                if (validRows.length === 0) {
                    toast.error("No valid URLs found in CSV. Headers needed: url, slug (optional)");
                    return;
                }

                setLoading(true);
                const res = await bulkCreateLinks(validRows);
                setLoading(false);
                
                if (res.success) {
                    toast.success(`Processed: ${res.stats?.successCount} created, ${res.stats?.failCount} failed`);
                    router.refresh();
                } else {
                    toast.error("Bulk upload failed");
                }
            }
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Bulk Import</CardTitle>
                <CardDescription>Upload a CSV file with headers: <code>url</code>, <code>slug</code> (optional)</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4">
                     <Input type="file" accept=".csv" onChange={handleFile} disabled={loading} />
                     {loading && <div className="text-sm text-muted-foreground animate-pulse">Processing...</div>}
                </div>
            </CardContent>
        </Card>
    );
}
