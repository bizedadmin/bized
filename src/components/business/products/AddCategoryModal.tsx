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
            <DialogContent className="max-w-md p-0 overflow-hidden border-none bg-background">
                <DialogHeader className="px-6 py-4 border-b border-border">
                    <DialogTitle className="text-lg font-semibold">New Category</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category Name*</Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-10 text-sm"
                            placeholder="e.g. Summer Collection"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description (Optional)</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="min-h-[80px] text-sm resize-none"
                            placeholder="Briefly describe this category..."
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
                        <Button type="button" variant="ghost" onClick={handleClose} className="h-10 px-6 text-sm">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !name}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-10 text-sm font-semibold shadow-md transition-all active:scale-95"
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
