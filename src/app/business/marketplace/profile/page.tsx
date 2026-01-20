"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardTitle, CardHeader, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Image as ImageIcon, Upload, Building2, Info, ChevronRight, Save, LayoutGrid, X, Pencil } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { ImageEditorModal } from "@/components/ui/image-editor-modal"

// File Uploader Component
const FileUploader = ({ label, onUpload, currentImage, businessId, type }: { label: string, onUpload: (url: string) => void, currentImage?: string, businessId: string | null, type: "logo" | "cover" }) => {
    const [uploading, setUploading] = useState(false)
    const [editorOpen, setEditorOpen] = useState(false)
    const [selectedImage, setSelectedImage] = useState<string>("")

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Read file as data URL for the editor
        const reader = new FileReader()
        reader.onload = (event) => {
            if (event.target?.result) {
                setSelectedImage(event.target.result as string)
                setEditorOpen(true)
            }
        }
        reader.readAsDataURL(file)

        // Reset input value to allow selecting the same file again
        e.target.value = ""
    }

    const handleEditorSave = async (editedDataUrl: string) => {
        if (!businessId) {
            toast.error("Business ID missing. Cannot upload.")
            return
        }

        setUploading(true)
        try {
            // Convert Data URL to Blob
            const response = await fetch(editedDataUrl)
            const blob = await response.blob()
            const file = new File([blob], "image.webp", { type: "image/webp" })

            const formData = new FormData()
            formData.append("file", file)
            formData.append("businessId", businessId)

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            })

            if (!res.ok) throw new Error("Upload failed")

            const data = await res.json()
            onUpload(data.url)
            toast.success("Image uploaded successfully")
        } catch (error) {
            console.error("Upload error:", error)
            toast.error("Failed to upload image")
        } finally {
            setUploading(false)
            // editorOpen is handled by onClose prop in ImageEditorModal which is called after save
        }
    }

    return (
        <>
            <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">{label}</Label>

                {!currentImage ? (
                    <div className="border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-6 bg-zinc-50 dark:bg-zinc-900/50 text-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors relative group">
                        <div className="flex flex-col items-center gap-2 py-4">
                            <div className="p-3 bg-white dark:bg-zinc-800 rounded-full shadow-sm">
                                {uploading ? <Loader2 className="w-5 h-5 text-blue-500 animate-spin" /> : <Upload className="w-5 h-5 text-zinc-400" />}
                            </div>
                            <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                                {uploading ? "Uploading..." : "Click to select image"}
                            </div>
                            <div className="text-xs text-zinc-400">Max file size 5MB</div>
                            <Input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                accept="image/*"
                                disabled={uploading}
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="relative group rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
                        <div className={cn("relative overflow-hidden", type === "cover" ? "aspect-[21/9]" : "aspect-square w-32 mx-auto mt-4 rounded-lg border")}>
                            <img src={currentImage} alt="Preview" className="w-full h-full object-cover" />
                        </div>

                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => {
                                    setSelectedImage(currentImage)
                                    setEditorOpen(true)
                                }}
                                className="p-2 bg-white dark:bg-zinc-800 rounded-md shadow-sm hover:bg-gray-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                                title="Edit Image"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                            <label className="p-2 bg-white dark:bg-zinc-800 rounded-md shadow-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700" title="Replace Image">
                                <Upload className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                            </label>
                            <button
                                onClick={() => onUpload("")}
                                className="p-2 bg-white dark:bg-zinc-800 rounded-md shadow-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                                title="Remove Image"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        {uploading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Loader2 className="w-6 h-6 text-white animate-spin" />
                            </div>
                        )}
                    </div>
                )}
            </div>

            <ImageEditorModal
                isOpen={editorOpen}
                onClose={() => setEditorOpen(false)}
                imageUrl={selectedImage}
                onSave={handleEditorSave}
                businessId={businessId || undefined}
            />
        </>
    )
}

export default function MarketplaceProfilePage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [businessId, setBusinessId] = useState<string | null>(null)
    const [activeSection, setActiveSection] = useState("branding")
    const [formData, setFormData] = useState({
        logo: "",
        coverImage: "",
        description: "" // Maps to 'description' in DB
    })
    const [originalData, setOriginalData] = useState<any>(null)

    // Similar navigation structure to Settings page
    const navItems = [
        { id: "branding", label: "Brand Assets", icon: ImageIcon },
        { id: "about", label: "About Business", icon: Info },
    ]

    useEffect(() => {
        const fetchBusiness = async () => {
            try {
                const res = await fetch("/api/businesses")
                if (!res.ok) throw new Error("Failed to fetch business")
                const businesses = await res.json()
                if (businesses && businesses.length > 0) {
                    const biz = businesses[0]
                    setBusinessId(biz._id)
                    const data = {
                        logo: biz.logo || "",
                        coverImage: biz.image || "", // 'image' in DB is often used as cover
                        description: biz.description || ""
                    }
                    setFormData(data)
                    setOriginalData(data)
                }
            } catch (error) {
                console.error("Failed to load business", error)
                toast.error("Failed to load business data")
            } finally {
                setLoading(false)
            }
        }
        fetchBusiness()
    }, [])

    const handleSave = async () => {
        if (!businessId) return

        setSaving(true)
        try {
            const payload = {
                logo: formData.logo,
                image: formData.coverImage,
                description: formData.description,
                isDraft: false // Ensure business is published when profile is saved
            }

            const res = await fetch(`/api/businesses/${businessId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            if (!res.ok) throw new Error("Failed to update profile")

            setOriginalData(formData)
            toast.success("Marketplace profile updated successfully")
        } catch (error) {
            console.error("Error saving profile:", error)
            toast.error("Failed to save changes")
        } finally {
            setSaving(false)
        }
    }

    const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData)

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section matching Settings Page */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Listing Profile
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Manage your business appearance on the marketplace.
                    </p>
                </div>
                <Button onClick={handleSave} disabled={saving || !hasChanges}>
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Vertical Tabs Sidebar */}
                <aside className="w-full md:w-56 shrink-0 flex md:flex-col overflow-x-auto md:overflow-visible pb-2 md:pb-0 gap-2 no-scrollbar">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                                activeSection === item.id
                                    ? "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white"
                                    : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white",
                                "w-auto md:w-full justify-start"
                            )}
                        >
                            <item.icon className="w-4 h-4 shrink-0" />
                            <span>{item.label}</span>
                            {activeSection === item.id && <ChevronRight className="w-4 h-4 ml-auto hidden md:block text-gray-400" />}
                        </button>
                    ))}
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 w-full min-w-0 space-y-6">

                    {activeSection === "branding" && (
                        <div className="space-y-6">
                            <Card className="border-gray-200 dark:border-zinc-800">
                                <CardHeader>
                                    <CardTitle className="text-lg">Brand Assets</CardTitle>
                                    <CardDescription>Upload your logo and cover image to make your profile stand out.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Preview Area */}
                                    <div className="rounded-lg border bg-zinc-50 dark:bg-zinc-900 overflow-hidden relative mb-8">
                                        <div className="relative aspect-[21/9] bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center group overflow-hidden">
                                            {formData.coverImage ? (
                                                <img src={formData.coverImage} alt="Cover" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex flex-col items-center gap-2 text-zinc-400">
                                                    <ImageIcon className="w-8 h-8" />
                                                    <span className="text-xs font-semibold uppercase tracking-wider">Cover Image</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute -bottom-8 left-6">
                                            <div className="w-24 h-24 rounded-xl border-4 border-white dark:border-zinc-950 bg-white dark:bg-zinc-900 shadow-md overflow-hidden flex items-center justify-center relative">
                                                {formData.logo ? (
                                                    <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Building2 className="w-8 h-8 text-zinc-300" />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6 pt-6">
                                        <FileUploader
                                            label="Cover Image"
                                            currentImage={formData.coverImage}
                                            onUpload={(url) => setFormData(prev => ({ ...prev, coverImage: url }))}
                                            businessId={businessId}
                                            type="cover"
                                        />
                                        <FileUploader
                                            label="Logo"
                                            currentImage={formData.logo}
                                            onUpload={(url) => setFormData(prev => ({ ...prev, logo: url }))}
                                            businessId={businessId}
                                            type="logo"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeSection === "about" && (
                        <div className="space-y-6">
                            <Card className="border-gray-200 dark:border-zinc-800">
                                <CardHeader>
                                    <CardTitle className="text-lg">About Business</CardTitle>
                                    <CardDescription>Tell customers about your business using a compelling description.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Marketplace Bio</Label>
                                        <Textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Write a description..."
                                            className="min-h-[200px]"
                                        />
                                        <div className="text-xs text-right text-gray-500">
                                            {formData.description.length} / 500 characters
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
