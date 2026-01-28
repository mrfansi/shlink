"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

export default function DomainsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Custom Domains</h1>
                    <p className="text-muted-foreground">Connect your own domains to brand your short links.</p>
                </div>
                <Button disabled>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Domain
                </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Connected Domains</CardTitle>
                    <CardDescription>
                        You are currently using the default domain. Custom domains feature is coming soon.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground bg-muted/20 rounded-lg border-dashed border-2">
                        <p>No custom domains connected</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
