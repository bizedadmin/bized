/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useSearchParams, useRouter, useParams } from "next/navigation"
import { useEffect, useState, Suspense, use } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ColorPicker } from "@/components/ui/color-picker"
import { Textarea } from "@/components/ui/textarea"
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
    Check,
    GripVertical,
    ChevronUp,
    ChevronDown,
    Layers,
    Loader2,
    Building2,
    Clock,
    Phone,
    MapPin,
    CheckCircle2,
    Info,
    Share2,
    Facebook,
    Instagram,
    Twitter,
    Linkedin,
    Youtube,
    Github,
    Globe,
    Mail,
    Wifi,
    Car,
    Coffee,
    Utensils,
    Accessibility,
    Baby,
    Dog,
    Zap,
    MessageSquare,
    LocateFixed
} from "lucide-react"
import {
    TextalignJustifycenter,
    Link1,
    Layer,
    Edit2
} from "iconsax-reactjs"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"
import { BusinessStorefront } from "@/components/business/business-storefront"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
    const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')

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
            // Ensure pages have slugs/titles matching their type if missing
            const updatedFormData = {
                ...formData,
                pages: formData.pages?.map((p: any) => ({
                    ...p,
                    slug: p.slug || p.type,
                    title: p.title || (p.type.charAt(0).toUpperCase() + p.type.slice(1)),
                    enabled: p.enabled !== false
                })) || []
            }

            const res = await fetch(`/api/businesses/${businessId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedFormData)
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
                    slug: pageType,
                    title: pageType.charAt(0).toUpperCase() + pageType.slice(1),
                    enabled: true,
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
        let newBlock: any = {
            id: Math.random().toString(36).substring(7),
            type,
        }

        switch (type) {
            case 'text':
                newBlock = { ...newBlock, title: 'New Heading', content: 'Add your content here...' }
                break
            case 'url':
                newBlock = { ...newBlock, label: 'Click Me', url: 'https://', subtitle: '' }
                break
            case 'page_link':
                newBlock = { ...newBlock, label: 'Go to Page', pageType: 'shop', subtitle: '' }
                break
            case 'opening_hours':
                newBlock = {
                    ...newBlock,
                    timeFormat: '24h',
                    isOpen247: false,
                    days: formData.businessHours?.length > 0 ? formData.businessHours : [
                        { day: 'Monday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
                        { day: 'Tuesday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
                        { day: 'Wednesday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
                        { day: 'Thursday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
                        { day: 'Friday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
                        { day: 'Saturday', isOpen: false, openTime: '09:00', closeTime: '17:00' },
                        { day: 'Sunday', isOpen: false, openTime: '09:00', closeTime: '17:00' },
                    ]
                }
                break
            case 'contact_info':
                newBlock = {
                    ...newBlock,
                    fullName: formData.name || '',
                    phone: formData.phone ? `${formData.phone.code}${formData.phone.number}` : '',
                    altPhone: '',
                    website: formData.url || '',
                    email: formData.email || ''
                }
                break
            case 'location':
                newBlock = {
                    ...newBlock,
                    locationType: 'manual',
                    street: formData.address?.streetAddress || '',
                    postalCode: formData.address?.postalCode || '',
                    city: formData.address?.addressLocality || '',
                    state: formData.address?.addressRegion || '',
                    country: formData.address?.addressCountry || '',
                    url: ''
                }
                break
            case 'facilities':
                newBlock = {
                    ...newBlock,
                    selectedFacilities: formData.selectedFacilities || []
                }
                break
            case 'about':
                newBlock = { ...newBlock, summary: formData.description || '' }
                break
            case 'social_networks':
                newBlock = {
                    ...newBlock,
                    platforms: formData.sameAs?.map((url: string) => {
                        const name = url.includes('facebook') ? 'facebook' :
                            url.includes('instagram') ? 'instagram' :
                                url.includes('twitter') ? 'twitter' :
                                    url.includes('linkedin') ? 'linkedin' :
                                        url.includes('youtube') ? 'youtube' :
                                            url.includes('github') ? 'github' :
                                                url.includes('whatsapp') ? 'whatsapp' : 'website'
                        return { name, url }
                    }) || []
                }
                break
        }

        updatePageSetting('blocks', [...blocks, newBlock])
        toast.success(`${type.split('_').join(' ')} block added!`)
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
        const targetBlock = blocks.find((b: any) => b.id === id)
        if (!targetBlock) return

        // Update the block in settings
        updatePageSetting('blocks', blocks.map((b: any) =>
            b.id === id ? { ...b, ...updates } : b
        ))

        // Synchronize with top-level business fields
        setFormData((prev: any) => {
            const newFormData = { ...prev }

            if (targetBlock.type === 'opening_hours' && 'days' in updates) {
                newFormData.businessHours = updates.days
            }
            if (targetBlock.type === 'contact_info') {
                if ('phone' in updates) {
                    // Primitive attempt to split code and number if possible, or just save as number
                    newFormData.phone = { ...newFormData.phone, number: updates.phone }
                }
                if ('email' in updates) newFormData.email = updates.email
                if ('website' in updates) newFormData.url = updates.website
            }
            if (targetBlock.type === 'location' && updates.locationType === 'manual') {
                newFormData.address = {
                    ...newFormData.address,
                    streetAddress: updates.street || newFormData.address?.streetAddress,
                    addressLocality: updates.city || newFormData.address?.addressLocality,
                    addressRegion: updates.state || newFormData.address?.addressRegion,
                    postalCode: updates.postalCode || newFormData.address?.postalCode,
                    addressCountry: updates.country || newFormData.address?.addressCountry,
                }
            }
            if (targetBlock.type === 'about' && 'summary' in updates) {
                newFormData.description = updates.summary
            }
            if (targetBlock.type === 'facilities' && 'selectedFacilities' in updates) {
                newFormData.selectedFacilities = updates.selectedFacilities
            }
            if (targetBlock.type === 'social_networks' && 'platforms' in updates) {
                newFormData.sameAs = updates.platforms.map((p: any) => p.url).filter(Boolean)
            }

            return newFormData
        })
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
        <div className="flex flex-col md:flex-row h-screen bg-white overflow-hidden">
            {/* Sidebar - Builder Controls */}
            <div className={`w-full md:w-[450px] lg:w-[500px] xl:w-[600px] flex flex-col border-r bg-white shadow-sm z-10 transition-all duration-300 ${activeTab === 'preview' ? 'hidden md:flex' : 'flex'}`}>
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
                        <Button onClick={handleSave} disabled={saving} size="sm" className="bg-black hover:bg-zinc-800 text-white rounded-lg px-3 md:px-4 h-9 font-medium text-[12px] shadow-sm transition-all active:scale-95">
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin md:mr-2" />
                                    <span className="hidden md:inline">Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 md:mr-2" />
                                    <span className="hidden md:inline">Save</span>
                                </>
                            )}
                        </Button>
                    </div>
                </header>



                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <Tabs defaultValue="content" className="w-full h-full flex flex-col">
                        <TabsList className="w-full bg-zinc-100 p-1 mb-6 shrink-0">
                            <TabsTrigger value="content" className="flex-1 text-[12px]">Content</TabsTrigger>
                            <TabsTrigger value="seo" className="flex-1 text-[12px]">SEO Settings</TabsTrigger>
                            <TabsTrigger value="share" className="flex-1 text-[12px]">Share</TabsTrigger>
                        </TabsList>

                        <TabsContent value="content" className="mt-0 flex-1 space-y-6 outline-none">
                            <section className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                                            <Layers className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[#0A0909]">Blocks & Content</h3>
                                            <p className="text-[11px] text-zinc-500">Manage your page sections</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <Button
                                        className="w-full h-10 rounded-lg border-dashed border border-[#CDD0DB] hover:bg-zinc-50 transition-colors font-medium text-[12px] text-[#0A0909]"
                                        variant="outline"
                                        onClick={() => setIsBlocksModalOpen(true)}
                                    >
                                        <Plus className="w-4 h-4 mr-2 text-black" /> Add New Block
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
                                                                    className={`flex items-center gap-2 p-3 bg-white rounded-lg border border-[#CDD0DB] group transition-all hover:bg-zinc-50 hover:shadow-sm ${snapshot.isDragging ? 'shadow-lg bg-white ring-2 ring-black/10 rotate-1' : ''}`}
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
                                                                            <div className="p-1.5 bg-zinc-50 dark:bg-zinc-800 rounded-md shadow-sm border border-zinc-100 dark:border-zinc-700">
                                                                                {block.type === 'text' && <TextalignJustifycenter size={12} color="#f97316" />}
                                                                                {block.type === 'url' && <Link1 size={12} color="#3b82f6" />}
                                                                                {block.type === 'page_link' && <Layer size={12} color="#a855f7" />}
                                                                                {block.type === 'opening_hours' && <Clock size={12} className="text-blue-500" />}
                                                                                {block.type === 'contact_info' && <Phone size={12} className="text-green-500" />}
                                                                                {block.type === 'location' && <MapPin size={12} className="text-red-500" />}
                                                                                {block.type === 'facilities' && <CheckCircle2 size={12} className="text-teal-500" />}
                                                                                {block.type === 'about' && <Info size={12} className="text-indigo-500" />}
                                                                                {block.type === 'social_networks' && <Share2 size={12} className="text-pink-500" />}
                                                                            </div>
                                                                            <span className="text-[14px] font-medium text-[#0A0909] truncate">
                                                                                {block.type === 'text' ? (block.title || 'Text Block') :
                                                                                    block.type === 'opening_hours' ? 'Opening Hours' :
                                                                                        block.type === 'contact_info' ? 'Contact Information' :
                                                                                            block.type === 'location' ? 'Location' :
                                                                                                block.type === 'facilities' ? 'Facilities' :
                                                                                                    block.type === 'about' ? 'About Us' :
                                                                                                        block.type === 'social_networks' ? 'Social Networks' :
                                                                                                            (block.label || `${block.type} Block`)}
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
                            </section>
                        </TabsContent>

                        <TabsContent value="seo" className="mt-0 outline-none">
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <h3 className="font-rubik font-medium text-[16px] text-[#0A0909]">Search Engine Optimization</h3>
                                    <p className="text-[11px] text-muted-foreground">Manage how your page appears in search results</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-muted-foreground">Page Title</Label>
                                        <Input
                                            placeholder="e.g. Best Coffee in Town - My Cafe"
                                            value={currentPageSettings.headline || ""}
                                            onChange={(e) => updatePageSetting('headline', e.target.value)}
                                            className="h-10 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-end">
                                            <Label className="text-xs font-semibold text-muted-foreground">Meta Description</Label>
                                            <span className="text-[10px] text-muted-foreground">{(currentPageSettings.description || "").length}/160</span>
                                        </div>
                                        <Textarea
                                            placeholder="A brief description of your page for search engines..."
                                            value={currentPageSettings.description || ""}
                                            onChange={(e) => updatePageSetting('description', e.target.value)}
                                            className="min-h-[120px] text-sm resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="share" className="mt-0 outline-none">
                            <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-400 space-y-4">
                                <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center">
                                    <Share2 className="w-8 h-8 opacity-50" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-zinc-900 mb-1">Share your page</h3>
                                    <p className="text-sm max-w-[200px] mx-auto">Publish your page to start sharing it with customers.</p>
                                </div>
                                <Button className="bg-black text-white hover:bg-zinc-800 rounded-full px-6">
                                    Publish Page
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div >

            {/* Right Panel - Preview */}
            < div className={`flex-1 bg-gray-50 md:flex items-center justify-center p-4 md:p-8 overflow-y-auto relative transition-all duration-300 ${activeTab === 'edit' ? 'hidden md:flex' : 'flex'}`
            }>
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>

                <div className="flex flex-col items-center gap-6 w-full max-w-lg mb-20 md:mb-0">
                    {/* Header Toggle - Based on myqrcode.com */}
                    <div className="bg-white border rounded-full p-1 shadow-sm flex items-center gap-1 w-[240px]">
                        <button className="flex-1 h-8 rounded-full bg-[#3b82f6] text-white text-[12px] font-medium flex items-center justify-center gap-1.5">
                            <Eye className="w-3.5 h-3.5" /> Preview
                        </button>
                        <button className="flex-1 h-8 rounded-full text-zinc-400 text-[12px] font-medium flex items-center justify-center gap-1.5 hover:bg-zinc-50">
                            <Layers size={14} /> QR code
                        </button>
                    </div>

                    {/* Smartphone Mockup */}
                    <div className="relative group scale-[0.85] sm:scale-90 lg:scale-100 transition-transform duration-500">
                        {/* Device Frame */}
                        <div className="w-[320px] h-[660px] bg-black rounded-[50px] p-[8px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] relative border border-[#313131]">
                            <div className="h-full w-full bg-white rounded-[42px] overflow-hidden relative border border-black/5">
                                {/* Notch */}
                                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[80px] h-6 bg-black rounded-full z-50"></div>

                                <div className="h-full w-full overflow-y-auto custom-scrollbar bg-white scroll-smooth">
                                    <BusinessStorefront
                                        business={formData}
                                        products={products}
                                        pageType={pageType as any}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >

            {/* Mobile Tab Bar */}
            < div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t flex items-center px-4 z-[100] gap-2" >
                <button
                    onClick={() => setActiveTab('edit')}
                    className={`flex-1 h-10 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all ${activeTab === 'edit' ? 'bg-black text-white shadow-lg' : 'text-zinc-500 hover:bg-zinc-50'}`}
                >
                    <Palette size={18} />
                    Edit
                </button>
                <button
                    onClick={() => setActiveTab('preview')}
                    className={`flex-1 h-10 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all ${activeTab === 'preview' ? 'bg-black text-white shadow-lg' : 'text-zinc-500 hover:bg-zinc-50'}`}
                >
                    <Smartphone size={18} />
                    Preview
                </button>
            </div >


            {/* Blocks Management Modal */}
            < Dialog open={isBlocksModalOpen} onOpenChange={setIsBlocksModalOpen} >
                <DialogContent className="max-w-md p-0 overflow-hidden rounded-xl border border-[#CDD0DB] shadow-xl font-noto-sans h-[550px] flex flex-col">
                    <DialogHeader className="px-6 pt-6 pb-2 border-b-0 bg-white shrink-0">
                        <DialogTitle className="text-[18px] font-medium leading-[26px] text-[#0A0909] font-rubik">Add Content Block</DialogTitle>
                        <p className="text-[10px] font-normal leading-[15.2px] text-[#3F3E3E] mt-1 font-noto-sans">Choose a block type to add to your page</p>
                    </DialogHeader>

                    <Tabs defaultValue="general" className="w-full flex-1 flex flex-col overflow-hidden">
                        <div className="px-6 pb-2 shrink-0">
                            <TabsList className="w-full bg-zinc-100 p-1">
                                <TabsTrigger value="general" className="flex-1 text-[12px]">General</TabsTrigger>
                                <TabsTrigger value="business" className="flex-1 text-[12px]">Business Info</TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
                            <TabsContent value="general" className="mt-0 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        className="p-3 rounded-lg border border-[#CDD0DB] hover:border-black hover:bg-zinc-50 transition-all duration-200 text-left group flex flex-row items-center gap-3 relative"
                                        onClick={() => { addBlock('text'); toast.success('Text block added'); }}
                                    >
                                        <div className="relative">
                                            <div className="w-9 h-9 bg-orange-500 rounded-md flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-all">
                                                <TextalignJustifycenter size={18} color="#ffffff" />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="font-medium text-[13px] text-[#0A0909] font-noto-sans">Text</div>
                                            <div className="text-[10px] text-[#3F3E3E]">Headings & text</div>
                                        </div>
                                    </button>

                                    <button
                                        className="p-3 rounded-lg border border-[#CDD0DB] hover:border-black hover:bg-zinc-50 transition-all duration-200 text-left group flex flex-row items-center gap-3 relative"
                                        onClick={() => { addBlock('url'); toast.success('Link block added'); }}
                                    >
                                        <div className="relative">
                                            <div className="w-9 h-9 bg-blue-500 rounded-md flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-all">
                                                <Link1 size={18} color="#ffffff" />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="font-medium text-[13px] text-[#0A0909] font-noto-sans">Link</div>
                                            <div className="text-[10px] text-[#3F3E3E]">External website</div>
                                        </div>
                                    </button>

                                    <button
                                        className="p-3 rounded-lg border border-[#CDD0DB] hover:border-black hover:bg-zinc-50 transition-all duration-200 text-left group flex flex-row items-center gap-3 relative"
                                        onClick={() => { addBlock('page_link'); toast.success('Page link added'); }}
                                    >
                                        <div className="relative">
                                            <div className="w-9 h-9 bg-purple-500 rounded-md flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-all">
                                                <Layer size={18} color="#ffffff" />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="font-medium text-[13px] text-[#0A0909] font-noto-sans">Page</div>
                                            <div className="text-[10px] text-[#3F3E3E]">Internal link</div>
                                        </div>
                                    </button>
                                </div>
                            </TabsContent>

                            <TabsContent value="business" className="mt-0 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        className="p-3 rounded-lg border border-[#CDD0DB] hover:border-black hover:bg-zinc-50 transition-all duration-200 text-left group flex flex-row items-center gap-3 relative"
                                        onClick={() => { addBlock('opening_hours'); toast.success('Hours block added'); }}
                                    >
                                        <div className="relative">
                                            <div className="w-9 h-9 bg-blue-600 rounded-md flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-all">
                                                <Clock size={18} />
                                            </div>
                                            {blocks.some((b: any) => b.type === 'opening_hours') && (
                                                <div className="absolute -top-1.5 -right-1.5 bg-green-500 rounded-full p-0.5 border-2 border-white shadow-sm">
                                                    <Check size={10} className="text-white" strokeWidth={4} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium text-[13px] text-[#0A0909] font-noto-sans">Hours</div>
                                            <div className="text-[10px] text-[#3F3E3E]">Opening schedule</div>
                                        </div>
                                    </button>

                                    <button
                                        className="p-3 rounded-lg border border-[#CDD0DB] hover:border-black hover:bg-zinc-50 transition-all duration-200 text-left group flex flex-row items-center gap-3 relative"
                                        onClick={() => { addBlock('contact_info'); toast.success('Contact info added'); }}
                                    >
                                        <div className="relative">
                                            <div className="w-9 h-9 bg-green-500 rounded-md flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-all">
                                                <Phone size={18} />
                                            </div>
                                            {blocks.some((b: any) => b.type === 'contact_info') && (
                                                <div className="absolute -top-1.5 -right-1.5 bg-green-500 rounded-full p-0.5 border-2 border-white shadow-sm">
                                                    <Check size={10} className="text-white" strokeWidth={4} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium text-[13px] text-[#0A0909] font-noto-sans">Contact</div>
                                            <div className="text-[10px] text-[#3F3E3E]">Phones & email</div>
                                        </div>
                                    </button>

                                    <button
                                        className="p-3 rounded-lg border border-[#CDD0DB] hover:border-black hover:bg-zinc-50 transition-all duration-200 text-left group flex flex-row items-center gap-3 relative"
                                        onClick={() => { addBlock('location'); toast.success('Location block added'); }}
                                    >
                                        <div className="relative">
                                            <div className="w-9 h-9 bg-red-500 rounded-md flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-all">
                                                <MapPin size={18} />
                                            </div>
                                            {blocks.some((b: any) => b.type === 'location') && (
                                                <div className="absolute -top-1.5 -right-1.5 bg-green-500 rounded-full p-0.5 border-2 border-white shadow-sm">
                                                    <Check size={10} className="text-white" strokeWidth={4} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium text-[13px] text-[#0A0909] font-noto-sans">Location</div>
                                            <div className="text-[10px] text-[#3F3E3E]">Address & map</div>
                                        </div>
                                    </button>

                                    <button
                                        className="p-3 rounded-lg border border-[#CDD0DB] hover:border-black hover:bg-zinc-50 transition-all duration-200 text-left group flex flex-row items-center gap-3 relative"
                                        onClick={() => { addBlock('facilities'); toast.success('Facilities block added'); }}
                                    >
                                        <div className="relative">
                                            <div className="w-9 h-9 bg-teal-500 rounded-md flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-all">
                                                <CheckCircle2 size={18} />
                                            </div>
                                            {blocks.some((b: any) => b.type === 'facilities') && (
                                                <div className="absolute -top-1.5 -right-1.5 bg-green-500 rounded-full p-0.5 border-2 border-white shadow-sm">
                                                    <Check size={10} className="text-white" strokeWidth={4} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium text-[13px] text-[#0A0909] font-noto-sans">Facilities</div>
                                            <div className="text-[10px] text-[#3F3E3E]">Amenities</div>
                                        </div>
                                    </button>

                                    <button
                                        className="p-3 rounded-lg border border-[#CDD0DB] hover:border-black hover:bg-zinc-50 transition-all duration-200 text-left group flex flex-row items-center gap-3 relative"
                                        onClick={() => { addBlock('about'); toast.success('About block added'); }}
                                    >
                                        <div className="relative">
                                            <div className="w-9 h-9 bg-indigo-500 rounded-md flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-all">
                                                <Info size={18} />
                                            </div>
                                            {blocks.some((b: any) => b.type === 'about') && (
                                                <div className="absolute -top-1.5 -right-1.5 bg-green-500 rounded-full p-0.5 border-2 border-white shadow-sm">
                                                    <Check size={10} className="text-white" strokeWidth={4} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium text-[13px] text-[#0A0909] font-noto-sans">About</div>
                                            <div className="text-[10px] text-[#3F3E3E]">Company summary</div>
                                        </div>
                                    </button>

                                    <button
                                        className="p-3 rounded-lg border border-[#CDD0DB] hover:border-black hover:bg-zinc-50 transition-all duration-200 text-left group flex flex-row items-center gap-3 relative"
                                        onClick={() => { addBlock('social_networks'); toast.success('Social links added'); }}
                                    >
                                        <div className="relative">
                                            <div className="w-9 h-9 bg-pink-500 rounded-md flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-all">
                                                <Share2 size={18} />
                                            </div>
                                            {blocks.some((b: any) => b.type === 'social_networks') && (
                                                <div className="absolute -top-1.5 -right-1.5 bg-green-500 rounded-full p-0.5 border-2 border-white shadow-sm">
                                                    <Check size={10} className="text-white" strokeWidth={4} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium text-[13px] text-[#0A0909] font-noto-sans">Social</div>
                                            <div className="text-[10px] text-[#3F3E3E]">Social networks</div>
                                        </div>
                                    </button>
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>

                    <DialogFooter className="p-4 border-t border-[#CDD0DB] bg-zinc-50 rounded-b-xl shrink-0">
                        <Button
                            className="w-full h-10 rounded-lg font-medium text-[12px] bg-black hover:bg-zinc-800 text-white shadow-sm transition-all"
                            onClick={() => setIsBlocksModalOpen(false)}
                        >
                            Done Adding Blocks
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >

            {/* Block Edit Modal */}
            < Dialog open={!!editingBlockId} onOpenChange={(open) => !open && setEditingBlockId(null)}>
                {editingBlock && (
                    <DialogContent className="max-w-md p-0 overflow-hidden rounded-xl border border-[#CDD0DB] shadow-xl font-noto-sans">
                        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#CDD0DB] bg-white">
                            <DialogTitle className="text-[18px] font-medium leading-[26px] text-[#0A0909] flex items-center gap-3 font-rubik">
                                <div className="p-2 bg-zinc-100 rounded-lg">
                                    {editingBlock.type === 'text' && <TextalignJustifycenter size={16} color="#f97316" />}
                                    {editingBlock.type === 'url' && <Link1 size={16} color="#3b82f6" />}
                                    {editingBlock.type === 'page_link' && <Layer size={16} color="#a855f7" />}
                                    {editingBlock.type === 'opening_hours' && <Clock size={16} className="text-blue-500" />}
                                    {editingBlock.type === 'contact_info' && <Phone size={16} className="text-green-500" />}
                                    {editingBlock.type === 'location' && <MapPin size={16} className="text-red-500" />}
                                    {editingBlock.type === 'facilities' && <CheckCircle2 size={16} className="text-teal-500" />}
                                    {editingBlock.type === 'about' && <Info size={16} className="text-indigo-500" />}
                                    {editingBlock.type === 'social_networks' && <Share2 size={16} className="text-pink-500" />}
                                </div>
                                Edit {editingBlock.type.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="p-8 space-y-6 max-h-[500px] overflow-y-auto custom-scrollbar">
                            {editingBlock.type === 'text' && (
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-muted-foreground">Title</Label>
                                        <Input
                                            value={editingBlock.title}
                                            onChange={(e) => updateBlock(editingBlock.id, { title: e.target.value })}
                                            className="h-10 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-muted-foreground">Content</Label>
                                        <Textarea
                                            value={editingBlock.content}
                                            onChange={(e) => updateBlock(editingBlock.id, { content: e.target.value })}
                                            className="min-h-[120px] text-sm resize-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-muted-foreground">Alignment</Label>
                                        <div className="flex gap-2 bg-zinc-100 p-1 rounded-lg">
                                            {['left', 'center', 'right'].map((align) => (
                                                <button
                                                    key={align}
                                                    className={`flex-1 py-1.5 rounded-md text-[10px] font-medium uppercase transition-all ${editingBlock.align === align ? 'bg-white shadow-sm text-black' : 'text-zinc-500 hover:text-zinc-700'}`}
                                                    onClick={() => updateBlock(editingBlock.id, { align })}
                                                >
                                                    {align}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {editingBlock.type === 'opening_hours' && (
                                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-semibold text-muted-foreground">Open 24/7</Label>
                                        <Switch
                                            checked={editingBlock.isOpen247}
                                            onCheckedChange={(checked) => updateBlock(editingBlock.id, { isOpen247: checked })}
                                        />
                                    </div>

                                    {!editingBlock.isOpen247 && (
                                        <div className="space-y-4">
                                            {editingBlock.days.map((day: any, idx: number) => (
                                                <div key={idx} className="space-y-2 border-b pb-4 last:border-0">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-bold text-sm">{day.day}</span>
                                                        <Switch
                                                            checked={day.isOpen}
                                                            onCheckedChange={(checked) => {
                                                                const newDays = [...editingBlock.days]
                                                                newDays[idx] = { ...newDays[idx], isOpen: checked }
                                                                updateBlock(editingBlock.id, { days: newDays })
                                                            }}
                                                        />
                                                    </div>
                                                    {day.isOpen && (
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <Input
                                                                type="time"
                                                                value={day.openTime}
                                                                onChange={(e) => {
                                                                    const newDays = [...editingBlock.days]
                                                                    newDays[idx] = { ...newDays[idx], openTime: e.target.value }
                                                                    updateBlock(editingBlock.id, { days: newDays })
                                                                }}
                                                                className="h-10 text-sm"
                                                            />
                                                            <Input
                                                                type="time"
                                                                value={day.closeTime}
                                                                onChange={(e) => {
                                                                    const newDays = [...editingBlock.days]
                                                                    newDays[idx] = { ...newDays[idx], closeTime: e.target.value }
                                                                    updateBlock(editingBlock.id, { days: newDays })
                                                                }}
                                                                className="h-10 text-sm"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {editingBlock.type === 'contact_info' && (
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-muted-foreground">Full Name</Label>
                                        <Input
                                            value={editingBlock.fullName}
                                            onChange={(e) => updateBlock(editingBlock.id, { fullName: e.target.value })}
                                            className="h-10 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-muted-foreground">Phone</Label>
                                        <Input
                                            value={editingBlock.phone}
                                            onChange={(e) => updateBlock(editingBlock.id, { phone: e.target.value })}
                                            className="h-10 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-muted-foreground">Alternative Phone</Label>
                                        <Input
                                            value={editingBlock.altPhone}
                                            onChange={(e) => updateBlock(editingBlock.id, { altPhone: e.target.value })}
                                            className="h-10 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-muted-foreground">Email</Label>
                                        <Input
                                            value={editingBlock.email}
                                            onChange={(e) => updateBlock(editingBlock.id, { email: e.target.value })}
                                            className="h-10 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-muted-foreground">Website</Label>
                                        <Input
                                            value={editingBlock.website}
                                            onChange={(e) => updateBlock(editingBlock.id, { website: e.target.value })}
                                            className="h-10 text-sm"
                                        />
                                    </div>
                                </div>
                            )}

                            {editingBlock.type === 'location' && (
                                <Tabs value={editingBlock.locationType || 'manual'} onValueChange={(val) => updateBlock(editingBlock.id, { locationType: val })} className="w-full">
                                    <TabsList className="w-full grid w-full grid-cols-2 bg-zinc-100 p-1 mb-4 h-9">
                                        <TabsTrigger value="manual" className="text-xs font-medium">Manual</TabsTrigger>
                                        <TabsTrigger value="url" className="text-xs font-medium">Google Maps URL</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="manual" className="space-y-3 mt-0">
                                        <Input
                                            placeholder="Street Address"
                                            value={editingBlock.street}
                                            onChange={(e) => updateBlock(editingBlock.id, { street: e.target.value })}
                                            className="h-10 text-sm"
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                            <Input
                                                placeholder="City"
                                                value={editingBlock.city}
                                                onChange={(e) => updateBlock(editingBlock.id, { city: e.target.value })}
                                                className="h-10 text-sm"
                                            />
                                            <Input
                                                placeholder="State / Province"
                                                value={editingBlock.state}
                                                onChange={(e) => updateBlock(editingBlock.id, { state: e.target.value })}
                                                className="h-10 text-sm"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Input
                                                placeholder="Postal Code"
                                                value={editingBlock.postalCode}
                                                onChange={(e) => updateBlock(editingBlock.id, { postalCode: e.target.value })}
                                                className="h-10 text-sm"
                                            />
                                            <Input
                                                placeholder="Country"
                                                value={editingBlock.country}
                                                onChange={(e) => updateBlock(editingBlock.id, { country: e.target.value })}
                                                className="h-10 text-sm"
                                            />
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="url" className="mt-0 pt-2">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-muted-foreground">Google Maps Link</Label>
                                            <div className="relative">
                                                <Input
                                                    placeholder="https://maps.google.com/..."
                                                    value={editingBlock.url}
                                                    onChange={(e) => updateBlock(editingBlock.id, { url: e.target.value })}
                                                    className="h-10 text-sm pr-9"
                                                />
                                                <button
                                                    onClick={() => {
                                                        if (!navigator.geolocation) {
                                                            toast.error("Geolocation is not supported by your browser");
                                                            return;
                                                        }
                                                        const toastId = toast.loading("Getting location...");
                                                        navigator.geolocation.getCurrentPosition(
                                                            (position) => {
                                                                const { latitude, longitude } = position.coords;
                                                                const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
                                                                updateBlock(editingBlock.id, { url: mapsUrl });
                                                                toast.dismiss(toastId);
                                                                toast.success("Location updated");
                                                            },
                                                            (error) => {
                                                                console.error(error);
                                                                toast.dismiss(toastId);
                                                                toast.error("Unable to retrieve location");
                                                            }
                                                        );
                                                    }}
                                                    className="absolute right-0 top-0 h-full px-2.5 text-muted-foreground hover:text-black transition-colors"
                                                    title="Use my current location"
                                                >
                                                    <LocateFixed className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground">Paste a link or use your current location.</p>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            )}

                            {editingBlock.type === 'facilities' && (
                                <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2">
                                    {[
                                        { id: 'wifi', label: 'Wi-Fi', icon: <Wifi className="w-4 h-4" /> },
                                        { id: 'parking', label: 'Parking', icon: <Car className="w-4 h-4" /> },
                                        { id: 'cafe', label: 'Cafe', icon: <Coffee className="w-4 h-4" /> },
                                        { id: 'restaurant', label: 'Restaurant', icon: <Utensils className="w-4 h-4" /> },
                                        { id: 'accessible', label: 'Accessible', icon: <Accessibility className="w-4 h-4" /> },
                                        { id: 'child', label: 'Child Friendly', icon: <Baby className="w-4 h-4" /> },
                                        { id: 'pet', label: 'Pet Friendly', icon: <Dog className="w-4 h-4" /> },
                                        { id: 'seating', label: 'Seating', icon: <Layers className="w-4 h-4" /> },
                                    ].map((facility) => {
                                        const isSelected = editingBlock.selectedFacilities?.includes(facility.id);
                                        return (
                                            <button
                                                key={facility.id}
                                                className={`flex items-center justify-between p-3 rounded-xl border transition-all relative ${isSelected ? 'border-black bg-zinc-50 text-black' : 'border-[#CDD0DB] hover:border-black text-gray-500'}`}
                                                onClick={() => {
                                                    const current = editingBlock.selectedFacilities || []
                                                    const next = current.includes(facility.id)
                                                        ? current.filter((id: string) => id !== facility.id)
                                                        : [...current, facility.id]
                                                    updateBlock(editingBlock.id, { selectedFacilities: next })
                                                }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {facility.icon}
                                                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{facility.label}</span>
                                                </div>
                                                {isSelected && (
                                                    <div className="flex bg-black rounded-full p-0.5">
                                                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={4} />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {editingBlock.type === 'about' && (
                                <div className="space-y-4">
                                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">About the Company</Label>
                                    <Textarea
                                        placeholder="Add a summary about your business..."
                                        value={editingBlock.summary}
                                        onChange={(e) => updateBlock(editingBlock.id, { summary: e.target.value })}
                                        className="min-h-[120px] text-sm resize-none"
                                    />
                                </div>
                            )}

                            {editingBlock.type === 'social_networks' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-4 gap-2">
                                        {[
                                            { id: 'facebook', icon: <Facebook className="w-5 h-5" /> },
                                            { id: 'instagram', icon: <Instagram className="w-5 h-5" /> },
                                            { id: 'twitter', icon: <Twitter className="w-5 h-5" /> },
                                            { id: 'linkedin', icon: <Linkedin className="w-5 h-5" /> },
                                            { id: 'whatsapp', icon: <Zap className="w-5 h-5" /> },
                                            { id: 'youtube', icon: <Youtube className="w-5 h-5" /> },
                                            { id: 'github', icon: <Github className="w-5 h-5" /> },
                                            { id: 'website', icon: <Globe className="w-5 h-5" /> },
                                        ].map((p) => {
                                            const isSelected = editingBlock.platforms?.find((pl: any) => pl.name === p.id);
                                            return (
                                                <button
                                                    key={p.id}
                                                    className={`p-3 rounded-xl border flex items-center justify-center transition-all relative ${isSelected ? 'border-black bg-zinc-50 text-black' : 'border-[#CDD0DB] hover:border-black text-gray-400'}`}
                                                    onClick={() => {
                                                        const current = editingBlock.platforms || []
                                                        const exists = current.find((pl: any) => pl.name === p.id)
                                                        if (exists) {
                                                            updateBlock(editingBlock.id, { platforms: current.filter((pl: any) => pl.name !== p.id) })
                                                        } else {
                                                            updateBlock(editingBlock.id, { platforms: [...current, { name: p.id, url: '' }] })
                                                        }
                                                    }}
                                                >
                                                    {p.icon}
                                                    {isSelected && (
                                                        <div className="absolute -top-1 -right-1 bg-black rounded-full p-0.5 border-2 border-white shadow-sm">
                                                            <Check className="w-2 h-2 text-white" strokeWidth={5} />
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="space-y-3 mt-4">
                                        {(editingBlock.platforms || []).map((p: any, idx: number) => (
                                            <div key={p.name} className="flex gap-2">
                                                <div className="w-10 h-10 bg-zinc-50 border border-[#CDD0DB] rounded-lg flex items-center justify-center shrink-0 uppercase text-[10px] font-bold">
                                                    {p.name.substring(0, 2)}
                                                </div>
                                                <Input
                                                    placeholder={`${p.name} URL`}
                                                    value={p.url}
                                                    onChange={(e) => {
                                                        const next = [...editingBlock.platforms]
                                                        next[idx].url = e.target.value
                                                        updateBlock(editingBlock.id, { platforms: next })
                                                    }}
                                                    className="h-10 text-sm"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {editingBlock.type === 'url' && (
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-muted-foreground">Button Label</Label>
                                        <Input
                                            value={editingBlock.label}
                                            onChange={(e) => updateBlock(editingBlock.id, { label: e.target.value })}
                                            className="h-10 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-muted-foreground">Subtitle (Optional)</Label>
                                        <Input
                                            placeholder="e.g. Visit our social media"
                                            value={editingBlock.subtitle || ""}
                                            onChange={(e) => updateBlock(editingBlock.id, { subtitle: e.target.value })}
                                            className="h-10 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-muted-foreground">Target URL</Label>
                                        <Input
                                            value={editingBlock.url}
                                            onChange={(e) => updateBlock(editingBlock.id, { url: e.target.value })}
                                            className="h-10 text-sm"
                                        />
                                    </div>
                                </div>
                            )}

                            {editingBlock.type === 'page_link' && (
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-muted-foreground">Button Label</Label>
                                        <Input
                                            value={editingBlock.label}
                                            onChange={(e) => updateBlock(editingBlock.id, { label: e.target.value })}
                                            className="h-10 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-muted-foreground">Subtitle (Optional)</Label>
                                        <Input
                                            placeholder="e.g. Browse the full catalog"
                                            value={editingBlock.subtitle || ""}
                                            onChange={(e) => updateBlock(editingBlock.id, { subtitle: e.target.value })}
                                            className="h-10 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-muted-foreground">Link To Page</Label>
                                        <select
                                            value={editingBlock.pageType}
                                            onChange={(e) => updateBlock(editingBlock.id, { pageType: e.target.value })}
                                            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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

                        <DialogFooter className="p-6 border-t border-[#CDD0DB] bg-white">
                            <Button className="w-full h-10 rounded-lg font-medium text-[12px] bg-black hover:bg-zinc-800 text-white shadow-sm transition-all" onClick={() => setEditingBlockId(null)}>
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                )}
            </Dialog >
        </div >
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
