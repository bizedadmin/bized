"use client"

import { useState } from "react"
import {
    X,
    Loader2
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface AddCategoryModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: (category: any) => void
    businessId: string
}

export function AddCategoryModal({ isOpen, onClose, onSuccess, businessId }: AddCategoryModalProps) {
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name) return

        setLoading(true)
        setError("")

        try {
            const res = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    business: businessId,
                    name,
                    description,
                })
            })

            const data = await res.json()

            if (res.ok) {
                onSuccess(data)
                handleClose()
            } else {
                setError(data.message || "Failed to create category")
            }
        } catch (error) {
            console.error("Error creating category:", error)
            setError("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setName("")
        setDescription("")
        setError("")
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-md p-0 overflow-hidden rounded-xl border border-[#CDD0DB] shadow-xl font-noto-sans bg-white">
                <DialogHeader className="px-6 py-4 border-b border-[#CDD0DB] bg-white">
                    <DialogTitle className="text-[18px] font-medium leading-[26px] text-[#0A0909] font-rubik">New Category</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-[#3F3E3E] font-noto-sans">Category Name*</Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-10 text-sm border-[#CDD0DB] rounded-lg"
                            placeholder="e.g. Summer Collection"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-[#3F3E3E] font-noto-sans">Description (Optional)</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="min-h-[80px] text-sm resize-none border-[#CDD0DB] rounded-lg"
                            placeholder="Briefly describe this category..."
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#CDD0DB]">
                        <Button type="button" variant="ghost" onClick={handleClose} className="h-10 px-6 text-[12px] font-medium">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !name}
                            className="bg-black hover:bg-zinc-800 text-white px-8 h-10 text-[12px] font-medium rounded-lg shadow-sm transition-all active:scale-95"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                            Create Category
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
