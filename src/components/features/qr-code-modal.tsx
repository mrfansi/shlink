"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

interface QRCodeModalProps {
    slug: string;
    items: string; // The URL
    open: boolean;
    onClose: () => void;
}

export function QRCodeModal({ slug, items, open, onClose }: QRCodeModalProps) {
    const downloadQR = () => {
        const svg = document.getElementById("qr-code-svg");
        if (!svg) return;
        
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL("image/png");
            
            const downloadLink = document.createElement("a");
            downloadLink.download = `qr-${slug}.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };
        img.src = "data:image/svg+xml;base64," + btoa(svgData);
        toast.success("Download started");
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-xs">
                <DialogHeader>
                    <DialogTitle className="text-center">QR Code</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center p-4 space-y-4">
                     <div className="bg-white p-4 rounded-lg">
                        <QRCodeSVG 
                            id="qr-code-svg"
                            value={items} 
                            size={200}
                            level={"H"}
                            includeMargin={true}
                        />
                     </div>
                     <div className="flex gap-2 w-full">
                         <Button className="flex-1" onClick={downloadQR}>
                             <Download className="mr-2 h-4 w-4" /> Download
                         </Button>
                     </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
