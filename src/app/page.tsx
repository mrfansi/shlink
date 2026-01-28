"use client";

import { useState } from "react";
import { ShortenerForm } from "@/components/features/shortener-form";
import { ResultCard } from "@/components/features/result-card";
import type { CreateLinkResult } from "@/app/actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [result, setResult] = useState<CreateLinkResult & { success: true } | null>(null);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-6 py-4 flex items-center justify-between border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
        <div className="font-bold text-xl tracking-tight flex items-center gap-2">
           <svg
             xmlns="http://www.w3.org/2000/svg"
             viewBox="0 0 24 24"
             fill="none"
             stroke="currentColor"
             strokeWidth="2"
             strokeLinecap="round"
             strokeLinejoin="round"
             className="h-6 w-6"
           >
             <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
             <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
           </svg>
           Shlink
        </div>
         <nav className="flex items-center gap-4">
           <Link href="/sign-in">
             <Button variant="ghost">Sign In</Button>
           </Link>
           <Link href="/sign-up">
             <Button>Get Started</Button>
           </Link>
         </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-24 bg-linear-to-b from-background to-muted/20">
        <div className="container max-w-4xl mx-auto flex flex-col items-center gap-12">
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight lg:text-7xl bg-clip-text text-transparent bg-linear-to-r from-primary to-violet-500 pb-2">
              Shorten Your Links
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Create short, powerful links with QR codes and analytics. <br className="hidden sm:inline" />
              Open source, secure, and blazingly fast.
            </p>
          </div>

          <div className="w-full max-w-lg transition-all duration-300">
            {result ? (
              <ResultCard result={result} onReset={() => setResult(null)} />
            ) : (
              <ShortenerForm onSuccess={setResult} />
            )}
          </div>
        </div>
      </main>
      
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        <p>&copy; {new Date().getFullYear()} Shlink. All rights reserved.</p>
      </footer>
    </div>
  );
}
