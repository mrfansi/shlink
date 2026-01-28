"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createApiKey, deleteApiKey } from "@/app/actions/api-keys";
import { useRouter } from "next/navigation";
import { Trash2, Copy } from "lucide-react";
import { toast } from "sonner";
import { ApiKey } from "@/db/schema";

interface ApiKeyManagerProps {
    keys: ApiKey[];
}

export function ApiKeyManager({ keys }: ApiKeyManagerProps) {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleCreate = async () => {
        if (!name) return;
        setLoading(true);
        const res = await createApiKey(name);
        setLoading(false);
        if (res.success) {
            toast.success("API Key Created", {
                description: `Key: ${res.key} - Copy it now!`,
                duration: 10000,
            });
            setName("");
            router.refresh();
        } else {
            toast.error("Failed to create key");
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Revoke this key?")) {
            await deleteApiKey(id);
            router.refresh();
            toast.success("Key revoked");
        }
    };

    const copyKey = (key: string) => {
        navigator.clipboard.writeText(key);
        toast.success("Copied");
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>Manage your API keys for external access.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <Input 
                        placeholder="Key Name (e.g. CI/CD)" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                    />
                    <Button onClick={handleCreate} disabled={loading}>Generate</Button>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Key Prefix</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {keys.map((k) => (
                            <TableRow key={k.id}>
                                <TableCell>{k.name}</TableCell>
                                <TableCell className="font-mono text-xs">
                                    {k.key.substring(0, 5)}...{k.key.substring(k.key.length - 4)}
                                </TableCell>
                                <TableCell>{k.createdAt ? new Date(k.createdAt).toLocaleDateString() : "-"}</TableCell>
                                <TableCell className="text-right flex justify-end gap-2">
                                    <Button size="icon" variant="ghost" onClick={() => copyKey(k.key)}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(k.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
