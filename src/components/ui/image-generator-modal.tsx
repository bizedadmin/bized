"use client"

import { useState, useEffect, useRef } from "react"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Wand2,
    Loader2,
    Image as ImageIcon,
    Check,
    Download,
    Send,
    Sparkles,
    Clock,
    Settings2,
    ChevronDown,
    Plus,
    X,
    Eraser,
    History,
    ExternalLink,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignVerticalJustifyStart,
    AlignVerticalJustifyCenter,
    AlignVerticalJustifyEnd,
    Type,
    Palette
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { ColorPicker } from "@/components/ui/color-picker"

interface Message {
    id: string
    type: 'user' | 'assistant'
    text?: string
    images?: string[]
    timestamp: number
    params?: {
        style: string
        aspectRatio: string
        numImages: number
        overlay?: {
            title: string
            titleSize: string
            description: string
            descriptionSize: string
            align: string
            position: string
            bgColor: string
            textColor: string
        }
    }
}

interface ImageGeneratorModalProps {
    isOpen: boolean
    onClose: () => void
    onImageSelect: (imageUrl: string) => void
    title?: string
    description?: string
    serviceName?: string
    serviceDescription?: string
    initialImage?: string
}

const STYLE_PRESETS = [
    { value: "photorealistic", label: "Photo", icon: ImageIcon, color: "bg-blue-500" },
    { value: "anime", label: "Anime", icon: Sparkles, color: "bg-purple-500" },
    { value: "digital-art", label: "Digital", icon: Wand2, color: "bg-orange-500" },
    { value: "oil-painting", label: "Classic", icon: ChevronDown, color: "bg-yellow-600" },
    { value: "cinematic", label: "Movie", icon: Settings2, color: "bg-zinc-800" },
    { value: "minimalist", label: "Modern", icon: Check, color: "bg-emerald-500" },
]

const ASPECT_RATIOS = [
    { value: "1:1", label: "Square" },
    { value: "16:9", label: "Wide" },
    { value: "9:16", label: "Tall" },
]

export function ImageGeneratorModal({
    isOpen,
    onClose,
    onImageSelect,
    title = "AI Visual Assistant",
    serviceName = "",
    serviceDescription = "",
    initialImage: propsInitialImage
}: ImageGeneratorModalProps) {
    const [prompt, setPrompt] = useState("")
    const [currentInitialImage, setCurrentInitialImage] = useState<string | undefined>(propsInitialImage)
    const [lastSyncedContext, setLastSyncedContext] = useState("")
    const [negativePrompt, setNegativePrompt] = useState("")
    const [style, setStyle] = useState("photorealistic")
    const [aspectRatio, setAspectRatio] = useState("1:1")
    const [numImages, setNumImages] = useState(1)

    // Text Overlay Controls
    const [textTitle, setTextTitle] = useState("")
    const [textTitleSize, setTextTitleSize] = useState<"S" | "M" | "L">("L")
    const [textDescription, setTextDescription] = useState("")
    const [textDescriptionSize, setTextDescriptionSize] = useState<"S" | "M" | "L">("M")
    const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("center")
    const [textPosition, setTextPosition] = useState<"top" | "middle" | "bottom">("middle")
    const [bgColor, setBgColor] = useState("#ffffff")
    const [textColor, setTextColor] = useState("#000000")

    const [isGenerating, setIsGenerating] = useState(false)
    const [isRefining, setIsRefining] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [showClearConfirm, setShowClearConfirm] = useState(false)
    const [mounted, setMounted] = useState(false)

    const scrollRef = useRef<HTMLDivElement>(null)

    const [hasLoaded, setHasLoaded] = useState(false)

    // Helper to load history
    const loadHistory = () => {
        const savedMessages = localStorage.getItem("bized_ai_img_history")
        if (savedMessages) {
            try {
                const parsed = JSON.parse(savedMessages)
                setMessages(parsed)
            } catch (e) {
                console.error("Failed to parse history", e)
            }
        }
    }

    // Initial hydration
    useEffect(() => {
        setMounted(true)
        loadHistory()
        setHasLoaded(true)
    }, [])

    // Re-sync history whenever the modal is opened
    useEffect(() => {
        if (isOpen && mounted) {
            loadHistory()
        }
    }, [isOpen, mounted])

    // Sync history to localStorage only after initial load and when messages change
    useEffect(() => {
        if (mounted && hasLoaded) {
            localStorage.setItem("bized_ai_img_history", JSON.stringify(messages))
        }
    }, [messages, mounted, hasLoaded])

    // Update prompt if service context changes
    useEffect(() => {
        if (isOpen && (serviceName || serviceDescription)) {
            const context = `${serviceName} ${serviceDescription}`.trim()

            // Only sync if the context is actually different from what we last synced
            // AND the prompt is either empty or matches the last synced context
            if (context !== lastSyncedContext && (prompt === "" || prompt === lastSyncedContext)) {
                setPrompt(context)
                setLastSyncedContext(context)
            }
        }
    }, [isOpen, serviceName, serviceDescription, lastSyncedContext, prompt])

    // Scroll to bottom when messages change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isGenerating])

    const handleRefinePrompt = async () => {
        if (!prompt || isRefining) return

        setIsRefining(true)
        try {
            const response = await fetch('/api/refine-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.message)

            if (data.refinedPrompt) {
                setPrompt(data.refinedPrompt)
                toast.success("Prompt refined!")
            }
        } catch (error) {
            toast.error("Failed to refine prompt")
        } finally {
            setIsRefining(false)
        }
    }

    const handleGenerate = async () => {
        if (!prompt || isGenerating) return

        const userMsg: Message = {
            id: Math.random().toString(36).substring(7),
            type: 'user',
            text: prompt,
            timestamp: Date.now(),
            params: { style, aspectRatio, numImages }
        }

        setMessages(prev => [...prev, userMsg])
        setIsGenerating(true)

        try {
            const response = await fetch('/api/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    negativePrompt,
                    style,
                    aspectRatio,
                    numImages,
                    image: currentInitialImage,
                    overlay: textTitle || textDescription ? {
                        title: textTitle,
                        titleSize: textTitleSize,
                        description: textDescription,
                        descriptionSize: textDescriptionSize,
                        align: textAlign,
                        position: textPosition,
                        bgColor,
                        textColor
                    } : null
                }),
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.message)

            const images = Array.isArray(data.images) ? data.images : [data.images]

            const assistantMsg: Message = {
                id: Math.random().toString(36).substring(7),
                type: 'assistant',
                images,
                timestamp: Date.now()
            }

            setMessages(prev => [...prev, assistantMsg])
            toast.success("Visuals created successfully!")
        } catch (error) {
            console.error(error)
            toast.error("Generation failed")
        } finally {
            setIsGenerating(false)
        }
    }

    const handleClearHistory = () => {
        setMessages([])
        localStorage.removeItem("bized_ai_img_history")
        setShowClearConfirm(false)
        toast.success("History cleared")
    }

    const downloadImage = async (url: string) => {
        try {
            const response = await fetch(url)
            const blob = await response.blob()
            const blobUrl = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = blobUrl
            link.download = `bized-gen-${Date.now()}.webp`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            toast.success("Downloading image...")
        } catch (e) {
            toast.error("Failed to download")
        }
    }

    // Sync initial image from props
    useEffect(() => {
        if (propsInitialImage && isOpen) {
            setCurrentInitialImage(propsInitialImage)
            setPrompt(`Brand this image for ${serviceName || 'my business'}`)
            setShowAdvanced(true)
            setTextTitle(serviceName)
        }
    }, [propsInitialImage, isOpen, serviceName])

    if (!mounted) return null

    return (
        <>
            <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <SheetContent className="w-full sm:max-w-[500px] p-0 flex flex-col font-sans bg-zinc-50 border-l border-zinc-200 shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="p-4 bg-white border-b border-zinc-200 flex items-center justify-between z-10 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <SheetTitle className="text-sm font-bold flex items-center gap-2">
                                    AI Visual Assistant
                                    <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase font-bold tracking-tight">Pro</span>
                                </SheetTitle>
                                <p className="text-[10px] text-zinc-500 font-medium">Bized Intelligence • Active</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-400 hover:text-red-500 hover:bg-red-50"
                            onClick={() => setShowClearConfirm(true)}
                            title="Clear History"
                        >
                            <Eraser className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Chat Area */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth bg-zinc-50/50"
                    >
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 opacity-60">
                                <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center">
                                    <ImageIcon className="w-8 h-8 text-zinc-300" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-zinc-600">
                                        {serviceName ? `Visuals for ${serviceName}` : 'No History Yet'}
                                    </p>
                                    <p className="text-xs text-zinc-400 max-w-[200px]">
                                        {serviceName
                                            ? `I've prepared a concept based on your service details. Ready to generate?`
                                            : 'Describe what you need and I\'ll create visuals for you.'}
                                    </p>
                                </div>
                            </div>
                        )}

                        <AnimatePresence initial={false}>
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className={cn(
                                        "flex gap-3",
                                        msg.type === 'user' ? "flex-row-reverse" : "flex-row"
                                    )}
                                >
                                    <div className={cn(
                                        "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 shadow-sm",
                                        msg.type === 'user' ? "bg-zinc-800 text-white" : "bg-emerald-100 text-emerald-600"
                                    )}>
                                        {msg.type === 'user' ? <div className="text-[10px] font-bold">ME</div> : <Sparkles className="w-3.5 h-3.5" />}
                                    </div>
                                    <div className={cn(
                                        "max-w-[85%] space-y-2",
                                        msg.type === 'user' ? "items-end" : "items-start"
                                    )}>
                                        {msg.text && (
                                            <div className={cn(
                                                "p-3 rounded-2xl text-xs leading-relaxed shadow-sm border",
                                                msg.type === 'user'
                                                    ? "bg-zinc-800 text-white border-zinc-700 rounded-tr-none"
                                                    : "bg-white text-zinc-800 border-zinc-200 rounded-tl-none"
                                            )}>
                                                {msg.text}
                                                {msg.params && (
                                                    <div className="mt-2 flex flex-wrap gap-1.5 pt-2 border-t border-zinc-500/30 opacity-70">
                                                        <span className="text-[9px] px-1.5 py-0.5 rounded border border-white/20 uppercase tracking-tighter">{msg.params.style}</span>
                                                        <span className="text-[9px] px-1.5 py-0.5 rounded border border-white/20 uppercase tracking-tighter">{msg.params.aspectRatio}</span>
                                                        {msg.params.overlay && (
                                                            <span className="text-[9px] px-1.5 py-0.5 rounded border border-emerald-500/30 text-emerald-300 uppercase tracking-tighter flex items-center gap-1">
                                                                <Type className="w-2.5 h-2.5" /> Text Overlay
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {msg.images && (
                                            <div className="grid grid-cols-2 gap-2">
                                                {msg.images.map((img, idx) => (
                                                    <div key={idx} className="group relative rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 shadow-sm transition-all hover:shadow-md">
                                                        <img src={img} alt="Generated" className="w-full aspect-square object-cover" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                            <Button
                                                                size="icon"
                                                                variant="secondary"
                                                                className="h-8 w-8 rounded-lg"
                                                                onClick={() => onImageSelect(img)}
                                                                title="Apply Visual"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="secondary"
                                                                className="h-8 w-8 rounded-lg"
                                                                onClick={() => downloadImage(img)}
                                                                title="Download"
                                                            >
                                                                <Download className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className="text-[9px] text-zinc-400 font-medium px-1 flex items-center gap-1">
                                            <Clock className="w-2.5 h-2.5" />
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {isGenerating && (
                            <div className="flex gap-3">
                                <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0 animate-pulse">
                                    <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm w-full space-y-3">
                                    <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                        <span>AI Engine Processing</span>
                                        <span className="animate-pulse">Active</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-emerald-500"
                                            initial={{ width: "0%" }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: 15, repeat: Infinity }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-zinc-400 italic font-medium">Applying styles, optimizing pixels, and rendering your vision...</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Controls */}
                    <div className="p-4 bg-white border-t border-zinc-200 space-y-4 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] z-10 shrink-0">
                        {/* Style and Format Chips */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Preferred Aesthetic</Label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        "h-6 px-2 text-[9px] font-bold gap-1 rounded-full border transition-all",
                                        showAdvanced ? "bg-zinc-100 text-zinc-800 border-zinc-200" : "text-zinc-400 border-transparent"
                                    )}
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                >
                                    <Settings2 className="w-3 h-3" />
                                    ADVANCED
                                </Button>
                            </div>

                            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar shrink-0">
                                {STYLE_PRESETS.map((preset) => (
                                    <button
                                        key={preset.value}
                                        onClick={() => setStyle(preset.value)}
                                        className={cn(
                                            "flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all flex items-center gap-1.5",
                                            style === preset.value
                                                ? "bg-zinc-900 text-white border-zinc-900 shadow-lg shadow-zinc-200 scale-105"
                                                : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300"
                                        )}
                                    >
                                        <div className={cn("w-2 h-2 rounded-full", preset.color)} />
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <AnimatePresence>
                            {showAdvanced && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="space-y-4 overflow-hidden"
                                >
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label className="text-[9px] font-bold uppercase text-zinc-400 ml-1">Format</Label>
                                            <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-100 rounded-lg border border-zinc-200">
                                                {ASPECT_RATIOS.map(ratio => (
                                                    <button
                                                        key={ratio.value}
                                                        onClick={() => setAspectRatio(ratio.value)}
                                                        className={cn(
                                                            "py-1 text-[9px] font-bold rounded-md transition-all",
                                                            aspectRatio === ratio.value ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                                                        )}
                                                    >
                                                        {ratio.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[9px] font-bold uppercase text-zinc-400 ml-1">Variations</Label>
                                            <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-100 rounded-lg border border-zinc-200">
                                                {[1, 2, 4].map(num => (
                                                    <button
                                                        key={num}
                                                        onClick={() => setNumImages(num)}
                                                        className={cn(
                                                            "py-1 text-[9px] font-bold rounded-md transition-all select-none",
                                                            numImages === num ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                                                        )}
                                                    >
                                                        {num}x
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[9px] font-bold uppercase text-zinc-400 ml-1">Negative Prompt (Exclude)</Label>
                                        <div className="relative">
                                            <input
                                                value={negativePrompt}
                                                onChange={(e) => setNegativePrompt(e.target.value)}
                                                placeholder="e.g. text, watermark, blurry, extra fingers"
                                                className="w-full h-8 px-3 rounded-lg bg-zinc-50 border border-zinc-200 text-[10px] focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                            />
                                            {negativePrompt && (
                                                <button
                                                    onClick={() => setNegativePrompt("")}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Text Overlay Controls */}
                                    <div className="space-y-4 pt-4 border-t border-zinc-100">
                                        <div className="grid grid-cols-1 gap-3">
                                            <div className="space-y-1.5">
                                                <Label className="text-[9px] font-bold uppercase text-zinc-400 ml-1">Title</Label>
                                                <div className="flex gap-2">
                                                    <input
                                                        value={textTitle}
                                                        onChange={(e) => setTextTitle(e.target.value)}
                                                        placeholder="Add a title..."
                                                        className="flex-1 h-8 px-3 rounded-lg bg-zinc-50 border border-zinc-200 text-[10px] focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                    />
                                                    <Select value={textTitleSize} onValueChange={(val: any) => setTextTitleSize(val)}>
                                                        <SelectTrigger className="w-16 h-8 text-[10px] bg-zinc-50">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="S">S</SelectItem>
                                                            <SelectItem value="M">M</SelectItem>
                                                            <SelectItem value="L">L</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label className="text-[9px] font-bold uppercase text-zinc-400 ml-1">Description</Label>
                                                <div className="flex gap-2">
                                                    <input
                                                        value={textDescription}
                                                        onChange={(e) => setTextDescription(e.target.value)}
                                                        placeholder="Add a description..."
                                                        className="flex-1 h-8 px-3 rounded-lg bg-zinc-50 border border-zinc-200 text-[10px] focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                    />
                                                    <Select value={textDescriptionSize} onValueChange={(val: any) => setTextDescriptionSize(val)}>
                                                        <SelectTrigger className="w-16 h-8 text-[10px] bg-zinc-50">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="S">S</SelectItem>
                                                            <SelectItem value="M">M</SelectItem>
                                                            <SelectItem value="L">L</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-[9px] font-bold uppercase text-zinc-400 ml-1">Text Alignment</Label>
                                                <div className="flex p-0.5 bg-zinc-100 rounded-lg border border-zinc-200">
                                                    {[
                                                        { id: 'left', icon: AlignLeft },
                                                        { id: 'center', icon: AlignCenter },
                                                        { id: 'right', icon: AlignRight }
                                                    ].map(item => (
                                                        <button
                                                            key={item.id}
                                                            onClick={() => setTextAlign(item.id as any)}
                                                            className={cn(
                                                                "flex-1 py-1 flex items-center justify-center rounded-md transition-all",
                                                                textAlign === item.id ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                                                            )}
                                                        >
                                                            <item.icon className="w-3.5 h-3.5" />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[9px] font-bold uppercase text-zinc-400 ml-1">Text Position</Label>
                                                <div className="flex p-0.5 bg-zinc-100 rounded-lg border border-zinc-200">
                                                    {[
                                                        { id: 'top', icon: AlignVerticalJustifyStart },
                                                        { id: 'middle', icon: AlignVerticalJustifyCenter },
                                                        { id: 'bottom', icon: AlignVerticalJustifyEnd }
                                                    ].map(item => (
                                                        <button
                                                            key={item.id}
                                                            onClick={() => setTextPosition(item.id as any)}
                                                            className={cn(
                                                                "flex-1 py-1 flex items-center justify-center rounded-md transition-all",
                                                                textPosition === item.id ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                                                            )}
                                                        >
                                                            <item.icon className="w-3.5 h-3.5" />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-1">
                                            <div className="space-y-1.5">
                                                <Label className="text-[9px] font-bold uppercase text-zinc-400 ml-1">Background</Label>
                                                <ColorPicker
                                                    value={bgColor}
                                                    onChange={setBgColor}
                                                    className="w-full h-8 text-[10px] bg-zinc-50 px-2"
                                                    presets={[
                                                        { name: 'White', value: '#ffffff' },
                                                        { name: 'Black', value: '#000000' }
                                                    ]}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[9px] font-bold uppercase text-zinc-400 ml-1">Text Color</Label>
                                                <ColorPicker
                                                    value={textColor}
                                                    onChange={setTextColor}
                                                    className="w-full h-8 text-[10px] bg-zinc-50 px-2"
                                                    presets={[
                                                        { name: 'White', value: '#ffffff' },
                                                        { name: 'Black', value: '#000000' },
                                                        { name: 'Emerald', value: '#10b981' }
                                                    ]}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Main Input Area */}
                        <div className="space-y-3">
                            {currentInitialImage && (
                                <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-lg group ml-1">
                                    <img src={currentInitialImage} className="w-full h-full object-cover" alt="Context" />
                                    <button
                                        onClick={() => setCurrentInitialImage(undefined)}
                                        className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                    <div className="absolute bottom-0 inset-x-0 bg-emerald-500 text-[8px] text-white font-bold text-center py-0.5 uppercase tracking-tighter">
                                        Base Context
                                    </div>
                                </div>
                            )}
                            <div className="space-y-2">
                                <div className="relative group">
                                    <Textarea
                                        placeholder="A sleek, modern hair salon with emerald green chairs and soft hanging lights..."
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault()
                                                handleGenerate()
                                            }
                                        }}
                                        className="min-h-[100px] text-[11px] resize-none pr-12 pt-4 pb-4 bg-zinc-50 border-zinc-200 rounded-2xl focus-visible:ring-emerald-500 transition-all group-hover:bg-white"
                                    />
                                    <div className="absolute right-3 bottom-3 flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 rounded-xl border-zinc-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-all shadow-sm"
                                            onClick={handleRefinePrompt}
                                            disabled={!prompt || isRefining || isGenerating}
                                            title="Magic Refine"
                                        >
                                            {isRefining ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                                        </Button>
                                        <Button
                                            size="icon"
                                            className="h-8 w-8 rounded-xl bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-white transition-all shadow-lg shadow-zinc-200"
                                            onClick={handleGenerate}
                                            disabled={!prompt || isGenerating}
                                        >
                                            <Send className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between px-1">
                                    <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                                        AI can make mistakes, so review for accuracy.
                                        <a href="#" className="text-blue-600 hover:underline flex items-center gap-0.5 ml-1">
                                            Learn more <ExternalLink className="w-2.5 h-2.5" />
                                        </a>
                                    </div>
                                    <span className="text-[10px] text-zinc-400 font-medium tracking-tight">
                                        {prompt.length} / 500
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
                <DialogContent className="sm:max-w-[400px] border-zinc-200">
                    <DialogHeader>
                        <DialogTitle className="text-zinc-900">Clear History?</DialogTitle>
                        <DialogDescription className="text-zinc-500">
                            This will permanently delete all your generated images and prompts in this assistant. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="ghost"
                            onClick={() => setShowClearConfirm(false)}
                            className="text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleClearHistory}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Clear All
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
