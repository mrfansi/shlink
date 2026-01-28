"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { updateLink } from "@/app/actions/update-link";
import { toast } from "sonner";
import { Link as DBLink } from "@/db/schema";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface EditLinkModalProps {
    link: DBLink;
    open: boolean;
    onClose: () => void;
}

export function EditLinkModal({ link, open, onClose }: EditLinkModalProps) {
    const [originalUrl, setOriginalUrl] = useState(link.originalUrl);
    const [isActive, setIsActive] = useState(link.isActive ?? true);
    const [password, setPassword] = useState("");
    const [expiresAt, setExpiresAt] = useState(link.expiresAt ? new Date(link.expiresAt).toISOString().split('T')[0] : "");
    const [tags, setTags] = useState<string[]>(link.tags || []);
    const [newTag, setNewTag] = useState("");
    
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSave = async () => {
        setLoading(true);
        const res = await updateLink({
            linkId: link.id,
            originalUrl,
            isActive,
            password: password || undefined, // Only updates if provided
            expiresAt: expiresAt || undefined,
            tags
        });
        setLoading(false);

        if (res.success) {
            toast.success("Link updated");
            router.refresh();
            onClose();
        } else {
            toast.error(res.error || "Update failed");
        }
    };

    const addTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newTag.trim()) {
            e.preventDefault();
            if (!tags.includes(newTag.trim())) {
                setTags([...tags, newTag.trim()]);
            }
            setNewTag("");
        }
    };

    const removeTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag));
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Link: /{link.slug}</DialogTitle>
                    <DialogDescription>
                        Modify destination, settings, and tags.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Destination URL</Label>
                        <Input value={originalUrl} onChange={(e) => setOriginalUrl(e.target.value)} />
                    </div>
                    
                    <div className="grid gap-2">
                        <Label>Parameters</Label>
                        <div className="flex items-center space-x-2">
                             <Switch checked={isActive} onCheckedChange={setIsActive} />
                             <Label>Active</Label>
                        </div>
                    </div>

                    <div className="grid gap-2">
                         <Label>Password Protection (Optional)</Label>
                         <Input 
                            type="password" 
                            placeholder="Set new password (leave empty to keep unchanged)" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                        />
                        <p className="text-xs text-muted-foreground">Note: This will overwrite existing password.</p>
                    </div>

                    <div className="grid gap-2">
                        <Label>Expiration Date</Label>
                        <Input 
                            type="date" 
                            value={expiresAt} 
                            onChange={(e) => setExpiresAt(e.target.value)} 
                        />
                    </div>
                    
                    <div className="grid gap-2">
                        <Label>Tags</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                             {tags.map(tag => (
                                 <Badge key={tag} variant="secondary" className="gap-1">
                                     {tag}
                                     <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)}/>
                                 </Badge>
                             ))}
                        </div>
                        <Input 
                            placeholder="Add tag (Press Enter)" 
                            value={newTag} 
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={addTag}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} disabled={loading}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
