"use client"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Star,
    MessageSquareReply,
    Share2,
    MoreVertical,
    Info,
    ChevronDown,
    X,
    Copy,
    Mail,
    Facebook,
    Smartphone,
    ArrowLeft
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const MOCK_REVIEWS = [
    {
        id: "1",
        author: "Shuguli Writers",
        avatar: "/avatar-placeholder.png",
        rating: 5,
        date: "3 Mar 2024",
        content: "",
        stats: "15 reviews • 0 photos",
        replied: false
    }
]

type SubView = "list" | "get-more"

export default function ReviewsView({ bizData, onBack }: { bizData: any, onBack: () => void }) {
    const [subView, setSubView] = useState<SubView>("list")
    const [filter, setFilter] = useState("All")

    if (subView === "get-more") {
        return <GetMoreReviews onBack={() => setSubView("list")} bizData={bizData} />
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
            {/* Header / Summary */}
            <div className="flex items-start justify-between">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="text-4xl font-medium text-gray-900 dark:text-gray-100">5.0</span>
                        <div className="flex text-yellow-400">
                            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 fill-current" />)}
                        </div>
                        <span className="text-gray-500 text-sm font-medium">(1 review)</span>
                        <Info className="w-4 h-4 text-gray-400 cursor-pointer" />
                    </div>

                    <div className="flex gap-3">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-semibold">
                            <MessageSquareReply className="w-4 h-4 mr-2" />
                            Reply to reviews
                        </Button>
                        <Button
                            variant="outline"
                            className="text-blue-600 border-gray-200 dark:border-zinc-800 rounded-lg px-4 py-2 font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/10"
                            onClick={() => setSubView("get-more")}
                        >
                            <Share2 className="w-4 h-4 mr-2" />
                            Get more reviews
                        </Button>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="text-gray-400">
                        <MoreVertical className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-zinc-800 mt-8">
                <div className="flex gap-8">
                    {["All", "Replied", "Unreplied"].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={cn(
                                "pb-3 text-sm font-bold transition-all relative",
                                filter === tab
                                    ? "text-blue-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600"
                                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm cursor-pointer mt-4 hover:opacity-80">
                <div className="flex flex-col gap-0.5 w-4">
                    <div className="h-0.5 w-full bg-current rounded-full" />
                    <div className="h-0.5 w-5/6 bg-current rounded-full" />
                    <div className="h-0.5 w-2/3 bg-current rounded-full" />
                </div>
                Newest
            </div>

            {/* Review List */}
            <div className="space-y-8 mt-6">
                {MOCK_REVIEWS.map(review => (
                    <div key={review.id} className="group">
                        <div className="flex justify-between items-start">
                            <div className="flex gap-4">
                                <Avatar className="h-10 w-10 border border-gray-100">
                                    <AvatarImage src={review.avatar} />
                                    <AvatarFallback>{review.author[0]}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-0.5">
                                    <h4 className="font-bold text-blue-600 text-sm hover:underline cursor-pointer">{review.author}</h4>
                                    <p className="text-xs text-gray-500">{review.stats}</p>

                                    <div className="flex items-center gap-2 mt-3">
                                        <div className="flex text-yellow-400">
                                            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                                        </div>
                                        <span className="text-xs text-gray-500">{review.date}</span>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        className="text-blue-600 font-bold text-sm h-auto p-0 mt-4 flex items-center gap-2 hover:bg-transparent hover:text-blue-700"
                                    >
                                        <MessageSquareReply className="w-4 h-4" />
                                        Reply
                                    </Button>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Info className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function GetMoreReviews({ onBack, bizData }: { onBack: () => void, bizData: any }) {
    const reviewLink = `https://g.page/r/${bizData.id || "CYMAyNi8nX_IEBM"}/review`

    const copyToClipboard = () => {
        navigator.clipboard.writeText(reviewLink)
        toast.success("Link copied to clipboard")
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={onBack} className="text-gray-500">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="text-gray-400">
                        <MoreVertical className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onBack} className="text-gray-400">
                        <X className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Give customers a link to review your business on Google
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-lg">
                    Reviews build trust and help your Business Profile stand out to customers on Search and Maps
                </p>
            </div>

            <div className="flex flex-wrap gap-3">
                <ShareButton icon={<Mail className="w-4 h-4 text-gray-600" />} label="Email" />
                <ShareButton icon={<Smartphone className="w-4 h-4 text-green-600" />} label="WhatsApp" />
                <ShareButton icon={<Facebook className="w-4 h-4 text-blue-600" />} label="Facebook" />
            </div>

            <div className="space-y-4 pt-4">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Review link</span>
                        <div className="h-px flex-1 bg-gray-100 dark:bg-zinc-800" />
                    </div>
                    <div className="flex items-center gap-2 p-3 border border-gray-200 dark:border-zinc-800 rounded-lg bg-gray-50/50 dark:bg-zinc-900/50">
                        <span className="text-sm text-gray-600 dark:text-gray-300 truncate flex-1">
                            {reviewLink}
                        </span>
                        <Button size="icon" variant="ghost" onClick={copyToClipboard} className="text-gray-400 hover:text-blue-600">
                            <Copy className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div className="space-y-4 pt-6">
                    <h3 className="text-lg font-bold">Share your reviews QR code</h3>
                    <p className="text-sm text-gray-500">
                        Right-click and select 'Save image as...' so you can share your QR code with customers
                    </p>
                    <div className="w-44 h-44 bg-white p-4 border border-gray-200 rounded-xl shadow-sm">
                        {/* Static QR for UI demonstration */}
                        <img
                            src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://bized.app"
                            alt="QR Code"
                            className="w-full h-full"
                        />
                    </div>
                </div>
            </div>

            <p className="text-sm pt-4">
                <button className="text-blue-600 hover:underline font-medium">Learn more</button>
                <span className="text-gray-500 ml-1">about best practices for asking for reviews, and what to do about negative reviews</span>
            </p>
        </div>
    )
}

function ShareButton({ icon, label }: { icon: React.ReactNode, label: string }) {
    return (
        <Button
            variant="outline"
            className="rounded-full border-gray-200 dark:border-zinc-800 h-10 px-5 font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50"
        >
            {icon}
            <span className="ml-2 font-black">{label}</span>
        </Button>
    )
}
