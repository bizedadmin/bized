/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { QRCodeCanvas } from "qrcode.react"
import {
    ArrowLeft,
    Save,
    Eye,
    Smartphone,
    Palette,
    Plus,
    Trash2,
    Check,
    GripVertical,
    Layers,
    Loader2,
    Clock,
    Phone,
    MapPin,
    CheckCircle2,
    Info,
    Share2,
    Facebook,
    Twitter,
    Zap,
    ExternalLink,
    Copy,
    ShoppingBag,
    Wifi,
    Car,
    Coffee,
    Utensils,
    Accessibility,
    Baby,
    Dog,
    LocateFixed,
    Instagram,
    Linkedin,
    Youtube,
    Github,
    Globe,
    Mail
} from "lucide-react"
import {
    TextalignJustifycenter,
    Link1,
    Layer,
    Edit2
} from "iconsax-reactjs"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { BusinessProfile } from "@/components/business/business-profile"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileData, Block, Page } from "@/types/profile"

interface ReusablePageBuilderProps {
    initialData: ProfileData
    pageType: 'profile' | 'bookings' | 'shop' | 'quote' | 'storefront'
    onSave: (data: ProfileData) => Promise<void>
    onBack?: () => void
    products?: any[]
    services?: any[]
    isSaving?: boolean
}

export function ReusablePageBuilder({
    initialData,
    pageType,
    onSave,
    onBack,
    products = [],
    services = [],
    isSaving = false
}: ReusablePageBuilderProps) {
    const [formData, setFormData] = useState<ProfileData>(initialData)
    const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
    const [isDirty, setIsDirty] = useState(false)
    const [isBlocksModalOpen, setIsBlocksModalOpen] = useState(false)
    const [editingBlockId, setEditingBlockId] = useState<string | null>(null)

    useEffect(() => {
        setFormData(initialData)
    }, [initialData])

    const updateField = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }))
        setIsDirty(true)
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
                pages.push({
                    title: pageType.charAt(0).toUpperCase() + pageType.slice(1),
                    slug: pageType,
                    type: pageType,
                    enabled: true,
                    settings: { [settingKey]: value }
                })
            }
            return { ...prev, pages }
        })
        setIsDirty(true)
    }

    const currentPage = formData.pages?.find((p: any) => p.type === pageType) || { settings: { blocks: [] } } as any
    const blocks = currentPage.settings?.blocks || []
    const editingBlock = blocks.find((b: any) => b.id === editingBlockId)

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return
        const items = Array.from(blocks)
        const [reorderedItem] = items.splice(result.source.index, 1)
        items.splice(result.destination.index, 0, reorderedItem)
        updatePageSetting('blocks', items)
    }

    const addBlock = (type: string) => {
        const singleInstanceBlocks = ['opening_hours', 'contact_info', 'location', 'facilities', 'about', 'social_networks', 'services', 'products'];
        if (singleInstanceBlocks.includes(type) && blocks.some((b: any) => b.type === type)) {
            toast.error(`${type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} block already exists`);
            return;
        }

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
                    phone: formData.phone?.number || '',
                    email: formData.email || '',
                    website: formData.website || formData.url || ''
                }
                break
            case 'services':
                newBlock = { ...newBlock, title: 'Our Services', description: 'Select the services you would like to book.' }
                break
            case 'products':
                newBlock = { ...newBlock, title: 'Shop Products', description: 'Explore our curated collection of items.' }
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
                newBlock = { ...newBlock, selectedFacilities: formData.selectedFacilities || [] }
                break
            case 'about':
                newBlock = { ...newBlock, summary: formData.description || '' }
                break
            case 'social_networks':
                newBlock = {
                    ...newBlock,
                    platforms: formData.sameAs?.map((url: string) => ({
                        name: url.includes('facebook') ? 'facebook' :
                            url.includes('instagram') ? 'instagram' :
                                url.includes('twitter') ? 'twitter' :
                                    url.includes('linkedin') ? 'linkedin' :
                                        url.includes('youtube') ? 'youtube' :
                                            url.includes('github') ? 'github' :
                                                url.includes('whatsapp') ? 'whatsapp' : 'website',
                        url
                    })) || []
                }
                break
            // ... add other default block cases as needed
        }

        updatePageSetting('blocks', [...blocks, newBlock])
        toast.success(`${type.split('_').join(' ')} block added!`)
    }

    const removeBlock = (id: string) => {
        updatePageSetting('blocks', blocks.filter((b: any) => b.id !== id))
        toast.info("Block removed")
    }

    const updateBlock = (id: string, updates: any) => {
        const targetBlock = blocks.find((b: any) => b.id === id)
        if (!targetBlock) return

        updatePageSetting('blocks', blocks.map((b: any) =>
            b.id === id ? { ...b, ...updates } : b
        ))

        // Sync with top-level fields if they exist
        setFormData((prev: any) => {
            const next = { ...prev }
            if (targetBlock.type === 'opening_hours' && 'days' in updates) next.businessHours = updates.days
            if (targetBlock.type === 'contact_info') {
                if ('phone' in updates) next.phone = { ...(next.phone || {}), number: updates.phone }
                if ('email' in updates) next.email = updates.email
                if ('website' in updates) next.url = updates.website
            }
            if (targetBlock.type === 'location' && updates.locationType === 'manual') {
                next.address = {
                    ...(next.address || {}),
                    streetAddress: updates.street || next.address?.streetAddress,
                    addressLocality: updates.city || next.address?.addressLocality,
                    addressRegion: updates.state || next.address?.addressRegion,
                    postalCode: updates.postalCode || next.address?.postalCode,
                    addressCountry: updates.country || next.address?.addressCountry,
                }
            }
            if (targetBlock.type === 'about' && 'summary' in updates) next.description = updates.summary
            if (targetBlock.type === 'facilities' && 'selectedFacilities' in updates) next.selectedFacilities = updates.selectedFacilities
            if (targetBlock.type === 'social_networks' && 'platforms' in updates) {
                next.sameAs = updates.platforms.map((p: any) => p.url).filter(Boolean)
            }
            return next
        })
    }

    const downloadQR = () => {
        const canvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement;
        if (canvas) {
            const pngUrl = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            downloadLink.download = `${formData.slug}-${pageType}-qr.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            toast.success("QR Code downloaded!");
        }
    }

    return (
        <div className="flex flex-col md:flex-row h-screen bg-white overflow-hidden">
            {/* Sidebar - Builder Controls */}
            <div className={`w-full md:w-[450px] lg:w-[500px] xl:w-[600px] flex flex-col border-r bg-white shadow-sm z-10 transition-all duration-300 ${activeTab === 'preview' ? 'hidden md:flex' : 'flex'}`}>
                {/* Header */}
                <header className="h-16 border-b flex items-center justify-between px-6 bg-white shrink-0">
                    <div className="flex items-center gap-4">
                        {onBack && (
                            <Button variant="ghost" size="icon" onClick={onBack}>
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        )}
                        <div>
                            <h1 className="font-semibold text-lg">{formData.name}</h1>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                                {pageType} Builder
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button onClick={() => onSave(formData)} disabled={isSaving} size="sm" className="bg-black hover:bg-zinc-800 text-white rounded-lg px-3 md:px-4 h-9 font-medium text-[12px] shadow-sm transition-all active:scale-95">
                            {isSaving ? (
                                <><Loader2 className="w-4 h-4 animate-spin md:mr-2" /><span className="hidden md:inline">Saving...</span></>
                            ) : (
                                <><Save className="w-4 h-4 md:mr-2" /><span className="hidden md:inline">Save</span></>
                            )}
                        </Button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <Tabs defaultValue="content" className="w-full h-full flex flex-col">
                        <TabsList className="w-full bg-zinc-100 p-1 mb-6 shrink-0">
                            <TabsTrigger value="content" className="flex-1 text-[12px]">Content</TabsTrigger>
                            <TabsTrigger value="seo" className="flex-1 text-[12px]">SEO</TabsTrigger>
                        </TabsList>

                        <TabsContent value="content" className="mt-0 flex-1 space-y-6 outline-none">
                            <section className="space-y-4">
                                <Button
                                    className="w-full h-10 rounded-lg border-dashed border border-[#CDD0DB] hover:bg-zinc-50 transition-colors font-medium text-[12px]"
                                    variant="outline"
                                    onClick={() => setIsBlocksModalOpen(true)}
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Add New Block
                                </Button>

                                <DragDropContext onDragEnd={onDragEnd}>
                                    <Droppable droppableId="blocks-list">
                                        {(provided) => (
                                            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                                                {blocks.map((block: any, index: number) => (
                                                    <Draggable key={block.id} draggableId={block.id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                className={`flex items-center gap-2 p-3 bg-white rounded-lg border border-[#CDD0DB] group transition-all hover:bg-zinc-50 ${snapshot.isDragging ? 'shadow-lg bg-white ring-2 ring-black/10' : ''}`}
                                                                style={provided.draggableProps.style}
                                                            >
                                                                <div {...provided.dragHandleProps} className="cursor-grab text-zinc-300 p-1">
                                                                    <GripVertical className="w-4 h-4" />
                                                                </div>
                                                                <div className="flex-1 min-w-0 flex items-center gap-2">
                                                                    <div className="p-1.5 bg-zinc-50 rounded-md">
                                                                        {block.type === 'text' && <TextalignJustifycenter size={12} color="#f97316" />}
                                                                        {block.type === 'url' && <Link1 size={12} color="#3b82f6" />}
                                                                        {block.type === 'page_link' && <Layer size={12} color="#a855f7" />}
                                                                    </div>
                                                                    <span className="text-[14px] font-medium truncate">
                                                                        {block.title || block.label || block.type}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingBlockId(block.id)}>
                                                                        <Edit2 className="w-3.5 h-3.5" />
                                                                    </Button>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => removeBlock(block.id)}>
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
                            </section>
                        </TabsContent>

                        <TabsContent value="seo" className="mt-0 space-y-4">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Page Title</Label>
                                    <Input
                                        value={currentPage.settings?.headline || ""}
                                        onChange={(e) => updatePageSetting('headline', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Meta Description</Label>
                                    <Textarea
                                        value={currentPage.settings?.description || ""}
                                        onChange={(e) => updatePageSetting('description', e.target.value)}
                                    />
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Right Panel - Preview */}
            <div className={`flex-1 bg-gray-50 md:flex items-center justify-center p-4 overflow-y-auto relative ${activeTab === 'edit' ? 'hidden md:flex' : 'flex'}`}>
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>
                <div className="relative scale-[0.85] sm:scale-90 lg:scale-100 transition-transform duration-500">
                    <div className="w-[320px] h-[660px] bg-black rounded-[50px] p-[8px] shadow-2xl relative border border-[#313131]">
                        <div className="h-full w-full bg-white rounded-[42px] overflow-hidden relative border border-black/5">
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[80px] h-6 bg-black rounded-full z-50"></div>
                            <div className="h-full w-full overflow-y-auto custom-scrollbar bg-white">
                                <BusinessProfile
                                    business={formData}
                                    products={products}
                                    services={services}
                                    pageType={pageType as any}
                                    isPreview={true}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Blocks Management Modal */}
            <Dialog open={isBlocksModalOpen} onOpenChange={setIsBlocksModalOpen}>
                <DialogContent className="max-w-md p-0 overflow-hidden rounded-xl h-[550px] flex flex-col">
                    <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
                        <DialogTitle className="text-lg font-medium">Add Content Block</DialogTitle>
                        <p className="text-xs text-gray-500">Choose a block type to add to your page</p>
                    </DialogHeader>

                    <Tabs defaultValue="general" className="w-full flex-1 flex flex-col overflow-hidden">
                        <div className="px-6 pb-2 shrink-0">
                            <TabsList className="w-full bg-zinc-100 p-1">
                                <TabsTrigger value="general" className="flex-1 text-[12px]">General</TabsTrigger>
                                <TabsTrigger value="business" className="flex-1 text-[12px]">Business Info</TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
                            <TabsContent value="general" className="mt-0 grid grid-cols-2 gap-3">
                                <button onClick={() => addBlock('text')} className="p-3 border rounded-lg hover:bg-zinc-50 flex items-center gap-3">
                                    <TextalignJustifycenter size={18} /> <div><div className="font-medium text-xs">Text</div><div className="text-[10px] text-gray-500">Headings & text</div></div>
                                </button>
                                <button onClick={() => addBlock('url')} className="p-3 border rounded-lg hover:bg-zinc-50 flex items-center gap-3">
                                    <Link1 size={18} /> <div><div className="font-medium text-xs">Link</div><div className="text-[10px] text-gray-500">External website</div></div>
                                </button>
                                <button onClick={() => addBlock('page_link')} className="p-3 border rounded-lg hover:bg-zinc-50 flex items-center gap-3">
                                    <Layer size={18} /> <div><div className="font-medium text-xs">Page</div><div className="text-[10px] text-gray-500">Internal link</div></div>
                                </button>
                            </TabsContent>

                            <TabsContent value="business" className="mt-0 grid grid-cols-2 gap-3">
                                <button onClick={() => addBlock('opening_hours')} className="p-3 border rounded-lg hover:bg-zinc-50 flex items-center gap-3">
                                    <Clock size={18} /> <div><div className="font-medium text-xs">Hours</div><div className="text-[10px] text-gray-500">Opening schedule</div></div>
                                </button>
                                <button onClick={() => addBlock('contact_info')} className="p-3 border rounded-lg hover:bg-zinc-50 flex items-center gap-3">
                                    <Phone size={18} /> <div><div className="font-medium text-xs">Contact</div><div className="text-[10px] text-gray-500">Phones & email</div></div>
                                </button>
                                <button onClick={() => addBlock('location')} className="p-3 border rounded-lg hover:bg-zinc-50 flex items-center gap-3">
                                    <MapPin size={18} /> <div><div className="font-medium text-xs">Location</div><div className="text-[10px] text-gray-500">Address & map</div></div>
                                </button>
                                <button onClick={() => addBlock('facilities')} className="p-3 border rounded-lg hover:bg-zinc-50 flex items-center gap-3">
                                    <CheckCircle2 size={18} /> <div><div className="font-medium text-xs">Facilities</div><div className="text-[10px] text-gray-500">Amenities</div></div>
                                </button>
                                <button onClick={() => addBlock('about')} className="p-3 border rounded-lg hover:bg-zinc-50 flex items-center gap-3">
                                    <Info size={18} /> <div><div className="font-medium text-xs">About</div><div className="text-[10px] text-gray-500">Summary</div></div>
                                </button>
                                <button onClick={() => addBlock('social_networks')} className="p-3 border rounded-lg hover:bg-zinc-50 flex items-center gap-3">
                                    <Share2 size={18} /> <div><div className="font-medium text-xs">Social</div><div className="text-[10px] text-gray-500">Social networks</div></div>
                                </button>
                                <button onClick={() => addBlock('services')} className="p-3 border rounded-lg hover:bg-zinc-50 flex items-center gap-3">
                                    <Zap size={18} /> <div><div className="font-medium text-xs">Services</div><div className="text-[10px] text-gray-500">Services list</div></div>
                                </button>
                                <button onClick={() => addBlock('products')} className="p-3 border rounded-lg hover:bg-zinc-50 flex items-center gap-3">
                                    <ShoppingBag size={18} /> <div><div className="font-medium text-xs">Products</div><div className="text-[10px] text-gray-500">Product catalog</div></div>
                                </button>
                            </TabsContent>
                        </div>
                    </Tabs>
                    <DialogFooter className="p-4 border-t bg-zinc-50 rounded-b-xl">
                        <Button className="w-full text-xs" onClick={() => setIsBlocksModalOpen(false)}>Done</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!editingBlockId} onOpenChange={(open) => !open && setEditingBlockId(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Block</DialogTitle>
                    </DialogHeader>
                    {editingBlock && (
                        <div className="p-6 space-y-4">
                            {editingBlock.type === 'text' && (
                                <>
                                    <div className="space-y-1.5">
                                        <Label>Title</Label>
                                        <Input value={editingBlock.title} onChange={(e) => updateBlock(editingBlock.id, { title: e.target.value })} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Content</Label>
                                        <Textarea value={editingBlock.content} onChange={(e) => updateBlock(editingBlock.id, { content: e.target.value })} />
                                    </div>
                                </>
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
                                            {editingBlock.days?.map((day: any, idx: number) => (
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
                                                            <Input type="time" value={day.openTime} onChange={(e) => {
                                                                const newDays = [...editingBlock.days]; newDays[idx] = { ...newDays[idx], openTime: e.target.value }; updateBlock(editingBlock.id, { days: newDays })
                                                            }} />
                                                            <Input type="time" value={day.closeTime} onChange={(e) => {
                                                                const newDays = [...editingBlock.days]; newDays[idx] = { ...newDays[idx], closeTime: e.target.value }; updateBlock(editingBlock.id, { days: newDays })
                                                            }} />
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
                                    <div className="space-y-1.5"><Label className="text-xs font-semibold">Full Name</Label>
                                        <Input value={editingBlock.fullName} onChange={(e) => updateBlock(editingBlock.id, { fullName: e.target.value })} />
                                    </div>
                                    <div className="space-y-1.5"><Label className="text-xs font-semibold">Phone</Label>
                                        <Input value={editingBlock.phone} onChange={(e) => updateBlock(editingBlock.id, { phone: e.target.value })} />
                                    </div>
                                    <div className="space-y-1.5"><Label className="text-xs font-semibold">Email</Label>
                                        <Input value={editingBlock.email} onChange={(e) => updateBlock(editingBlock.id, { email: e.target.value })} />
                                    </div>
                                    <div className="space-y-1.5"><Label className="text-xs font-semibold">Website</Label>
                                        <Input value={editingBlock.website} onChange={(e) => updateBlock(editingBlock.id, { website: e.target.value })} />
                                    </div>
                                </div>
                            )}

                            {editingBlock.type === 'location' && (
                                <div className="space-y-4">
                                    <Tabs value={editingBlock.locationType || 'manual'} onValueChange={(val) => updateBlock(editingBlock.id, { locationType: val })}>
                                        <TabsList className="grid grid-cols-2 bg-zinc-100 p-1 mb-4 h-9">
                                            <TabsTrigger value="manual" className="text-xs">Manual</TabsTrigger>
                                            <TabsTrigger value="url" className="text-xs">Google Maps URL</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="manual" className="space-y-3">
                                            <Input placeholder="Street Address" value={editingBlock.street} onChange={(e) => updateBlock(editingBlock.id, { street: e.target.value })} />
                                            <div className="grid grid-cols-2 gap-2">
                                                <Input placeholder="City" value={editingBlock.city} onChange={(e) => updateBlock(editingBlock.id, { city: e.target.value })} />
                                                <Input placeholder="State" value={editingBlock.state} onChange={(e) => updateBlock(editingBlock.id, { state: e.target.value })} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Input placeholder="Postal Code" value={editingBlock.postalCode} onChange={(e) => updateBlock(editingBlock.id, { postalCode: e.target.value })} />
                                                <Input placeholder="Country" value={editingBlock.country} onChange={(e) => updateBlock(editingBlock.id, { country: e.target.value })} />
                                            </div>
                                        </TabsContent>
                                        <TabsContent value="url">
                                            <div className="space-y-1.5"><Label className="text-xs font-semibold">Google Maps Link</Label>
                                                <Input placeholder="https://maps.google.com/..." value={editingBlock.url} onChange={(e) => updateBlock(editingBlock.id, { url: e.target.value })} />
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </div>
                            )}

                            {editingBlock.type === 'url' && (
                                <div className="space-y-4">
                                    <div className="space-y-1.5"><Label className="text-xs font-semibold">Button Label</Label>
                                        <Input value={editingBlock.label} onChange={(e) => updateBlock(editingBlock.id, { label: e.target.value })} />
                                    </div>
                                    <div className="space-y-1.5"><Label className="text-xs font-semibold">Target URL</Label>
                                        <Input value={editingBlock.url} onChange={(e) => updateBlock(editingBlock.id, { url: e.target.value })} />
                                    </div>
                                </div>
                            )}

                            {editingBlock.type === 'page_link' && (
                                <div className="space-y-4">
                                    <div className="space-y-1.5"><Label className="text-xs font-semibold">Button Label</Label>
                                        <Input value={editingBlock.label} onChange={(e) => updateBlock(editingBlock.id, { label: e.target.value })} />
                                    </div>
                                    <div className="space-y-1.5"><Label className="text-xs font-semibold">Link To Page</Label>
                                        <select value={editingBlock.pageType} onChange={(e) => updateBlock(editingBlock.id, { pageType: e.target.value })} className="w-full h-10 px-3 rounded-md border text-sm">
                                            <option value="profile">Profile</option>
                                            <option value="shop">Shop</option>
                                            <option value="bookings">Bookings</option>
                                            <option value="quote">Quote</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {editingBlock.type === 'facilities' && (
                                <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                                    {['wifi', 'parking', 'cafe', 'restaurant', 'accessible', 'child', 'pet', 'seating'].map((f) => {
                                        const isSelected = editingBlock.selectedFacilities?.includes(f);
                                        return (
                                            <Button key={f} variant={isSelected ? "default" : "outline"} className="justify-between h-auto py-2 px-3 text-[10px]" onClick={() => {
                                                const next = isSelected ? editingBlock.selectedFacilities.filter((id: string) => id !== f) : [...(editingBlock.selectedFacilities || []), f];
                                                updateBlock(editingBlock.id, { selectedFacilities: next })
                                            }}>
                                                {f.charAt(0).toUpperCase() + f.slice(1)} {isSelected && <Check className="w-3 h-3" />}
                                            </Button>
                                        )
                                    })}
                                </div>
                            )}

                            {editingBlock.type === 'about' && (
                                <div className="space-y-4"><Label className="text-xs font-semibold">Summary</Label>
                                    <Textarea value={editingBlock.summary} onChange={(e) => updateBlock(editingBlock.id, { summary: e.target.value })} className="min-h-[120px] resize-none" />
                                </div>
                            )}

                            {editingBlock.type === 'social_networks' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-4 gap-2">
                                        {['facebook', 'instagram', 'twitter', 'linkedin', 'whatsapp', 'youtube', 'github', 'website'].map((p) => {
                                            const isSelected = editingBlock.platforms?.find((pl: any) => pl.name === p);
                                            return (
                                                <button key={p} className={`p-2 border rounded-lg transition-all ${isSelected ? 'border-black bg-zinc-50' : 'border-gray-200'}`} onClick={() => {
                                                    const current = editingBlock.platforms || [];
                                                    const next = isSelected ? current.filter((pl: any) => pl.name !== p) : [...current, { name: p, url: '' }];
                                                    updateBlock(editingBlock.id, { platforms: next })
                                                }}>
                                                    <span className="text-[10px] capitalize">{p.substring(0, 4)}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                    <div className="space-y-2">
                                        {(editingBlock.platforms || []).map((p: any, idx: number) => (
                                            <Input key={p.name} placeholder={`${p.name} URL`} value={p.url} onChange={(e) => {
                                                const next = [...editingBlock.platforms]; next[idx].url = e.target.value; updateBlock(editingBlock.id, { platforms: next })
                                            }} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {editingBlock.type === 'services' && (
                                <div className="space-y-4">
                                    <div className="space-y-1.5"><Label className="text-xs font-semibold">Title</Label>
                                        <Input value={editingBlock.title} onChange={(e) => updateBlock(editingBlock.id, { title: e.target.value })} />
                                    </div>
                                    <div className="space-y-1.5"><Label className="text-xs font-semibold">Description</Label>
                                        <Textarea value={editingBlock.description} onChange={(e) => updateBlock(editingBlock.id, { description: e.target.value })} />
                                    </div>
                                </div>
                            )}

                            {editingBlock.type === 'products' && (
                                <div className="space-y-4">
                                    <div className="space-y-1.5"><Label className="text-xs font-semibold">Title</Label>
                                        <Input value={editingBlock.title} onChange={(e) => updateBlock(editingBlock.id, { title: e.target.value })} />
                                    </div>
                                    <div className="space-y-1.5"><Label className="text-xs font-semibold">Description</Label>
                                        <Textarea value={editingBlock.description} onChange={(e) => updateBlock(editingBlock.id, { description: e.target.value })} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setEditingBlockId(null)}>Done</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
