"use client"

import { useState, useRef, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    RotateCw,
    RotateCcw,
    FlipHorizontal,
    FlipVertical,
    Sun,
    Contrast,
    Droplets,
    Wind,
    Check,
    X,
    Undo2,
    Layers,
    SlidersHorizontal,
    Maximize,
    Sparkles,
    Upload,
    Loader2,
    Crop as CropIcon,
    Scan
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

interface ImageEditorModalProps {
    isOpen: boolean
    onClose: () => void
    imageUrl?: string
    onSave: (newImageUrl: string) => void
    businessId?: string
}

const PRESETS = [
    { name: "Original", filter: "" },
    { name: "Vivid", filter: "saturate(1.5) contrast(1.1)" },
    { name: "Vintage", filter: "sepia(0.5) contrast(0.9) brightness(1.1)" },
    { name: "Dramatic", filter: "contrast(1.5) brightness(0.8) saturate(1.2)" },
    { name: "Mono", filter: "grayscale(1) contrast(1.2)" },
    { name: "Warm", filter: "sepia(0.3) saturate(1.3) hue-rotate(-10deg)" },
    { name: "Cool", filter: "hue-rotate(180deg) saturate(1.1) brightness(1.1) contrast(0.9)" },
]

export function ImageEditorModal({
    isOpen,
    onClose,
    imageUrl,
    onSave,
    businessId
}: ImageEditorModalProps) {
    const [activeTab, setActiveTab] = useState<"adjust" | "filters" | "transform" | "crop">("adjust")

    // Adjustment State
    const [brightness, setBrightness] = useState(100)
    const [contrast, setContrast] = useState(100)
    const [saturation, setSaturation] = useState(100)
    const [blur, setBlur] = useState(0)

    // Transform State
    const [rotation, setRotation] = useState(0)
    const [flipX, setFlipX] = useState(1)
    const [flipY, setFlipY] = useState(1)

    // Crop State
    const [crop, setCrop] = useState<Crop>()
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
    const imgRef = useRef<HTMLImageElement>(null)

    // Active Preset
    const [activePreset, setActivePreset] = useState("Original")

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [currentImage, setCurrentImage] = useState<string | undefined>(imageUrl)
    const [originalImage, setOriginalImage] = useState<string | undefined>(imageUrl)
    const [isSaving, setIsSaving] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Sync external image changes
    useEffect(() => {
        if (imageUrl) {
            setCurrentImage(imageUrl)
            setOriginalImage(imageUrl)
        }
    }, [imageUrl])

    const resetAdjustments = () => {
        setBrightness(100)
        setContrast(100)
        setSaturation(100)
        setBlur(0)
        setRotation(0)
        setFlipX(1)
        setFlipY(1)
        setCrop(undefined)
        setCompletedCrop(undefined)
        setActivePreset("Original")
        if (originalImage) setCurrentImage(originalImage)
    }

    const applyCrop = async () => {
        if (!completedCrop || !imgRef.current) return

        const img = imgRef.current
        const scaleX = img.naturalWidth / img.width
        const scaleY = img.naturalHeight / img.height

        const canvas = document.createElement('canvas')
        canvas.width = completedCrop.width * scaleX
        canvas.height = completedCrop.height * scaleY
        const ctx = canvas.getContext('2d')

        if (!ctx) return

        // Enforce high quality
        ctx.imageSmoothingQuality = 'high'

        ctx.drawImage(
            img,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            canvas.width,
            canvas.height
        )

        const croppedDataUrl = canvas.toDataURL('image/webp')
        setCurrentImage(croppedDataUrl)
        setCrop(undefined)
        setCompletedCrop(undefined)
        toast.success("Crop applied!")
    }

    const handleSave = async () => {
        if (!currentImage) return
        setIsSaving(true)

        try {
            const canvas = canvasRef.current
            if (!canvas) throw new Error("Canvas not found")

            const ctx = canvas.getContext('2d')
            if (!ctx) throw new Error("Context not found")

            // Create a promise to handle image loading
            const loadImage = () => new Promise<HTMLImageElement>((resolve, reject) => {
                const img = new Image()
                img.crossOrigin = "anonymous"
                img.onload = () => resolve(img)
                img.onerror = (e) => {
                    console.error("Image load failed for URL:", currentImage);
                    reject(new Error("Failed to load image for editing. This can happen if the original image doesn't allow cross-origin editing (CORS)."))
                }
                img.src = currentImage
            })

            const img = await loadImage()

            let sourceX = 0, sourceY = 0, sourceWidth = img.naturalWidth, sourceHeight = img.naturalHeight

            if (completedCrop && imgRef.current) {
                const scaleX = img.naturalWidth / imgRef.current.width
                const scaleY = img.naturalHeight / imgRef.current.height

                sourceX = completedCrop.x * scaleX
                sourceY = completedCrop.y * scaleY
                sourceWidth = completedCrop.width * scaleX
                sourceHeight = completedCrop.height * scaleY
            }

            // Setup canvas size based on rotation
            const isRotated = rotation % 180 !== 0

            canvas.width = isRotated ? sourceHeight : sourceWidth
            canvas.height = isRotated ? sourceWidth : sourceHeight

            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Apply Filters
            const filterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`
            const presetFilter = PRESETS.find(p => p.name === activePreset)?.filter || ""
            ctx.filter = `${filterString} ${presetFilter}`.trim()

            // Apply Transformations context
            ctx.translate(canvas.width / 2, canvas.height / 2)
            ctx.rotate((rotation * Math.PI) / 180)
            ctx.scale(flipX, flipY)

            // Draw Image
            const drawWidth = isRotated ? canvas.height : canvas.width
            const drawHeight = isRotated ? canvas.width : canvas.height

            ctx.drawImage(
                img,
                sourceX, sourceY, sourceWidth, sourceHeight,
                -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight
            )

            // Get data URL
            const dataUrl = canvas.toDataURL("image/webp", 0.9)
            onSave(dataUrl)
            toast.success("Edits applied!")

            onClose()
        } catch (error) {
            console.error("Save error:", error)
            toast.error(error instanceof Error ? error.message : "Failed to save edits")
        } finally {
            setIsSaving(false)
        }
    }

    const filterStyle = {
        filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px) ${PRESETS.find(p => p.name === activePreset)?.filter || ""}`,
        transform: `rotate(${rotation}deg) scaleX(${flipX}) scaleY(${flipY})`,
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
    }

    const isCropping = activeTab === "crop"

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        try {
            const reader = new FileReader()
            reader.onload = (event) => {
                const dataUrl = event.target?.result as string
                setCurrentImage(dataUrl)
                setOriginalImage(dataUrl)
                resetAdjustments()
                toast.success("Image loaded for editing!")
                setIsUploading(false)
            }
            reader.onerror = () => {
                toast.error("Failed to read file")
                setIsUploading(false)
            }
            reader.readAsDataURL(file)
        } catch (error) {
            toast.error("Error reading file")
            console.error(error)
            setIsUploading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden border-zinc-200 shadow-2xl">
                <DialogHeader className="p-4 border-b border-zinc-100 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-sm font-bold">Image Studio</DialogTitle>
                                <p className="text-[10px] text-zinc-500 font-medium">Professional Editing Suite</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-[10px] font-bold gap-1.5 text-zinc-500 hover:text-zinc-800"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="w-3.5 h-3.5" />
                                {currentImage ? 'REPLACE' : 'UPLOAD'}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-[10px] font-bold gap-1.5 text-zinc-500 hover:text-zinc-800"
                                onClick={resetAdjustments}
                            >
                                <Undo2 className="w-3.5 h-3.5" />
                                RESET
                            </Button>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleUpload}
                            className="hidden"
                            accept="image/*"
                        />
                    </div>
                </DialogHeader>

                <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
                    {/* Preview Area */}
                    <div className="flex-1 bg-zinc-50 flex items-center justify-center p-8 relative overflow-hidden min-h-[300px]">
                        <div className="relative shadow-2xl rounded-lg overflow-hidden bg-white max-w-full max-h-full flex items-center justify-center min-w-[200px] min-h-[200px]">
                            {currentImage ? (
                                isCropping ? (
                                    <ReactCrop
                                        crop={crop}
                                        onChange={(c) => setCrop(c)}
                                        onComplete={(c) => setCompletedCrop(c)}
                                        className="max-h-[50vh]"
                                    >
                                        <img
                                            ref={imgRef}
                                            src={currentImage}
                                            alt="Crop Preview"
                                            className="max-w-full max-h-[50vh] object-contain select-none"
                                            crossOrigin="anonymous"
                                        />
                                    </ReactCrop>
                                ) : (
                                    <img
                                        src={currentImage}
                                        alt="Editing Preview"
                                        className="max-w-full max-h-[50vh] object-contain select-none"
                                        style={filterStyle}
                                        crossOrigin="anonymous"
                                    />
                                )
                            ) : (
                                <div
                                    className="w-full h-64 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-zinc-50 transition-colors"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {isUploading ? (
                                        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                                    ) : (
                                        <>
                                            <div className="p-4 bg-blue-50 rounded-full">
                                                <Upload className="w-8 h-8 text-blue-600" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-bold text-zinc-800">No Image Selected</p>
                                                <p className="text-[10px] text-zinc-500 font-medium">Click to upload a photo to start editing</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                        <canvas ref={canvasRef} className="hidden" />

                        {/* Zoom/Resolution info */}
                        <div className="absolute bottom-4 left-4 px-2 py-1 bg-white/80 backdrop-blur-sm rounded border border-zinc-200 text-[10px] font-bold text-zinc-500 shadow-sm">
                            {isCropping ? 'CROP MODE' : 'HQ PREVIEW'}
                        </div>

                        {/* Crop Reset Hint */}
                        {isCropping && (
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/75 backdrop-blur-sm rounded-full text-[10px] font-medium text-white shadow-lg z-10">
                                Drag to crop. Transforms disabled while cropping.
                            </div>
                        )}
                    </div>

                    {/* Controls Sidebar */}
                    <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-zinc-100 flex flex-col bg-white overflow-y-auto">
                        <div className="flex border-b border-zinc-100 overflow-x-auto no-scrollbar">
                            {[
                                { id: "adjust", icon: SlidersHorizontal, label: "Adjust" },
                                { id: "crop", icon: CropIcon, label: "Crop" },
                                { id: "filters", icon: Layers, label: "Filters" },
                                { id: "transform", icon: Maximize, label: "Transform" },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={cn(
                                        "flex-1 min-w-[70px] py-3 text-[10px] font-bold flex flex-col items-center gap-1 transition-all border-b-2",
                                        activeTab === tab.id
                                            ? "border-blue-500 text-blue-600 bg-blue-50/30"
                                            : "border-transparent text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50"
                                    )}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label.toUpperCase()}
                                </button>
                            ))}
                        </div>

                        <div className="p-6 space-y-6">
                            <AnimatePresence mode="wait">
                                {activeTab === "adjust" && (
                                    <motion.div
                                        key="adjust"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="space-y-6"
                                    >
                                        <div className="space-y-4">
                                            {[
                                                { label: "Brightness", icon: Sun, value: brightness, min: 0, max: 200, onChange: setBrightness },
                                                { label: "Contrast", icon: Contrast, value: contrast, min: 0, max: 200, onChange: setContrast },
                                                { label: "Saturation", icon: Droplets, value: saturation, min: 0, max: 200, onChange: setSaturation },
                                                { label: "Blur", icon: Wind, value: blur, min: 0, max: 20, onChange: setBlur },
                                            ].map((ctrl) => (
                                                <div key={ctrl.label} className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                                                            <ctrl.icon className="w-3 h-3" />
                                                            {ctrl.label}
                                                        </Label>
                                                        <span className="text-[10px] font-mono text-zinc-800 bg-zinc-100 px-1.5 py-0.5 rounded">
                                                            {ctrl.value}{ctrl.label === 'Blur' ? 'px' : '%'}
                                                        </span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min={ctrl.min}
                                                        max={ctrl.max}
                                                        value={ctrl.value}
                                                        onChange={(e) => ctrl.onChange(parseInt(e.target.value))}
                                                        className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:bg-zinc-200 transition-colors"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === "crop" && (
                                    <motion.div
                                        key="crop"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="space-y-4"
                                    >
                                        <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 text-center space-y-2">
                                            <CropIcon className="w-6 h-6 text-zinc-300 mx-auto" />
                                            <p className="text-xs font-medium text-zinc-600">Freeform Crop</p>
                                            <p className="text-[10px] text-zinc-400">Drag handles on the image to crop.</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <Button
                                                variant="outline"
                                                className="h-10 text-[10px]"
                                                onClick={() => setCrop(undefined)}
                                            >
                                                Reset Crop
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="h-10 text-[10px]"
                                                onClick={() => setCrop({ unit: '%', width: 100, height: 100, x: 0, y: 0 })}
                                            >
                                                Select All
                                            </Button>
                                        </div>

                                        <Button
                                            className="w-full h-10 text-[10px] font-bold bg-zinc-900 text-white hover:bg-black"
                                            onClick={applyCrop}
                                            disabled={!completedCrop}
                                        >
                                            <Check className="w-3.5 h-3.5 mr-2" />
                                            DONE
                                        </Button>
                                    </motion.div>
                                )}

                                {activeTab === "filters" && (
                                    <motion.div
                                        key="filters"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="grid grid-cols-2 gap-3"
                                    >
                                        {PRESETS.map((p) => (
                                            <button
                                                key={p.name}
                                                onClick={() => setActivePreset(p.name)}
                                                className={cn(
                                                    "p-2 rounded-xl border text-[10px] font-bold text-left transition-all group",
                                                    activePreset === p.name
                                                        ? "bg-blue-50 border-blue-200 text-blue-700"
                                                        : "bg-white border-zinc-100 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50"
                                                )}
                                            >
                                                <div className="aspect-square rounded-lg bg-zinc-100 mb-2 overflow-hidden border border-zinc-200 relative">
                                                    {currentImage && (
                                                        <img
                                                            src={currentImage}
                                                            className="w-full h-full object-cover"
                                                            style={{ filter: p.filter }}
                                                            crossOrigin="anonymous"
                                                        />
                                                    )}
                                                    {activePreset === p.name && (
                                                        <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                                                            <Check className="w-5 h-5 text-white drop-shadow-md" />
                                                        </div>
                                                    )}
                                                </div>
                                                {p.name.toUpperCase()}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}

                                {activeTab === "transform" && (
                                    <motion.div
                                        key="transform"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="space-y-4"
                                    >
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button
                                                variant="outline"
                                                className="h-12 flex flex-col gap-1 border-zinc-200 hover:border-blue-200 hover:bg-blue-50/50"
                                                onClick={() => setRotation(r => (r - 90) % 360)}
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                                <span className="text-[9px] font-bold">ROTATE LEFT</span>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="h-12 flex flex-col gap-1 border-zinc-200 hover:border-blue-200 hover:bg-blue-50/50"
                                                onClick={() => setRotation(r => (r + 90) % 360)}
                                            >
                                                <RotateCw className="w-4 h-4" />
                                                <span className="text-[9px] font-bold">ROTATE RIGHT</span>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="h-12 flex flex-col gap-1 border-zinc-200 hover:border-blue-200 hover:bg-blue-50/50"
                                                onClick={() => setFlipX(f => f * -1)}
                                            >
                                                <FlipHorizontal className="w-4 h-4" />
                                                <span className="text-[9px] font-bold">FLIP X</span>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="h-12 flex flex-col gap-1 border-zinc-200 hover:border-blue-200 hover:bg-blue-50/50"
                                                onClick={() => setFlipY(f => f * -1)}
                                            >
                                                <FlipVertical className="w-4 h-4" />
                                                <span className="text-[9px] font-bold">FLIP Y</span>
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-4 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between sm:justify-between shrink-0">
                    <p className="text-[10px] text-zinc-400 font-medium hidden sm:block">Non-destructive preview • 1:1 Aspect Ratio</p>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="flex-1 sm:flex-none text-[10px] font-bold text-zinc-500"
                        >
                            DISCARD
                        </Button>
                        <Button
                            className="flex-1 sm:flex-none h-9 px-6 text-[10px] font-bold bg-zinc-900 text-white rounded-lg hover:bg-black transition-all shadow-lg shadow-zinc-200"
                            onClick={handleSave}
                            disabled={isSaving || !currentImage}
                        >
                            {isSaving ? <Sparkles className="w-3.5 h-3.5 animate-spin mr-2" /> : <Check className="w-3.5 h-3.5 mr-2" />}
                            SAVE EDITS
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
