"use client";

import { useState } from "react";
import { ShortenerForm } from "./shortener-form";
import { CreateLinkResult } from "@/app/actions";
import { ResultCard } from "./result-card";
import { useRouter } from "next/navigation";

export function DashboardCreator() {
    const [result, setResult] = useState<CreateLinkResult | null>(null);
    const router = useRouter();

    return (
        <div className="space-y-4 max-w-2xl mx-auto">
            {!result ? (
                <ShortenerForm onSuccess={(res) => {
                    if (res.success) {
                        setResult(res);
                        router.refresh(); 
                    }
                }} /> 
            ) : result.success ? (
                <ResultCard result={result} onReset={() => setResult(null)} />
            ) : null}
        </div>
    )
}
