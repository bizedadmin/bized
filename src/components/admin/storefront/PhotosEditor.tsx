"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Check, Loader2, Image as ImageIcon, Camera, Edit2 } from "lucide-react";
import { useBusiness } from "@/contexts/BusinessContext";
import { ImageEditor } from "@/components/ui/ImageEditor";

const uid = () => Math.random().toString(36).substring(2, 10);

export function PhotosEditor() {
    const { currentBusiness, isLoading, updateBusiness } = useBusiness();
    const [photos, setPhotos] = useState<{ id: string, url: string }[]>([]);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [editingPhoto, setEditingPhoto] = useState<{ id: string, url: string } | null>(null);
    const [uploadingId, setUploadingId] = useState<string | null>(null);

    useEffect(() => {
        if (currentBusiness) {
            // Note: gallery might not be in Business type yet, so we'll handle it dynamically or use photos if merged
            const gallery = (currentBusiness as any).gallery || [];
            setPhotos(gallery);
        }
    }, [currentBusiness]);

    const handleUpdatePhoto = (id: string, url: string) => {
        setPhotos(prev => prev.map(p => p.id === id ? { ...p, url } : p));
    };

    const handleUploadEditedPhoto = async (id: string, dataUrl: string) => {
        if (!currentBusiness?.slug) return;
        setUploadingId(id);

        try {
            const blob = await (await fetch(dataUrl)).blob();
            const uploadFormData = new FormData();
            uploadFormData.append("file", blob, "gallery-image.webp");
            uploadFormData.append("slug", currentBusiness.slug);

            const res = await fetch("/api/upload/product", { // Reuse product upload for unique gallery images
                method: "POST",
                body: uploadFormData,
            });

            if (!res.ok) throw new Error("Upload failed");
            const { url } = await res.json();
            handleUpdatePhoto(id, url);
        } catch (err) {
            console.error("Upload error:", err);
            alert("Failed to upload image. Please try again.");
        } finally {
            setUploadingId(null);
        }
    };

    const handleRemovePhoto = (id: string) => {
        setPhotos(prev => prev.filter(p => p.id !== id));
    };

    const handleAddPhoto = () => {
        setPhotos(prev => [...prev, { id: uid(), url: "" }]);
    };

    const handleSave = async () => {
        setSaving(true);
        const ok = await updateBusiness({ gallery: photos } as any);
        setSaving(false);
        if (ok) {
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }
    };

    if (isLoading) return <div className="space-y-4">{[...Array(6)].map((_, i) => <div key={i} className="aspect-square rounded-2xl bg-[var(--color-surface-container-low)] animate-pulse" />)}</div>;

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="mb-8 px-4 flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-[var(--color-on-surface)]">Photo Gallery</h2>
                    <p className="text-[var(--color-on-surface-variant)] opacity-70">Showcase your work and business environment.</p>
                </div>
                <button
                    onClick={handleAddPhoto}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-[var(--color-on-primary)] font-bold text-sm shadow-lg shadow-[var(--color-primary)]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <Plus size={18} /> Add Photo
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4">
                {photos.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-[var(--color-surface)] border-2 border-dashed border-[var(--color-outline-variant)]/20 rounded-2xl">
                        <ImageIcon size={48} className="mx-auto mb-4 opacity-10" />
                        <p className="text-[var(--color-on-surface-variant)] opacity-50">No photos yet. Click "Add Photo" to start.</p>
                    </div>
                ) : (
                    photos.map((photo) => (
                        <div key={photo.id} className="relative group rounded-2xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 p-4 hover:border-[var(--color-primary)]/30 transition-all">
                            <button
                                onClick={() => setEditingPhoto(photo)}
                                className="absolute top-6 left-6 z-10 text-[var(--color-primary)] bg-white/80 backdrop-blur-sm p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-[var(--color-primary)]/5"
                            >
                                <Edit2 size={16} />
                            </button>

                            <button
                                onClick={() => handleRemovePhoto(photo.id)}
                                className="absolute top-6 right-6 z-10 text-red-500 bg-white/80 backdrop-blur-sm p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-50"
                            >
                                <Trash2 size={16} />
                            </button>

                            <div className="space-y-4">
                                <div className="aspect-video w-full rounded-xl bg-[var(--color-surface-container-low)] overflow-hidden flex items-center justify-center border border-[var(--color-outline-variant)]/10 relative">
                                    {uploadingId === photo.id ? (
                                        <Loader2 size={32} className="animate-spin text-[var(--color-primary)] opacity-50" />
                                    ) : photo.url ? (
                                        <img src={photo.url} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <Camera size={24} className="opacity-10" />
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold opacity-40 uppercase tracking-wider">Image URL</label>
                                    <input
                                        className="w-full h-11 px-4 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none text-sm transition-all"
                                        placeholder="https://images.unsplash.com/..."
                                        value={photo.url}
                                        onChange={e => handleUpdatePhoto(photo.id, e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {photos.length > 0 && (
                <div className="mt-12 px-4 sticky bottom-8">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`w-full h-14 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl ${saved ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-[var(--color-primary)]/30"} disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]`}
                    >
                        {saving ? <><Loader2 size={20} className="animate-spin" /> Saving Photos...</> : saved ? <><Check size={20} /> Gallery Saved</> : <><Check size={20} /> Save Gallery Changes</>}
                    </button>
                </div>
            )}

            {editingPhoto && (
                <ImageEditor
                    imageUrl={editingPhoto.url}
                    onClose={() => setEditingPhoto(null)}
                    onSave={(newUrl) => {
                        handleUploadEditedPhoto(editingPhoto.id, newUrl);
                        setEditingPhoto(null);
                    }}
                    targetLayout="free"
                />
            )}
        </div>
    );
}
