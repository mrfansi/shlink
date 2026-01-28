"use client";

import { Link as DBLink } from "@/db/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Copy, BarChart2, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link"; // For navigation
import { deleteLink } from "@/app/actions";

interface LinkListProps {
  links: DBLink[];
  baseUrl: string; // To construct full short URL
}

import { Edit2, QrCode } from "lucide-react";
import { useState } from "react";
import { EditLinkModal } from "./edit-link-modal";
import { QRCodeModal } from "./qr-code-modal";

export function LinkList({ links, baseUrl }: LinkListProps) {
  const router = useRouter();
  const [editingLink, setEditingLink] = useState<DBLink | null>(null);
  const [qrLink, setQrLink] = useState<{slug: string, url: string} | null>(null);

  const copyToClipboard = (slug: string) => {
    const url = `${baseUrl}/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Copied to clipboard");
  };

  const handleDelete = async (id: string) => {
      if (confirm("Are you sure you want to delete this link?")) {
          const res = await deleteLink(id);
          if (res.success) {
             toast.success("Link deleted");
             router.refresh();
          } else {
             toast.error(res.error || "Failed to delete");
          }
      }
  }

  if (links.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/10">
        <p className="text-muted-foreground">No links found. Create your first one!</p>
      </div>
    );
  }

  return (
    <>
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Short Link</TableHead>
            <TableHead>Original URL</TableHead>
            <TableHead className="text-right">Clicks</TableHead>
            <TableHead className="text-right">Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {links.map((link) => {
            const shortUrl = `${baseUrl}/${link.slug}`;
            return (
              <TableRow key={link.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <a href={shortUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                      /{link.slug}
                    </a>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyToClipboard(link.slug)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                    {!link.isActive && <span className="text-xs text-destructive ml-2">(Inactive)</span>}
                  </div>
                </TableCell>
                <TableCell className="max-w-[200px] truncate" title={link.originalUrl}>
                  {link.originalUrl}
                </TableCell>
                <TableCell className="text-right">{link.clickCount}</TableCell>
                <TableCell className="text-right text-muted-foreground text-sm">
                  {new Date(link.createdAt || Date.now()).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="icon" variant="ghost" onClick={() => setQrLink({ slug: link.slug, url: shortUrl })}>
                      <QrCode className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setEditingLink(link)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" asChild>
                      <Link href={`/links/${link.id}/analytics`}>
                        <BarChart2 className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(link.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
    
    {editingLink && (
        <EditLinkModal 
            link={editingLink} 
            open={!!editingLink} 
            onClose={() => setEditingLink(null)} 
        />
    )}

    {qrLink && (
        <QRCodeModal
            slug={qrLink.slug}
            items={qrLink.url}
            open={!!qrLink}
            onClose={() => setQrLink(null)}
        />
    )}
    </>
  );
}
