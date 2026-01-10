"use client"

import { useSearchParams, useRouter, useParams } from "next/navigation"
import { useEffect, useState, Suspense, use } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ColorPicker } from "@/components/ui/color-picker"
import { Textarea } from "@/components/ui/textarea"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import {
    ArrowLeft,
    Save,
    Eye,
    Smartphone,
    Palette,
    Store,
    MousePointer2,
    Plus,
    Trash2,
    GripVertical,
    ChevronUp,
    ChevronDown,
    Layers,
    Loader2
} from "lucide-react"
import {
    TextalignJustifycenter,
    Link1,
    Layer,
    Edit2
} from "iconsax-reactjs"
import Link from "next/link"
import { BusinessStorefront } from "@/components/business/business-storefront"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"

const THEME_COLORS = [
    { name: "Black", value: "#1f2937" },
    { name: "Red", value: "#ef4444" },
    { name: "Orange", value: "#f97316" },
    { name: "Green", value: "#22c55e" },
    { name: "Teal", value: "#06b6d4" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Purple", value: "#a855f7" },
]

function PageBuilderContent({ pageType }: { pageType: string }) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const businessId = searchParams.get("businessId")
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [products, setProducts] = useState<any[]>([])

    // Form State
    const [formData, setFormData] = useState<any>({
        name: "",
        slug: "",
        phone: { code: "", number: "" },
        themeColor: "#1f2937",
        secondaryColor: "#f3f4f6",
        buttonColor: "#1f2937",
        businessCategories: [],
        showBookNow: true,
        showShopNow: true,
        showQuoteRequest: true,
    })

    useEffect(() => {
        if (businessId) {
            const fetchData = async () => {
                try {
                    // Fetch Business
                    const bRes = await fetch(`/api/businesses/${businessId}`, { cache: 'no-store' })
                    if (bRes.ok) {
                        const business = await bRes.json()
                        setFormData({
                            ...business,
                            themeColor: business.themeColor || "#1f2937",
                            secondaryColor: business.secondaryColor || "#f3f4f6",
                            buttonColor: business.buttonColor || business.themeColor || "#1f2937",
                            showBookNow: business.showBookNow !== false,
                            showShopNow: business.showShopNow !== false,
                            showQuoteRequest: business.showQuoteRequest !== false,
                        })

                        // Fetch Products
                        const pRes = await fetch(`/api/products?business=${businessId}`)
                        if (pRes.ok) {
                            const pData = await pRes.json()
                            setProducts(pData)
                        }
                    }
                } catch (err) {
                    console.error("Failed to load data:", err)
                } finally {
                    setLoading(false)
                }
            }
            fetchData()
        } else {
            setLoading(false)
        }
    }, [businessId])

    const [error, setError] = useState<string | null>(null)

    const handleSave = async () => {
        if (!businessId) return
        setSaving(true)
        setError(null)
        try {
            const res = await fetch(`/api/businesses/${businessId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                toast.success("Changes saved successfully!")
            } else {
                const errData = await res.json()
                console.error("Failed to save", errData)
                setError(JSON.stringify(errData))
                toast.error("Failed to save changes. Please try again.")
            }
        } catch (error) {
            console.error("Error saving:", error)
            setError(String(error))
        } finally {
            setSaving(false)
        }
    }

    const updateField = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }))
    }

    const updatePageSetting = (settingKey: string, value: any) => {
        setFormData((prev: any) => {
            const pages = [...(prev.pages || [])]
            const pageIndex = pages.findIndex((p: any) => p.type === pageType)
            if (pageIndex > -1) {
                pages[pageIndex] = {
                    ...pages[pageIndex],
                    settings: {
                        ...(pages[pageIndex].settings || {}),
                        [settingKey]: value
                    }
                }
            } else {
                // Initialize page if it doesn't exist yet for this type
                pages.push({
                    type: pageType,
                    settings: {
                        [settingKey]: value
                    }
                })
            }
            return { ...prev, pages }
        })
    }

    const currentPageSettings = formData.pages?.find((p: any) => p.type === pageType)?.settings || {}
    const blocks = currentPageSettings.blocks || []

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return

        const items = Array.from(blocks)
        const [reorderedItem] = items.splice(result.source.index, 1)
        items.splice(result.destination.index, 0, reorderedItem)

        updatePageSetting('blocks', items)
    }

    const addBlock = (type: string) => {
        const newBlock = {
            id: Math.random().toString(36).substring(7),
            type,
            title: type === 'text' ? 'New Heading' : '',
            content: type === 'text' ? 'Add your content here...' : '',
            label: type !== 'text' ? 'Click Me' : '',
            url: type === 'url' ? 'https://' : '',
            pageType: type === 'page_link' ? 'shop' : ''
        }
        updatePageSetting('blocks', [...blocks, newBlock])
        toast.success(`${type} block added!`)
    }

    const removeBlock = (id: string) => {
        updatePageSetting('blocks', blocks.filter((b: any) => b.id !== id))
        toast.info("Block removed")
    }

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        const newBlocks = [...blocks]
        const targetIndex = direction === 'up' ? index - 1 : index + 1
        if (targetIndex < 0 || targetIndex >= newBlocks.length) return

        const temp = newBlocks[index]
        newBlocks[index] = newBlocks[targetIndex]
        newBlocks[targetIndex] = temp
        updatePageSetting('blocks', newBlocks)
    }

    const updateBlock = (id: string, updates: any) => {
        updatePageSetting('blocks', blocks.map((b: any) =>
            b.id === id ? { ...b, ...updates } : b
        ))
    }

    const [isBlocksModalOpen, setIsBlocksModalOpen] = useState(false)
    const [editingBlockId, setEditingBlockId] = useState<string | null>(null)
    const editingBlock = blocks.find((b: any) => b.id === editingBlockId)

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-2rem)] items-center justify-center bg-gray-50 rounded-2xl border border-zinc-200 shadow-sm">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
            </div>
        )
    }

    return (
        <div className="flex h-[calc(100vh-2rem)] overflow-hidden bg-gray-50 rounded-2xl border border-zinc-200 shadow-sm">
            {/* Left Panel - Editor */}
            <div className="w-full md:w-[60%] lg:w-[500px] xl:w-[600px] flex flex-col border-r bg-white shadow-sm z-10">
                {/* Header */}
                <header className="h-16 border-b flex items-center justify-between px-6 bg-white shrink-0">
                    <div className="flex items-center gap-4">
                        <Link href="/business/design">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="font-semibold text-lg">{formData.name}</h1>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                                {pageType} Builder
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsBlocksModalOpen(true)}
                            className="bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                        >
                            <Layers className="w-4 h-4 mr-2 text-orange-500" />
                            Blocks
                        </Button>
                        <Button onClick={handleSave} disabled={saving} size="sm">
                            {saving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save</>}
                        </Button>
                    </div>
                </header>



                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <Accordion type="single" collapsible defaultValue="design" className="w-full space-y-4">




                        {/* 3. Page Layout & Blocks */}

                        {/* 3. Page Layout & Blocks */}
                        <AccordionItem value="content" className="border rounded-lg px-4 bg-white shadow-sm">
                            <AccordionTrigger className="hover:no-underline py-4">
                                <div className="flex items-center gap-3 text-left">
                                    <div className="p-2 bg-orange-50 text-orange-600 rounded-md">
                                        <Layers className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-semibold">Blocks & Content</div>
                                        <div className="text-xs text-gray-500 font-normal">Add and arrange page content</div>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-6 pt-2 pb-4">
                                <div className="space-y-4">
                                    <Button
                                        className="w-full h-12 rounded-xl border-dashed border-2 hover:bg-zinc-50 transition-colors"
                                        variant="outline"
                                        onClick={() => setIsBlocksModalOpen(true)}
                                    >
                                        <Plus className="w-4 h-4 mr-2 text-orange-500" /> Add New Block
                                    </Button>

                                    {/* Inline Blocks List */}
                                    <DragDropContext onDragEnd={onDragEnd}>
                                        <Droppable droppableId="blocks-list">
                                            {(provided) => (
                                                <div
                                                    {...provided.droppableProps}
                                                    ref={provided.innerRef}
                                                    className="space-y-2"
                                                >
                                                    {blocks.map((block: any, index: number) => (
                                                        <Draggable key={block.id} draggableId={block.id} index={index}>
                                                            {(provided, snapshot) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    className={`flex items-center gap-2 p-3 bg-zinc-50 rounded-2xl border border-zinc-100 group transition-all hover:bg-white hover:shadow-sm ${snapshot.isDragging ? 'shadow-lg bg-white ring-2 ring-orange-500/20 rotate-1' : ''}`}
                                                                    style={{
                                                                        ...provided.draggableProps.style,
                                                                    }}
                                                                >
                                                                    <div
                                                                        {...provided.dragHandleProps}
                                                                        className="cursor-grab text-zinc-300 hover:text-zinc-500 active:cursor-grabbing p-1"
                                                                    >
                                                                        <GripVertical className="w-4 h-4" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="p-1.5 bg-white rounded-lg shadow-sm">
                                                                                {block.type === 'text' && <TextalignJustifycenter size={12} color="#f97316" />}
                                                                                {block.type === 'url' && <Link1 size={12} color="#3b82f6" />}
                                                                                {block.type === 'page_link' && <Layer size={12} color="#a855f7" />}
                                                                            </div>
                                                                            <span className="text-sm font-bold truncate">
                                                                                {block.type === 'text' ? (block.title || 'Text Block') : (block.label || `${block.type} Block`)}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setEditingBlockId(block.id)}>
                                                                            <Edit2 className="w-3.5 h-3.5" />
                                                                        </Button>
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => removeBlock(block.id)}>
                                                                            <Trash2 className="w-3.5 h-3.5" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>
                                    </DragDropContext>
                                </div>

                                <div className="pt-4 border-t border-zinc-100">
                                    <Label className="text-gray-400 text-[10px] uppercase font-bold tracking-widest pl-1">Page SEO Settings</Label>
                                    <div className="mt-3 space-y-3">
                                        <Input
                                            placeholder="Page Title (SEO)"
                                            value={currentPageSettings.headline || ""}
                                            onChange={(e) => updatePageSetting('headline', e.target.value)}
                                            className="h-11 rounded-xl"
                                        />
                                        <Textarea
                                            placeholder="Meta Description..."
                                            value={currentPageSettings.description || ""}
                                            onChange={(e) => updatePageSetting('description', e.target.value)}
                                            className="min-h-[80px] rounded-xl"
                                        />
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                    </Accordion>
                </div>
            </div>

            {/* Right Panel - Preview */}
            <div className="hidden md:flex flex-1 bg-gray-100 items-center justify-center p-8 overflow-hidden relative">
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>

                <div className="relative">
                    <div className="absolute -top-12 left-0 right-0 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow-sm text-[10px] font-bold uppercase tracking-widest text-gray-500">
                            <Smartphone className="w-3 h-3" /> Live Preview
                        </div>
                    </div>

                    {/* Device Frame - Compact Preview */}
                    <div className="w-[320px] h-[680px] bg-white rounded-[45px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border-[10px] border-[#151515] overflow-hidden relative group box-content flex-shrink-0">
                        {/* Dynamic Island / Notch */}
                        <div className="absolute top-[15px] left-1/2 -translate-x-1/2 w-[90px] h-[28px] bg-[#151515] rounded-[14px] z-[101] pointer-events-none transition-all duration-300"></div>

                        <div className="h-full w-full overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-transparent hover:scrollbar-thumb-zinc-400">
                            <BusinessStorefront
                                business={formData}
                                products={products}
                                pageType={pageType as any}
                            />
                        </div>
                    </div>
                </div>
            </div>


            {/* Blocks Management Modal */}
            <Dialog open={isBlocksModalOpen} onOpenChange={setIsBlocksModalOpen}>
                <DialogContent className="max-w-md p-0 overflow-hidden rounded-3xl border border-zinc-100 shadow-2xl">
                    <DialogHeader className="px-6 pt-6 pb-4 border-b border-zinc-100 bg-gradient-to-b from-zinc-50 to-white">
                        <DialogTitle className="text-xl font-bold text-zinc-900">Add Content Block</DialogTitle>
                        <p className="text-sm text-zinc-500 mt-1">Choose a block type to add to your page</p>
                    </DialogHeader>

                    <div className="p-6 space-y-3 bg-white">
                        <button
                            className="w-full p-4 rounded-2xl border-2 border-zinc-100 hover:border-orange-400 hover:bg-orange-50/50 transition-all duration-200 text-left group flex items-center gap-4"
                            onClick={() => { addBlock('text'); setIsBlocksModalOpen(false); }}
                        >
                            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
                                <TextalignJustifycenter size={28} color="#ffffff" />
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-base text-zinc-900 mb-0.5">Text Block</div>
                                <div className="text-sm text-zinc-500">Add headings and paragraphs</div>
                            </div>
                            <ArrowLeft className="w-5 h-5 text-zinc-300 group-hover:text-orange-500 rotate-180 transition-colors" />
                        </button>

                        <button
                            className="w-full p-4 rounded-2xl border-2 border-zinc-100 hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 text-left group flex items-center gap-4"
                            onClick={() => { addBlock('url'); setIsBlocksModalOpen(false); }}
                        >
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
                                <Link1 size={28} color="#ffffff" />
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-base text-zinc-900 mb-0.5">External Link</div>
                                <div className="text-sm text-zinc-500">Link to any external website</div>
                            </div>
                            <ArrowLeft className="w-5 h-5 text-zinc-300 group-hover:text-blue-500 rotate-180 transition-colors" />
                        </button>

                        <button
                            className="w-full p-4 rounded-2xl border-2 border-zinc-100 hover:border-purple-400 hover:bg-purple-50/50 transition-all duration-200 text-left group flex items-center gap-4"
                            onClick={() => { addBlock('page_link'); setIsBlocksModalOpen(false); }}
                        >
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
                                <Layer size={28} color="#ffffff" />
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-base text-zinc-900 mb-0.5">Internal Page</div>
                                <div className="text-sm text-zinc-500">Link to shop, bookings, or quote</div>
                            </div>
                            <ArrowLeft className="w-5 h-5 text-zinc-300 group-hover:text-purple-500 rotate-180 transition-colors" />
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Block Edit Modal */}
            <Dialog open={!!editingBlockId} onOpenChange={(open) => !open && setEditingBlockId(null)}>
                {editingBlock && (
                    <DialogContent className="max-w-md p-0 overflow-hidden rounded-[32px] border-none shadow-2xl flex flex-col">
                        <DialogHeader className="px-8 py-6 border-b bg-zinc-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-xl shadow-sm">
                                    {editingBlock.type === 'text' && <TextalignJustifycenter size={20} color="#f97316" />}
                                    {editingBlock.type === 'url' && <Link1 size={20} color="#3b82f6" />}
                                    {editingBlock.type === 'page_link' && <Layer size={20} color="#a855f7" />}
                                </div>
                                <div>
                                    <DialogTitle className="text-sm font-black uppercase tracking-widest text-zinc-500">Edit Block</DialogTitle>
                                    <div className="text-xs font-medium text-zinc-400 truncate">{editingBlock.id}</div>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="p-8 space-y-6">
                            {editingBlock.type === 'text' && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Heading</Label>
                                        <Input
                                            placeholder="Optional Title"
                                            value={editingBlock.title}
                                            onChange={(e) => updateBlock(editingBlock.id, { title: e.target.value })}
                                            className="h-12 rounded-2xl bg-zinc-50 border-none shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Content</Label>
                                        <Textarea
                                            placeholder="Type your message..."
                                            value={editingBlock.content}
                                            onChange={(e) => updateBlock(editingBlock.id, { content: e.target.value })}
                                            className="min-h-[150px] rounded-2xl bg-zinc-50 border-none shadow-inner resize-none"
                                        />
                                    </div>
                                </div>
                            )}

                            {editingBlock.type === 'url' && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Button Label</Label>
                                        <Input
                                            value={editingBlock.label}
                                            onChange={(e) => updateBlock(editingBlock.id, { label: e.target.value })}
                                            className="h-12 rounded-2xl bg-zinc-50 border-none shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Subtitle (Optional)</Label>
                                        <Input
                                            placeholder="e.g. Visit our social media"
                                            value={editingBlock.subtitle || ""}
                                            onChange={(e) => updateBlock(editingBlock.id, { subtitle: e.target.value })}
                                            className="h-12 rounded-2xl bg-zinc-50 border-none shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Target URL</Label>
                                        <Input
                                            value={editingBlock.url}
                                            onChange={(e) => updateBlock(editingBlock.id, { url: e.target.value })}
                                            className="h-12 rounded-2xl bg-zinc-50 border-none shadow-inner"
                                        />
                                    </div>
                                </div>
                            )}

                            {editingBlock.type === 'page_link' && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Button Label</Label>
                                        <Input
                                            value={editingBlock.label}
                                            onChange={(e) => updateBlock(editingBlock.id, { label: e.target.value })}
                                            className="h-12 rounded-2xl bg-zinc-50 border-none shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Subtitle (Optional)</Label>
                                        <Input
                                            placeholder="e.g. Browse the full catalog"
                                            value={editingBlock.subtitle || ""}
                                            onChange={(e) => updateBlock(editingBlock.id, { subtitle: e.target.value })}
                                            className="h-12 rounded-2xl bg-zinc-50 border-none shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-zinc-400">Link To Page</Label>
                                        <select
                                            value={editingBlock.pageType}
                                            onChange={(e) => updateBlock(editingBlock.id, { pageType: e.target.value })}
                                            className="w-full h-12 px-4 rounded-2xl bg-zinc-50 border-none shadow-inner text-sm font-bold"
                                        >
                                            <option value="storefront">Storefront</option>
                                            <option value="shop">Shop</option>
                                            <option value="bookings">Bookings</option>
                                            <option value="quote">Quote</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>

                        <DialogFooter className="p-6 border-t bg-zinc-50/50">
                            <Button className="w-full h-14 rounded-2xl font-black text-lg bg-zinc-900 shadow-xl shadow-zinc-900/20" onClick={() => setEditingBlockId(null)}>
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                )}
            </Dialog>
        </div>
    )

}

export default function PageBuilderPage({ params }: { params: Promise<{ pageType: string }> }) {
    const { pageType } = use(params)
    return (
        <Suspense fallback={
            <div className="flex h-[calc(100vh-2rem)] items-center justify-center bg-gray-50 rounded-2xl border border-zinc-200 shadow-sm">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
            </div>
        }>
            <PageBuilderContent pageType={pageType} />
        </Suspense>
    )

}
