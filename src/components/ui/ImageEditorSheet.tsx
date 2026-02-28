"use client";

import React from "react";
import { Sheet } from "./Sheet";
import { ImageEditor } from "./ImageEditor";
import { ImageIcon } from "lucide-react";

interface ImageEditorSheetProps {
    open: boolean;
    onClose: () => void;
    imageUrl: string;
    onSave: (dataUrl: string) => void;
    targetLayout?: "profile" | "cover" | "product" | "free";
}

/**
 * ImageEditorSheet:
 * Wraps the ImageEditor in a responsive Sheet (SideSheet for Desktop, BottomSheet for Mobile)
 */
export function ImageEditorSheet({ open, onClose, imageUrl, onSave, targetLayout }: ImageEditorSheetProps) {
    const handleSave = (dataUrl: string) => {
        onSave(dataUrl);
        onClose();
    };

    return (
        <Sheet
            open={open}
            onClose={onClose}
            title="Edit Photo"
            icon={<ImageIcon size={20} />}
        >
            <div className="h-[70vh] md:h-full -mx-6 -my-5 md:mx-0 md:my-0 flex flex-col">
                <ImageEditor
                    imageUrl={imageUrl}
                    onSave={handleSave}
                    onClose={onClose}
                    targetLayout={targetLayout}
                />
            </div>
        </Sheet>
    );
}
