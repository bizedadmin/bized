"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
    User,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    Save,
    RefreshCw,
    X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface CustomerFormProps {
    initialData?: any
    isEditing?: boolean
    onSuccess?: () => void
    onCancel?: () => void
}

export function CustomerForm({ initialData, isEditing = false, onSuccess, onCancel }: CustomerFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        givenName: initialData?.givenName || "",
        familyName: initialData?.familyName || "",
        name: initialData?.name || "",
        email: initialData?.email || "",
        telephone: initialData?.telephone || "",
        jobTitle: initialData?.jobTitle || "",
        category: initialData?.category || "",
        notes: initialData?.notes || "",
        address: initialData?.address || {
            streetAddress: "",
            addressLocality: "",
            addressRegion: "",
            postalCode: "",
            addressCountry: "Kenya",
        }
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Ensure full name is set if not provided
        const name = formData.name || `${formData.givenName} ${formData.familyName}`.trim()
        const payload = { ...formData, name }

        try {
            const url = isEditing ? `/api/business/customers/${initialData._id}` : '/api/business/customers'
            const method = isEditing ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                toast.success(`Customer ${isEditing ? 'updated' : 'created'} successfully`)
                if (onSuccess) onSuccess()
                else router.push('/business/customers')
            } else {
                const error = await res.json()
                toast.error(error.error || "Failed to save customer")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            Personal Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="givenName">Given Name</Label>
                                <Input
                                    id="givenName"
                                    placeholder="John"
                                    value={formData.givenName}
                                    onChange={(e) => setFormData({ ...formData, givenName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="familyName">Family Name</Label>
                                <Input
                                    id="familyName"
                                    placeholder="Doe"
                                    value={formData.familyName}
                                    onChange={(e) => setFormData({ ...formData, familyName: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="john.doe@example.com"
                                    className="pl-9"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="telephone">Phone Number</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="telephone"
                                    placeholder="+254 700 000000"
                                    className="pl-9"
                                    value={formData.telephone}
                                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="jobTitle">Job Title</Label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="jobTitle"
                                    placeholder="Software Engineer"
                                    className="pl-9"
                                    value={formData.jobTitle}
                                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            Address
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="streetAddress">Street Address</Label>
                            <Input
                                id="streetAddress"
                                placeholder="123 Business St"
                                value={formData.address.streetAddress}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    address: { ...formData.address, streetAddress: e.target.value }
                                })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="addressLocality">City</Label>
                                <Input
                                    id="addressLocality"
                                    placeholder="Nairobi"
                                    value={formData.address.addressLocality}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        address: { ...formData.address, addressLocality: e.target.value }
                                    })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="addressRegion">State/Region</Label>
                                <Input
                                    id="addressRegion"
                                    placeholder="Nairobi"
                                    value={formData.address.addressRegion}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        address: { ...formData.address, addressRegion: e.target.value }
                                    })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="postalCode">Postal Code</Label>
                                <Input
                                    id="postalCode"
                                    placeholder="00100"
                                    value={formData.address.postalCode}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        address: { ...formData.address, postalCode: e.target.value }
                                    })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="addressCountry">Country</Label>
                                <Input
                                    id="addressCountry"
                                    placeholder="Kenya"
                                    value={formData.address.addressCountry}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        address: { ...formData.address, addressCountry: e.target.value }
                                    })}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Additional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="category">Category/Segment</Label>
                        <Input
                            id="category"
                            placeholder="VIP, Regular, Corporate"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            placeholder="Add any internal notes about this customer..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex items-center justify-end gap-3 pt-4">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
                <Button type="submit" className="gap-2" disabled={loading}>
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {isEditing ? 'Update Customer' : 'Add Customer'}
                </Button>
            </div>
        </form>
    )
}
