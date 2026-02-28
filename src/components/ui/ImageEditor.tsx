"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import {
    X, Type, Smile, Check, Trash2,
    RotateCw, Undo2, Redo2,
    SlidersHorizontal, Crop as CropIcon, Wand2, Palette, Upload, ZoomIn, Loader2,
    Sparkles, Link2, Globe, Search
} from "lucide-react";
import Cropper from "react-easy-crop";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { cn } from "@/lib/utils";
import { useBusiness } from "@/contexts/BusinessContext";
import { Copy, Tag, AlignLeft, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

interface OverlayObject {
    id: string;
    type: "text" | "emoji";
    content: string;
    x: number;
    y: number;
    fontSize: number;
    color: string;
    rotation: number;
    backgroundColor?: string;
    outlineColor?: string;
    fontFamily?: string;
    fontWeight?: string;
}

interface VisualAdjustments {
    brightness: number;
    contrast: number;
    saturation: number;
}

interface EditorState {
    overlays: OverlayObject[];
    adjustments: VisualAdjustments;
    crop?: { x: number, y: number, width: number, height: number };
}

type EditorMode = "markup" | "text" | "adjust" | "crop" | "ai" | "generate" | "import";

interface ImageEditorProps {
    imageUrl: string;
    onSave: (dataUrl: string) => void;
    onClose: () => void;
    targetLayout?: "profile" | "cover" | "product" | "free";
}

export function ImageEditor({ imageUrl, onSave, onClose, targetLayout = "free" }: ImageEditorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [mode, setMode] = useState<EditorMode>("crop");
    const [mounted, setMounted] = useState(false);
    const [localImageUrl, setLocalImageUrl] = useState<string | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isProcessingAI, setIsProcessingAI] = useState<string | false>(false);
    const [analysisResult, setAnalysisResult] = useState<{ title: string, description: string, tags: string[] } | null>(null);
    const [generationPrompt, setGenerationPrompt] = useState("");
    const [aiError, setAiError] = useState<string | null>(null);
    const [showUrlInput, setShowUrlInput] = useState(false);
    const [importUrl, setImportUrl] = useState("");
    const [discoveredImages, setDiscoveredImages] = useState<string[]>([]);
    const [isExtracting, setIsExtracting] = useState(false);
    const { currentBusiness, refreshBusinesses } = useBusiness();
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        return () => {
            // Clean up blob URLs on unmount to prevent memory leaks
            if (localImageUrl && localImageUrl.startsWith("blob:")) {
                URL.revokeObjectURL(localImageUrl);
            }
        };
    }, [localImageUrl]);

    const activeUrl = localImageUrl || imageUrl;

    // State & History
    const [state, setState] = useState<EditorState>({
        overlays: [],
        adjustments: { brightness: 100, contrast: 100, saturation: 100 }
    });
    const [history, setHistory] = useState<EditorState[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState<{ x: number, y: number } | null>(null);
    const [cropArea, setCropArea] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);

    // activeRatio is just for the UI toggles, if targetLayout is 'free'
    const [activeRatio, setActiveRatio] = useState<string>("Free");

    // Determine the actual locked aspect ratio based on targetLayout
    const aspect = targetLayout === "profile" ? 1 :
        targetLayout === "cover" ? 16 / 9 :
            targetLayout === "product" ? 4 / 3 :
                (activeRatio === "1:1" ? 1 :
                    activeRatio === "4:3" ? 4 / 3 :
                        activeRatio === "16:9" ? 16 / 9 : undefined);



    // Load image
    useEffect(() => {
        if (!activeUrl || activeUrl === "NEW_UPLOAD") {
            if (activeUrl !== "NEW_UPLOAD") setLoadError("No image URL provided");
            return;
        }

        const isMaybeImage = activeUrl.startsWith("data:") ||
            activeUrl.startsWith("blob:") ||
            activeUrl.startsWith("/") ||
            /\.(jpg|jpeg|png|webp|gif|svg|avif|bmp|tiff)($|\?)/i.test(activeUrl);

        if (!isMaybeImage) {
            setLoadError("The provided URL does not appear to be a supported image format.");
            return;
        }

        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = () => {
            setImage(img);
            setLoadError(null);
            // Initial history
            const initialState = {
                overlays: [],
                adjustments: { brightness: 100, contrast: 100, saturation: 100 }
            };
            setHistory([initialState]);
            setHistoryIndex(0);
        };

        img.onerror = () => {
            console.error("Failed to load image:", activeUrl);
            setLoadError("Failed to load image. This is likely a CORS restriction from your hosting provider.");
        };

        if (activeUrl.startsWith("data:") || activeUrl.startsWith("blob:") || activeUrl.startsWith("/")) {
            img.src = activeUrl;
        } else {
            // Use our proxy route to bypass CORS issues for canvas
            img.src = `/api/proxy-image?url=${encodeURIComponent(activeUrl)}`;
        }
    }, [activeUrl]);

    // Automatically trigger picker if NEW_UPLOAD
    useEffect(() => {
        if (imageUrl === "NEW_UPLOAD" && mounted && !localImageUrl) {
            fileInputRef.current?.click();
        }
    }, [imageUrl, mounted, localImageUrl]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Clean up previous blob URL to prevent memory leaks
        if (localImageUrl && localImageUrl.startsWith("blob:")) {
            URL.revokeObjectURL(localImageUrl);
        }

        const url = URL.createObjectURL(file);
        setLocalImageUrl(url);
        setMode("crop");
    };

    const handleUrlImport = async () => {
        if (!importUrl) return;
        if (!importUrl.startsWith("http")) {
            alert("Please enter a valid URL starting with http:// or https://");
            return;
        }

        setIsExtracting(true);
        setDiscoveredImages([]);

        try {
            const res = await fetch("/api/utils/extract-images", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: importUrl }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to extract images");

            const { images } = data;

            if (images && images.length > 0) {
                if (images.length === 1) {
                    setLocalImageUrl(images[0]);
                    setMode("crop");
                    setImportUrl("");
                } else {
                    setDiscoveredImages(images);
                }
            } else {
                // If no images found by scraper, try loading the URL directly as an image ONLY if it looks like an image
                const isLikelyImage = /\.(jpg|jpeg|png|webp|gif|svg|avif)($|\?)/i.test(importUrl);
                if (isLikelyImage) {
                    setLocalImageUrl(importUrl);
                    setMode("crop");
                    setImportUrl("");
                } else {
                    alert("No images found on this page. Please paste a direct image URL or try another page.");
                }
            }
        } catch (err: any) {
            console.error("Extraction error:", err);
            // Fallback: try loading the URL directly ONLY if it looks like an image
            const isLikelyImage = /\.(jpg|jpeg|png|webp|gif|svg|avif)($|\?)/i.test(importUrl);
            if (isLikelyImage) {
                setLocalImageUrl(importUrl);
                setMode("crop");
                setImportUrl("");
            } else {
                alert(err.message || "Failed to find images on this page.");
            }
        } finally {
            setIsExtracting(false);
        }
    };

    const pushState = useCallback((newState: EditorState) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newState);
        // Limit history size
        if (newHistory.length > 20) newHistory.shift();
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        setState(newState);
    }, [history, historyIndex]);

    const undo = () => {
        if (historyIndex > 0) {
            const prevIndex = historyIndex - 1;
            setHistoryIndex(prevIndex);
            setState(history[prevIndex]);
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1) {
            const nextIndex = historyIndex + 1;
            setHistoryIndex(nextIndex);
            setState(history[nextIndex]);
        }
    };

    // Draw Loop
    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !image) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Apply Visual Adjustments
        ctx.filter = `brightness(${state.adjustments.brightness}%) contrast(${state.adjustments.contrast}%) saturate(${state.adjustments.saturation}%)`;

        // Draw Image
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        // Reset filter for overlays
        ctx.filter = "none";

        // Draw Overlays
        state.overlays.forEach(obj => {
            ctx.save();
            ctx.translate(obj.x, obj.y);
            ctx.rotate((obj.rotation * Math.PI) / 180);

            if (obj.type === "text") {
                const weight = obj.fontWeight || "bold";
                const family = obj.fontFamily || "Inter, sans-serif";
                ctx.font = `${weight} ${obj.fontSize}px ${family}`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";

                const lines = obj.content.split('\n');
                const lineHeight = obj.fontSize * 1.2;
                const totalHeight = lines.length * lineHeight;

                // Find widest line for background box
                let maxWidth = 0;
                lines.forEach(line => {
                    const metrics = ctx.measureText(line);
                    if (metrics.width > maxWidth) {
                        maxWidth = metrics.width;
                    }
                });

                // Background Box if any
                if (obj.backgroundColor) {
                    const padding = 10;
                    ctx.fillStyle = obj.backgroundColor;
                    // Because textAlign is center, the x coordinate is 0, so the box starts from -maxWidth/2
                    ctx.fillRect(-maxWidth / 2 - padding, -totalHeight / 2 - padding / 2, maxWidth + padding * 2, totalHeight + padding);
                }

                // Draw each line
                const startY = -(totalHeight / 2) + (lineHeight / 2); // Center block vertically

                lines.forEach((line, index) => {
                    const lineY = startY + (index * lineHeight);

                    // Outline for readability
                    if (obj.outlineColor && obj.outlineColor !== "transparent") {
                        ctx.strokeStyle = obj.outlineColor;
                        ctx.lineWidth = 4;
                        ctx.lineJoin = "round";
                        ctx.strokeText(line, 0, lineY);
                    }

                    ctx.fillStyle = obj.color;
                    ctx.fillText(line, 0, lineY);
                });

                // Selection indicator
                if (selectedId === obj.id) {
                    ctx.strokeStyle = "var(--color-primary)";
                    ctx.lineWidth = 2;
                    ctx.setLineDash([5, 5]);
                    ctx.strokeRect(-maxWidth / 2 - 10, -totalHeight / 2 - 10, maxWidth + 20, totalHeight + 20);
                }
            } else {
                ctx.font = `${obj.fontSize}px serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(obj.content, 0, 0);

                // Selection indicator for Emoji
                if (selectedId === obj.id) {
                    ctx.strokeStyle = "var(--color-primary)";
                    ctx.lineWidth = 2;
                    ctx.setLineDash([5, 5]);
                    ctx.strokeRect(-obj.fontSize, -obj.fontSize / 2, obj.fontSize * 2, obj.fontSize);
                }
            }

            ctx.restore();
        });
    }, [image, state, selectedId]);

    useEffect(() => {
        // Run draw whenever image, state, or selectedId changes
        draw();
    }, [draw]);

    useEffect(() => {
        // Force a redraw when swapping out of crop mode
        if (mode !== "crop") {
            setTimeout(draw, 50);
        }
    }, [mode, draw]);

    const handleCropComplete = useCallback((_croppedArea: unknown, croppedAreaPixels: { x: number, y: number, width: number, height: number }) => {
        setCropArea(croppedAreaPixels);
    }, []);

    const handleAnalyzeImage = async () => {
        if (!image || isProcessingAI) return;

        setIsProcessingAI("analyze");
        setAiError(null);
        try {
            const canvas = canvasRef.current;
            if (!canvas) {
                setAiError("Image editor error: Canvas not initialized. Please try again.");
                return;
            }

            const imageData = canvas.toDataURL("image/jpeg", 0.8);

            const response = await fetch("/api/ai/analyze-image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    image: imageData,
                    storeId: currentBusiness?._id
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setAiError(data.error || "Failed to analyze image");
                return;
            }

            setAnalysisResult(data);

        } catch (error) {
            const msg = error instanceof Error ? error.message : "Failed to analyze image. Ensure your BYOK key is configured in Settings.";
            setAiError(msg);
            if (!msg.includes("billing") && !msg.includes("API Key")) {
                console.error("Analysis failed:", error);
            }
        } finally {
            setIsProcessingAI(false);
        }
    };

    const handleGenerateImage = async () => {
        if (!generationPrompt || isProcessingAI) return;

        setIsProcessingAI("generate");
        setAiError(null);
        try {
            const response = await fetch("/api/ai/generate-image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: generationPrompt,
                    storeId: currentBusiness?._id
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setAiError(data.error || "Failed to generate image");
                return;
            }

            const newImg = new Image();
            newImg.src = data.result;
            newImg.onload = () => {
                setImage(newImg);
                setMode("crop");
                pushState({
                    ...state,
                    overlays: [],
                    crop: undefined
                });
            };

        } catch (error) {
            const msg = error instanceof Error ? error.message : "Failed to generate image. Ensure your OpenAI key is configured.";
            setAiError(msg);
            if (!msg.includes("billing") && !msg.includes("API Key")) {
                console.error("Generation failed:", error);
            }
        } finally {
            setIsProcessingAI(false);
        }
    };

    const handleApplyCrop = () => {
        if (!cropArea || !image) return;

        const canvas = document.createElement("canvas");
        canvas.width = cropArea.width;
        canvas.height = cropArea.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Apply visual adjustments to the cropped result
        ctx.filter = `brightness(${state.adjustments.brightness}%) contrast(${state.adjustments.contrast}%) saturate(${state.adjustments.saturation}%)`;

        // Calculate the center of the image and the crop pivot to support rotation/zoom perfectly
        // (react-easy-crop applies rotation around the center of the image).
        // Since react-easy-crop gives us coordinates relative to the original image dimensions, 
        // we can simply draw the subset. We ignore general rotation here unless we implement advanced bounding boxes,
        // but react-easy-crop manages the `croppedAreaPixels` to handle rotation automatically for the slice we need!

        ctx.save();
        ctx.translate(-cropArea.x, -cropArea.y);
        ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight);
        ctx.restore();

        // Cap output resolution to prevent memory crashes
        const MAX_DIMENSION = 1600;
        let finalWidth = cropArea.width;
        let finalHeight = cropArea.height;

        if (finalWidth > MAX_DIMENSION || finalHeight > MAX_DIMENSION) {
            const ratio = Math.min(MAX_DIMENSION / finalWidth, MAX_DIMENSION / finalHeight);
            finalWidth = Math.floor(finalWidth * ratio);
            finalHeight = Math.floor(finalHeight * ratio);
        }

        const outCanvas = document.createElement("canvas");
        outCanvas.width = finalWidth;
        outCanvas.height = finalHeight;
        const outCtx = outCanvas.getContext("2d");
        if (!outCtx) return;

        // Draw the scaled crop onto the outCanvas
        outCtx.drawImage(canvas, 0, 0, cropArea.width, cropArea.height, 0, 0, finalWidth, finalHeight);

        const newImg = new Image();
        newImg.src = outCanvas.toDataURL("image/webp", 0.9);
        newImg.onload = () => {
            setImage(newImg);
            setMode("adjust");
            setCropArea(null);
            setZoom(1);
            setRotation(0);
            pushState({
                ...state,
                overlays: [], // Overlays might need repositioning, for now clear them for simplicity or warn user
                crop: undefined
            });
        };
    };

    const handleCanvasClick = (e: React.MouseEvent) => {
        if (mode !== "markup" && mode !== "text") return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        // Suppress unused warning while keeping calculation for logic reference
        console.debug("Canvas click at", { x, y });

        const hit = [...state.overlays].reverse().find(obj => {
            if (mode === "text" && obj.type !== "text") return false;
            if (mode === "markup" && obj.type !== "emoji") return false;

            if (obj.type === "text") {
                const lines = obj.content.split('\n');
                const lineHeight = obj.fontSize * 1.2;
                const totalHeight = lines.length * lineHeight;
                const roughWidth = Math.max(...lines.map(l => l.length)) * (obj.fontSize * 0.6); // Approximate width

                const distX = Math.abs(obj.x - x);
                const distY = Math.abs(obj.y - y);

                return distX < (roughWidth / 2 + 20) && distY < (totalHeight / 2 + 20);
            } else {
                const dist = Math.sqrt(Math.pow(obj.x - x, 2) + Math.pow(obj.y - y, 2));
                return dist < obj.fontSize;
            }
        });

        setSelectedId(hit?.id || null);
    };

    const handleAddText = () => {
        const newObj: OverlayObject = {
            id: Math.random().toString(36).substring(7),
            type: "text",
            content: "New Text",
            x: 500,
            y: 500,
            fontSize: 120, // Mobile base, scaled
            color: "#ffffff",
            outlineColor: "#000000",
            rotation: 0,
            fontFamily: "Inter, sans-serif",
            fontWeight: "normal"
        };
        pushState({ ...state, overlays: [...state.overlays, newObj] });
        setSelectedId(newObj.id);
    };

    const handleAddEmoji = (emoji: string) => {
        const newObj: OverlayObject = {
            id: Math.random().toString(36).substring(7),
            type: "emoji",
            content: emoji,
            x: 400,
            y: 400,
            fontSize: 150,
            color: "",
            rotation: 0
        };
        pushState({ ...state, overlays: [...state.overlays, newObj] });
        setSelectedId(newObj.id);
    };

    const handlePointerDown = (clientX: number, clientY: number) => {
        setIsDragging(true);

        const canvas = canvasRef.current;
        if (!canvas || !image) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = image.naturalWidth / rect.width;
        const scaleY = image.naturalHeight / rect.height;
        const x = (clientX - rect.left) * scaleX;
        const y = (clientY - rect.top) * scaleY;

        // Disable our custom drag handlers if in crop mode since react-easy-crop handles it
        if (mode === "crop") return;
    };

    const handleMouseDown = (e: React.MouseEvent) => handlePointerDown(e.clientX, e.clientY);

    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length > 0) handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
    };

    const handlePointerMove = (clientX: number, clientY: number) => {
        const canvas = canvasRef.current;
        if (!canvas || !image) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = image.naturalWidth / rect.width;
        const scaleY = image.naturalHeight / rect.height;
        const x = (clientX - rect.left) * scaleX;
        const y = (clientY - rect.top) * scaleY;

        if (!isDragging) {
            if (mode === "text" || mode === "markup") {
                const hit = [...state.overlays].reverse().find(obj => {
                    if (mode === "text" && obj.type !== "text") return false;
                    if (mode === "markup" && obj.type !== "emoji") return false;

                    if (obj.type === "text") {
                        const lines = obj.content.split('\n');
                        const lineHeight = obj.fontSize * 1.2;
                        const totalHeight = lines.length * lineHeight;
                        const roughWidth = Math.max(...lines.map(l => l.length)) * (obj.fontSize * 0.6);

                        const distX = Math.abs(obj.x - x);
                        const distY = Math.abs(obj.y - y);
                        return distX < (roughWidth / 2 + 20) && distY < (totalHeight / 2 + 20);
                    } else {
                        const distX = Math.abs(obj.x - x);
                        const distY = Math.abs(obj.y - y);
                        return distX < obj.fontSize && distY < obj.fontSize;
                    }
                });
                setHoveredId(hit?.id || null);
            }
            return;
        }

        if (!selectedId) return;

        if (mode === "markup" || mode === "text") {
            setState(prev => ({
                ...prev,
                overlays: prev.overlays.map(obj =>
                    obj.id === selectedId ? { ...obj, x, y } : obj
                )
            }));
        }

    };

    const handleMouseMove = (e: React.MouseEvent) => handlePointerMove(e.clientX, e.clientY);

    const handleTouchMove = (e: React.TouchEvent) => {
        if (isDragging && mode === "crop") {
            // Can't use preventDefault easily in React synthetic events for touchmove if passive,
            // but we rely on CSS touch-action: none on the container to prevent scrolling.
        }
        if (e.touches.length > 0) {
            handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
        }
    };

    const handleMouseUp = () => {

        if (isDragging && selectedId && (mode === "markup" || mode === "text")) {
            pushState(state);
        }
        setIsDragging(false);
        setDragOffset(null);
    };

    const handleDeleteSelected = () => {
        if (!selectedId) return;
        pushState({ ...state, overlays: state.overlays.filter(o => o.id !== selectedId) });
        setSelectedId(null);
    };

    const handleExport = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Cap export resolution to prevent memory crashes
        const MAX_DIMENSION = 1600;
        let finalWidth = canvas.width;
        let finalHeight = canvas.height;

        if (finalWidth > MAX_DIMENSION || finalHeight > MAX_DIMENSION) {
            const ratio = Math.min(MAX_DIMENSION / finalWidth, MAX_DIMENSION / finalHeight);
            finalWidth = Math.floor(finalWidth * ratio);
            finalHeight = Math.floor(finalHeight * ratio);

            const outCanvas = document.createElement("canvas");
            outCanvas.width = finalWidth;
            outCanvas.height = finalHeight;
            const outCtx = outCanvas.getContext("2d");
            if (!outCtx) return;
            outCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, finalWidth, finalHeight);

            const dataUrl = outCanvas.toDataURL("image/webp", 0.9);
            onSave(dataUrl);
        } else {
            const dataUrl = canvas.toDataURL("image/webp", 0.9);
            onSave(dataUrl);
        }
    };

    const handleAdjustmentChange = (key: keyof VisualAdjustments, val: number) => {
        setState(prev => ({
            ...prev,
            adjustments: { ...prev.adjustments, [key]: val }
        }));
    };

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col md:flex-row overflow-hidden text-white font-sans">
            {/* Left ToolBar (Vertical Desktop / Horizontal Mobile) */}
            <div className="w-full md:w-20 bg-zinc-900 border-b md:border-b-0 md:border-r border-zinc-800 flex flex-row md:flex-col items-center py-2 md:py-6 gap-2 md:gap-6 px-4 md:px-0">
                <button onClick={onClose} className="p-3 rounded-2xl hover:bg-zinc-800 transition-colors hidden md:block">
                    <X size={24} />
                </button>

                <div className="h-8 w-px bg-zinc-800 mx-2 md:hidden" />

                {[
                    { id: "crop", icon: <CropIcon size={24} />, label: "Crop" },
                    { id: "adjust", icon: <SlidersHorizontal size={24} />, label: "Adjust" },
                    { id: "text", icon: <Type size={24} />, label: "Text" },
                    { id: "markup", icon: <Palette size={24} />, label: "Markup" },
                    { id: "ai", icon: <Wand2 size={24} />, label: "Studio" }
                ].map(item => (
                    <button
                        key={item.id}
                        onClick={() => setMode(item.id as EditorMode)}
                        className={cn(
                            "flex-1 md:flex-none p-3 md:p-4 rounded-2xl transition-all flex flex-col items-center gap-1",
                            mode === item.id ? "bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-lg" : "hover:bg-zinc-800 text-zinc-400"
                        )}
                    >
                        {item.icon}
                        <span className="text-[10px] font-bold md:hidden">{item.label}</span>
                    </button>
                ))}

                <button onClick={onClose} className="p-3 rounded-2xl hover:bg-zinc-800 transition-colors md:hidden">
                    <X size={24} />
                </button>
            </div>

            {/* Main Canvas Area */}
            <div className="flex-1 relative flex flex-col bg-black">
                {/* Top Control Bar */}
                <div className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900/50 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <button onClick={undo} disabled={historyIndex <= 0} className="p-2 text-zinc-400 hover:text-white disabled:opacity-20 transition-colors">
                            <Undo2 size={20} />
                        </button>
                        <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-2 text-zinc-400 hover:text-white disabled:opacity-20 transition-colors">
                            <Redo2 size={20} />
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setMode("generate")}
                            className={cn(
                                "px-4 py-2 rounded-xl font-bold text-sm active:scale-95 transition-all flex items-center gap-2",
                                mode === "generate" ? "bg-[var(--color-primary)] text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                            )}
                        >
                            <Sparkles size={16} /> Generate Image
                        </button>

                        <button
                            onClick={() => setMode("import")}
                            className={cn(
                                "px-4 py-2 rounded-xl transition-all flex items-center gap-2 font-bold text-sm",
                                mode === "import" ? "bg-[var(--color-primary)] text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 active:scale-95"
                            )}
                            title="Download Image"
                        >
                            <Link2 size={16} /> Download Image
                        </button>

                        <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 rounded-xl bg-zinc-800 text-white font-bold text-sm hover:bg-zinc-700 active:scale-95 transition-all flex items-center gap-2">
                            <Upload size={16} /> {image ? "Replace Image" : "Upload Image"}
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

                        <button onClick={handleExport} className="px-6 py-2.5 rounded-full bg-white text-black font-bold text-sm hover:bg-zinc-200 active:scale-95 transition-all flex items-center gap-2">
                            <Check size={18} /> Save & Export
                        </button>
                    </div>
                </div>

                <div
                    ref={containerRef}
                    className="flex-1 relative overflow-auto flex items-center justify-center p-8 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black touch-none"
                    onMouseMove={handleMouseMove}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleMouseUp}
                    onTouchCancel={handleMouseUp}
                >
                    {image && !loadError && mode !== "crop" && (
                        <div className="relative group shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                            <canvas
                                ref={canvasRef}
                                width={image.naturalWidth}
                                height={image.naturalHeight}
                                onClick={handleCanvasClick}
                                className={cn(
                                    "max-w-full max-h-full bg-white rounded-lg selection:none",
                                    (mode === "markup" || mode === "text") ?
                                        (isDragging && selectedId ? "cursor-grabbing" : (hoveredId ? "cursor-grab" : "cursor-crosshair"))
                                        : "cursor-default"
                                )}
                                style={{
                                    width: "auto",
                                    height: "auto",
                                    maxHeight: "calc(100vh - 200px)"
                                }}
                            />
                        </div>
                    )}

                    {image && !loadError && mode === "crop" && (
                        <div className="relative w-full h-[calc(100vh-200px)] flex items-center justify-center bg-black/50">
                            <div className="absolute inset-4 overflow-hidden rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                                <Cropper
                                    image={image.src}
                                    crop={crop}
                                    zoom={zoom}
                                    rotation={rotation}
                                    aspect={aspect}
                                    onCropChange={setCrop}
                                    onCropComplete={handleCropComplete}
                                    onZoomChange={setZoom}
                                    onRotationChange={setRotation}
                                    showGrid={true}
                                    style={{
                                        containerStyle: { background: 'transparent' },
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {loadError && (
                        <div className="flex flex-col items-center gap-6 p-8 text-center max-w-sm">
                            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                                <X size={40} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Transfer Error</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed">{loadError}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="px-8 py-3 rounded-xl bg-zinc-800 text-white font-bold hover:bg-zinc-700 transition-all"
                            >
                                Go Back
                            </button>
                        </div>
                    )}

                    {!image && !loadError && (
                        <div className="flex flex-col items-center gap-4">
                            {activeUrl === "NEW_UPLOAD" ? (
                                <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center mb-2">
                                    <Upload size={32} className="opacity-40" />
                                </div>
                            ) : (
                                <RotateCw size={48} className="animate-spin text-zinc-700" />
                            )}
                            <p className="text-zinc-500 font-medium mb-2">
                                {activeUrl === "NEW_UPLOAD" ? "Please select an image to start..." : "Developing your studio..."}
                            </p>
                            {activeUrl === "NEW_UPLOAD" && (
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-6 py-3 rounded-2xl bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-all flex items-center gap-2 shadow-lg active:scale-95"
                                    >
                                        <Upload size={18} /> Upload Image
                                    </button>
                                    <button
                                        onClick={() => setMode("import")}
                                        className="px-6 py-3 rounded-2xl bg-zinc-800 text-white font-bold text-sm hover:bg-zinc-700 transition-all flex items-center gap-2 shadow-lg active:scale-95"
                                    >
                                        <Link2 size={18} /> Download Image
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Property Panel (Contextual) */}
            <div className="w-full md:w-80 bg-zinc-900 border-t md:border-t-0 md:border-l border-zinc-800 p-6 overflow-y-auto">
                {mode === "import" && (
                    <div className="space-y-6">
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Link2 size={20} className="text-[var(--color-primary)]" /> Smart Import
                            </h3>
                            <p className="text-xs text-zinc-400">Import images from any web page or direct link</p>
                        </div>

                        <div className="p-5 rounded-3xl bg-zinc-950/50 border border-zinc-800 space-y-4">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 block flex items-center gap-2">
                                        <Globe size={10} /> Image Web Link or Page URL
                                    </label>
                                    <div className="relative">
                                        <input
                                            autoFocus
                                            type="url"
                                            placeholder="Paste image link or website URL..."
                                            value={importUrl}
                                            onChange={(e) => setImportUrl(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleUrlImport()}
                                            className="w-full h-12 pl-10 pr-3 rounded-2xl bg-zinc-900 border border-zinc-800 focus:border-[var(--color-primary)] outline-none text-xs text-white placeholder:text-zinc-600 transition-all"
                                        />
                                        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                                    </div>
                                </div>

                                {isExtracting ? (
                                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                                        <div className="relative">
                                            <Loader2 size={32} className="animate-spin text-[var(--color-primary)]" />
                                            <div className="absolute inset-0 blur-lg bg-[var(--color-primary)]/20 animate-pulse" />
                                        </div>
                                        <div className="text-center space-y-1">
                                            <p className="text-[10px] text-white font-bold uppercase tracking-widest">Scoping out images</p>
                                            <p className="text-[9px] text-zinc-500">Wait while we analyze the page...</p>
                                        </div>
                                    </div>
                                ) : discoveredImages.length > 0 ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Discovered Images</h4>
                                            <span className="text-[10px] text-zinc-600 font-medium px-2 py-0.5 rounded-full bg-zinc-900">{discoveredImages.length} found</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-[350px] pr-1 custom-scrollbar">
                                            {discoveredImages.map((src, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => {
                                                        setLocalImageUrl(src);
                                                        setMode("crop");
                                                        setImportUrl("");
                                                        setDiscoveredImages([]);
                                                    }}
                                                    className="aspect-square rounded-2xl overflow-hidden bg-zinc-900 group relative border border-transparent hover:border-[var(--color-primary)] transition-all active:scale-95 shadow-lg"
                                                >
                                                    <img
                                                        src={src.startsWith('http') ? `/api/proxy-image?url=${encodeURIComponent(src)}` : src}
                                                        alt=""
                                                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                                    />
                                                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <div className="absolute top-2 right-2 p-1.5 rounded-full bg-[var(--color-primary)] text-white scale-0 group-hover:scale-100 transition-transform origin-center">
                                                        <Check size={12} strokeWidth={3} />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => {
                                                setDiscoveredImages([]);
                                                setImportUrl("");
                                            }}
                                            className="w-full py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest hover:text-white transition-colors border-t border-zinc-900 pt-4"
                                        >
                                            Try Another URL
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <button
                                            onClick={handleUrlImport}
                                            disabled={!importUrl || isExtracting}
                                            className="w-full h-12 rounded-2xl bg-[var(--color-primary)] text-white font-black text-xs hover:opacity-90 transition-all shadow-lg shadow-[var(--color-primary)]/20 active:scale-[0.98] disabled:opacity-30 disabled:hover:scale-100"
                                        >
                                            Fetch Images
                                        </button>
                                        <div className="pt-2">
                                            <p className="text-[10px] text-zinc-500 text-center uppercase tracking-widest font-bold mb-4 opacity-50">— or —</p>
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="w-full h-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-white font-bold text-xs hover:bg-zinc-850 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Upload size={14} /> Upload Local File
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-5 rounded-3xl bg-amber-500/5 border border-amber-500/10 space-y-2">
                            <h4 className="text-[10px] font-bold text-amber-500/80 uppercase tracking-widest">Pro Tip</h4>
                            <p className="text-[11px] text-amber-500/60 leading-relaxed italic">
                                You can paste direct links from Unsplash, Pexels, or any website. We handle the technical stuff to make them editable.
                            </p>
                        </div>
                    </div>
                )}
                {mode === "text" && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Type size={20} className="text-[var(--color-primary)]" /> Text Tools
                        </h3>

                        <div className="grid grid-cols-1 gap-3">
                            <button onClick={handleAddText} className="flex flex-col items-center gap-3 p-4 rounded-3xl bg-zinc-800 hover:bg-zinc-700 transition-all border border-zinc-700/50 group">
                                <div className="w-12 h-12 rounded-2xl bg-zinc-950 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Type size={24} />
                                </div>
                                <span className="text-xs font-bold">Add Text</span>
                            </button>
                        </div>

                        {selectedId && state.overlays.find(o => o.id === selectedId)?.type === "text" && (
                            <div className="pt-6 border-t border-zinc-800 space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-bold text-zinc-400">Text Settings</p>
                                    <button onClick={handleDeleteSelected} className="text-red-400 p-2 hover:bg-red-400/10 rounded-lg">
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Text Content</label>
                                        <textarea
                                            value={state.overlays.find(o => o.id === selectedId)?.content || ""}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setState(prev => ({
                                                    ...prev,
                                                    overlays: prev.overlays.map(o => o.id === selectedId ? { ...o, content: val } : o)
                                                }));
                                            }}
                                            className="w-full bg-zinc-800 rounded-xl p-3 text-sm text-white resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                            rows={2}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Font Family</label>
                                            <select
                                                value={state.overlays.find(o => o.id === selectedId)?.fontFamily || "Inter, sans-serif"}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setState(prev => ({
                                                        ...prev,
                                                        overlays: prev.overlays.map(o => o.id === selectedId ? { ...o, fontFamily: val } : o)
                                                    }));
                                                }}
                                                className="w-full bg-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] appearance-none"
                                            >
                                                <option value="Inter, sans-serif">Inter</option>
                                                <option value="Roboto, sans-serif">Roboto</option>
                                                <option value="serif">Serif</option>
                                                <option value="monospace">Monospace</option>
                                                <option value="cursive">Cursive</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Font Weight</label>
                                            <select
                                                value={state.overlays.find(o => o.id === selectedId)?.fontWeight || "bold"}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setState(prev => ({
                                                        ...prev,
                                                        overlays: prev.overlays.map(o => o.id === selectedId ? { ...o, fontWeight: val } : o)
                                                    }));
                                                }}
                                                className="w-full bg-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] appearance-none"
                                            >
                                                <option value="normal">Normal</option>
                                                <option value="500">Medium</option>
                                                <option value="bold">Bold</option>
                                                <option value="900">Black</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Text Color</label>
                                            <input
                                                type="color"
                                                value={state.overlays.find(o => o.id === selectedId)?.color || "#ffffff"}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setState(prev => ({
                                                        ...prev,
                                                        overlays: prev.overlays.map(o => o.id === selectedId ? { ...o, color: val } : o)
                                                    }));
                                                }}
                                                className="w-full h-10 rounded-xl bg-zinc-800 border-none cursor-pointer p-1"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Outline Color</label>
                                            <div className="flex gap-2 items-center">
                                                <input
                                                    type="color"
                                                    value={state.overlays.find(o => o.id === selectedId)?.outlineColor && state.overlays.find(o => o.id === selectedId)?.outlineColor !== "transparent" ? state.overlays.find(o => o.id === selectedId)?.outlineColor : "#000000"}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setState(prev => ({
                                                            ...prev,
                                                            overlays: prev.overlays.map(o => o.id === selectedId ? { ...o, outlineColor: val } : o)
                                                        }));
                                                    }}
                                                    className="flex-1 h-10 rounded-xl bg-zinc-800 border-none cursor-pointer p-1"
                                                />
                                                <button
                                                    onClick={() => {
                                                        setState(prev => ({
                                                            ...prev,
                                                            overlays: prev.overlays.map(o => o.id === selectedId ? { ...o, outlineColor: "transparent" } : o)
                                                        }));
                                                    }}
                                                    className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl"
                                                    title="Remove Outline"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Rotation</label>
                                        <input
                                            type="range" min="0" max="360"
                                            value={state.overlays.find(o => o.id === selectedId)?.rotation || 0}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                setState(prev => ({
                                                    ...prev,
                                                    overlays: prev.overlays.map(o => o.id === selectedId ? { ...o, rotation: val } : o)
                                                }));
                                            }}
                                            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Size</label>
                                        <input
                                            type="range" min="20" max="300"
                                            value={state.overlays.find(o => o.id === selectedId)?.fontSize || 40}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                setState(prev => ({
                                                    ...prev,
                                                    overlays: prev.overlays.map(o => o.id === selectedId ? { ...o, fontSize: val } : o)
                                                }));
                                            }}
                                            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {mode === "markup" && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Palette size={20} className="text-[var(--color-primary)]" /> Markup Tools
                        </h3>

                        <div className="grid grid-cols-1 gap-3">
                            <button onClick={() => setShowEmojiPicker(true)} className="flex flex-col items-center gap-3 p-4 rounded-3xl bg-zinc-800 hover:bg-zinc-700 transition-all border border-zinc-700/50 group">
                                <div className="w-12 h-12 rounded-2xl bg-zinc-950 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Smile size={24} />
                                </div>
                                <span className="text-xs font-bold">Add Emoji</span>
                            </button>
                        </div>

                        {showEmojiPicker && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={(e) => { e.stopPropagation(); setShowEmojiPicker(false); }}>
                                <div onClick={e => e.stopPropagation()} className="shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                                    <EmojiPicker
                                        theme={Theme.DARK}
                                        onEmojiClick={(emojiData) => {
                                            handleAddEmoji(emojiData.emoji);
                                            setShowEmojiPicker(false);
                                        }}
                                        width={320}
                                        height={450}
                                    />
                                </div>
                            </div>
                        )}

                        {selectedId && state.overlays.find(o => o.id === selectedId)?.type === "emoji" && (
                            <div className="pt-6 border-t border-zinc-800 space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-bold text-zinc-400">Emoji Settings</p>
                                    <button onClick={handleDeleteSelected} className="text-red-400 p-2 hover:bg-red-400/10 rounded-lg">
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Rotation</label>
                                        <input
                                            type="range" min="0" max="360"
                                            value={state.overlays.find(o => o.id === selectedId)?.rotation || 0}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                setState(prev => ({
                                                    ...prev,
                                                    overlays: prev.overlays.map(o => o.id === selectedId ? { ...o, rotation: val } : o)
                                                }));
                                            }}
                                            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Size</label>
                                        <input
                                            type="range" min="20" max="300"
                                            value={state.overlays.find(o => o.id === selectedId)?.fontSize || 40}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                setState(prev => ({
                                                    ...prev,
                                                    overlays: prev.overlays.map(o => o.id === selectedId ? { ...o, fontSize: val } : o)
                                                }));
                                            }}
                                            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {mode === "adjust" && (
                    <div className="space-y-8">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <SlidersHorizontal size={20} className="text-[var(--color-primary)]" /> Enhancements
                        </h3>

                        {[
                            { label: "Brightness", key: "brightness" as const, min: 0, max: 200 },
                            { label: "Contrast", key: "contrast" as const, min: 0, max: 200 },
                            { label: "Saturation", key: "saturation" as const, min: 0, max: 200 }
                        ].map(adj => (
                            <div key={adj.key} className="space-y-3">
                                <div className="flex justify-between items-center text-xs font-bold text-zinc-400">
                                    <span>{adj.label}</span>
                                    <span>{state.adjustments[adj.key]}%</span>
                                </div>
                                <input
                                    type="range" min={adj.min} max={adj.max}
                                    value={state.adjustments[adj.key]}
                                    onChange={(e) => handleAdjustmentChange(adj.key, parseInt(e.target.value))}
                                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
                                />
                            </div>
                        ))}

                        <button
                            onClick={() => pushState({ ...state, adjustments: { brightness: 100, contrast: 100, saturation: 100 } })}
                            className="w-full py-3 rounded-xl border border-zinc-800 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
                        >
                            Reset to Original
                        </button>
                    </div>
                )}

                {mode === "crop" && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <CropIcon size={20} className="text-[var(--color-primary)]" /> Crop Image
                        </h3>

                        {targetLayout === "free" ? (
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { label: "1:1" },
                                    { label: "4:3" },
                                    { label: "16:9" },
                                    { label: "Free" }
                                ].map(ratio => (
                                    <button
                                        key={ratio.label}
                                        onClick={() => {
                                            setActiveRatio(ratio.label);
                                        }}
                                        className={cn(
                                            "p-3 rounded-xl text-xs font-bold transition-all border",
                                            activeRatio === ratio.label ? "bg-white text-black border-white" : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500"
                                        )}
                                    >
                                        {ratio.label}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-center">
                                <p className="text-sm font-bold text-[var(--color-primary)]">Layout Locked</p>
                                <p className="text-xs text-zinc-400 mt-1 uppercase tracking-widest">{targetLayout} ratio</p>
                            </div>
                        )}

                        <div className="space-y-4 pt-4 border-t border-zinc-800">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-xs font-bold text-zinc-400">
                                    <span className="flex items-center gap-2"><ZoomIn size={14} /> Zoom</span>
                                    <span>{Math.round(zoom * 100)}%</span>
                                </div>
                                <input
                                    type="range" min={1} max={3} step={0.1}
                                    value={zoom}
                                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-xs font-bold text-zinc-400">
                                    <span className="flex items-center gap-2"><RotateCw size={14} /> Rotation</span>
                                    <span>{rotation}°</span>
                                </div>
                                <input
                                    type="range" min={0} max={360}
                                    value={rotation}
                                    onChange={(e) => setRotation(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[var(--color-primary)]"
                                />
                            </div>
                        </div>

                        {cropArea && (
                            <button
                                onClick={handleApplyCrop}
                                className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <Check size={20} /> Apply Crop
                            </button>
                        )}
                    </div>
                )}

                {mode === "ai" && (
                    <div className="space-y-6">
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Wand2 size={20} className="text-[var(--color-primary)]" /> Studio Magic
                            </h3>
                            <p className="text-xs text-zinc-400">BYOK AI Image Analysis & Copywriting</p>
                        </div>

                        {(!currentBusiness?.aiConfig?.openaiApiKey && !currentBusiness?.aiConfig?.googleApiKey) ? (
                            <button
                                onClick={() => router.push('/admin/settings?tab=ai')}
                                className="w-full p-8 rounded-[2.5rem] bg-zinc-900 border border-zinc-800 flex flex-col items-center gap-4 shadow-xl group hover:bg-zinc-800 transition-all active:scale-95"
                            >
                                <Settings size={40} className="text-zinc-500 group-hover:rotate-90 transition-transform duration-500" />
                                <div className="text-center">
                                    <p className="font-bold text-lg text-white">AI Setting Required</p>
                                    <p className="text-xs text-zinc-400 max-w-[200px] mx-auto">Configure your OpenAI or Gemini key in settings to unlock Studio Magic</p>
                                </div>
                            </button>
                        ) : aiError ? (
                            <div className="p-6 rounded-[2.5rem] bg-zinc-900 border border-red-500/20 flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                                <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
                                    <X size={24} />
                                </div>
                                <div className="text-center space-y-1">
                                    <p className="font-bold text-white">Analysis Failed</p>
                                    <p className="text-xs text-zinc-400 max-w-[200px] leading-relaxed">
                                        {aiError.includes("billing") || aiError.includes("limit") ? (
                                            <>
                                                Your AI account has reached its limit or has no balance.
                                                <a href="https://platform.openai.com/usage" target="_blank" rel="noopener noreferrer" className="block mt-1 text-indigo-400 hover:underline font-bold">Check OpenAI Billing ↗</a>
                                            </>
                                        ) : aiError}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2 w-full">
                                    <div className="flex gap-2 w-full">
                                        <button
                                            onClick={() => setAiError(null)}
                                            className="flex-1 h-10 rounded-xl bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-700 transition-colors"
                                        >
                                            Dismiss
                                        </button>
                                        <button
                                            onClick={handleAnalyzeImage}
                                            className="flex-1 h-10 rounded-xl bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <RotateCw size={12} /> Retry
                                        </button>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            const loader = document.createElement("div");
                                            await refreshBusinesses?.();
                                            handleAnalyzeImage();
                                        }}
                                        className="w-full h-8 rounded-lg border border-zinc-800 text-zinc-500 text-[9px] font-bold uppercase tracking-wider hover:bg-zinc-800 transition-colors"
                                    >
                                        Refresh Key Status
                                    </button>
                                </div>
                            </div>
                        ) : !analysisResult ? (
                            <button
                                onClick={handleAnalyzeImage}
                                disabled={!!isProcessingAI}
                                className="w-full p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex flex-col items-center gap-4 shadow-xl group hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:hover:scale-100"
                            >
                                {isProcessingAI === "analyze" ? (
                                    <Loader2 size={40} className="animate-spin text-white" />
                                ) : (
                                    <Sparkles size={40} className="text-white group-hover:rotate-12 transition-transform" />
                                )}
                                <div className="text-center text-white">
                                    <p className="font-bold text-lg">{isProcessingAI === "analyze" ? "Analyzing Image..." : "Analyze Image"}</p>
                                    <p className="text-xs opacity-80 max-w-[200px] mx-auto">Get intelligent titles, descriptions, and SEO tags using your BYOK key</p>
                                </div>
                            </button>
                        ) : (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="p-5 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                                                <AlignLeft size={12} /> Suggested Title
                                            </span>
                                            <button
                                                onClick={() => {
                                                    if (analysisResult) {
                                                        navigator.clipboard.writeText(analysisResult.title);
                                                        alert("Title copied!");
                                                    }
                                                }}
                                                className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400"
                                            >
                                                <Copy size={14} />
                                            </button>
                                        </div>
                                        <p className="text-sm font-bold text-white leading-tight">{analysisResult?.title}</p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                                                <AlignLeft size={12} /> Description
                                            </span>
                                            <button
                                                onClick={() => {
                                                    if (analysisResult) {
                                                        navigator.clipboard.writeText(analysisResult.description);
                                                        alert("Description copied!");
                                                    }
                                                }}
                                                className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400"
                                            >
                                                <Copy size={14} />
                                            </button>
                                        </div>
                                        <p className="text-xs text-zinc-300 leading-relaxed">{analysisResult?.description}</p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                                                <Tag size={12} /> SEO Tags
                                            </span>
                                            <button
                                                onClick={() => {
                                                    if (analysisResult) {
                                                        navigator.clipboard.writeText(analysisResult.tags.join(", "));
                                                        alert("Tags copied!");
                                                    }
                                                }}
                                                className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400"
                                            >
                                                <Copy size={14} />
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {analysisResult?.tags.map((tag, i) => (
                                                <span key={i} className="px-2.5 py-1 rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-400 border border-zinc-700">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setAnalysisResult(null)}
                                    className="w-full py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-bold text-xs transition-colors"
                                >
                                    Reset Analysis
                                </button>
                            </div>
                        )}

                        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                            <p className="text-[10px] text-amber-500/60 leading-relaxed italic">
                                <b>Note:</b> This feature uses the {currentBusiness?.aiConfig?.provider === 'google' ? 'Google Gemini' : 'OpenAI'} key configured in your settings.
                            </p>
                        </div>
                    </div>
                )}

                {mode === "generate" && (
                    <div className="space-y-6">
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Sparkles size={20} className="text-amber-400" /> AI Image Generator
                            </h3>
                            <p className="text-xs text-zinc-400">Describe the image you want to create</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Your Prompt</label>
                                <textarea
                                    value={generationPrompt}
                                    onChange={(e) => setGenerationPrompt(e.target.value)}
                                    placeholder="e.g. A realistic studio photo of a luxury watch on a marble pedestal, soft lighting..."
                                    className="w-full min-h-[120px] p-4 rounded-2xl bg-zinc-900 border border-zinc-800 focus:border-[var(--color-primary)] outline-none transition-all text-sm text-white resize-none"
                                />
                            </div>

                            {aiError ? (
                                <div className="p-6 rounded-2xl bg-zinc-900 border border-red-500/20 flex flex-col items-center gap-3 animate-in fade-in zoom-in duration-300">
                                    <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
                                        <X size={20} />
                                    </div>
                                    <div className="text-center space-y-1">
                                        <p className="font-bold text-xs text-white">Generation Failed</p>
                                        <p className="text-[10px] text-zinc-400 max-w-[180px] leading-relaxed">
                                            {aiError.includes("billing") || aiError.includes("limit") ? (
                                                <>
                                                    OpenAI billing limit reached.
                                                    <a href="https://platform.openai.com/usage" target="_blank" rel="noopener noreferrer" className="block mt-1 text-red-400 hover:underline font-bold">Top up balance ↗</a>
                                                </>
                                            ) : aiError}
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-2 w-full mt-2">
                                        <div className="flex gap-2 w-full">
                                            <button
                                                onClick={() => setAiError(null)}
                                                className="flex-1 h-9 rounded-lg bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-700 transition-colors"
                                            >
                                                Dismiss
                                            </button>
                                            <button
                                                onClick={handleGenerateImage}
                                                className="flex-1 h-9 rounded-lg bg-red-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <RotateCw size={10} /> Retry
                                            </button>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                await refreshBusinesses?.();
                                                handleGenerateImage();
                                            }}
                                            className="w-full h-7 rounded-lg border border-zinc-800 text-zinc-600 text-[8px] font-bold uppercase tracking-wider hover:bg-zinc-800 transition-colors"
                                        >
                                            Refresh Key Status
                                        </button>
                                    </div>
                                </div>
                            ) : !currentBusiness?.aiConfig?.openaiApiKey ? (
                                <button
                                    onClick={() => router.push('/admin/settings?tab=ai')}
                                    className="w-full h-auto p-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col items-center gap-3 shadow-lg hover:bg-zinc-800 active:scale-95 transition-all group"
                                >
                                    <Settings size={28} className="text-zinc-500 group-hover:rotate-90 transition-transform" />
                                    <div className="text-center">
                                        <p className="font-bold text-sm text-white">OpenAI Key Required</p>
                                        <p className="text-[10px] text-zinc-400 mt-1">Image generation specifically requires an OpenAI key. Please configure it in settings.</p>
                                    </div>
                                </button>
                            ) : (
                                <button
                                    onClick={handleGenerateImage}
                                    disabled={!generationPrompt || !!isProcessingAI}
                                    className="w-full h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 text-white font-black shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3"
                                >
                                    {isProcessingAI === "generate" ? (
                                        <Loader2 size={24} className="animate-spin" />
                                    ) : (
                                        <Sparkles size={24} />
                                    )}
                                    {isProcessingAI === "generate" ? "Generating..." : "Generate Image"}
                                </button>
                            )}
                        </div>

                        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                            <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Tips for better results</h4>
                            <ul className="text-[10px] text-zinc-400 space-y-2 leading-relaxed">
                                <li className="flex gap-2"><span>•</span> Be specific about lighting (e.g. &quot;soft morning light&quot;)</li>
                                <li className="flex gap-2"><span>•</span> Describe the material (e.g. &quot;matte ceramic texture&quot;)</li>
                                <li className="flex gap-2"><span>•</span> Mention the style (e.g. &quot;professional product photography&quot;)</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div >,
        document.body
    );
}
