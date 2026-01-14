"use client"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"

import { useRouter } from "next/navigation"
import { Loader2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

export default function ProfilePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [user, setUser] = useState({
        name: "",
        email: "",
        jobTitle: "",
        bio: "",
        website: "",
        image: ""
    })

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/profile")
            if (res.ok) {
                const data = await res.json()
                setUser({
                    name: data.name || "",
                    email: data.email || "",
                    jobTitle: data.jobTitle || "",
                    bio: data.bio || "",
                    website: data.website || "",
                    image: data.image || ""
                })
            }
        } catch (error) {
            console.error("Failed to fetch profile", error)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target
        setUser(prev => ({ ...prev, [id]: value }))
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(user)
            })
            if (res.ok) {
                toast.success("Profile updated successfully")
            } else {
                toast.error("Failed to update profile")
            }
        } catch (error) {
            console.error(error)
            toast.error("An unexpected error occurred")
        } finally {
            setSaving(false)
        }
    }

    // Schema.org JSON-LD
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        "dateCreated": "2024-01-01T12:00:00Z",
        "dateModified": new Date().toISOString(),
        "mainEntity": {
            "@type": "Person",
            "name": user.name,
            "email": user.email,
            "jobTitle": user.jobTitle,
            "description": user.bio,
            "url": user.website,
            "image": user.image,
        }
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10 px-4 max-w-2xl">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="mb-8">
                <Button
                    variant="ghost"
                    className="mb-4 pl-0 hover:bg-transparent hover:text-muted-foreground"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
                        <p className="text-muted-foreground">Manage your personal account details.</p>
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Public Profile</CardTitle>
                    <CardDescription>
                        This information will be displayed publicly on your profile page.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" value={user.name} onChange={handleChange} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={user.email} disabled className="bg-muted" />
                        <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="jobTitle">Job Title</Label>
                        <Input id="jobTitle" value={user.jobTitle} onChange={handleChange} placeholder="e.g. Software Engineer" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="website">Website</Label>
                        <Input id="website" type="url" value={user.website} onChange={handleChange} placeholder="https://your-website.com" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea id="bio" value={user.bio} onChange={handleChange} placeholder="Tell us a little about yourself" />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button onClick={handleSave} disabled={saving} className="bg-black text-white hover:bg-black/90">
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </CardFooter>
            </Card>


        </div>
    )
}
