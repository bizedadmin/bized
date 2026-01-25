"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function LeadCapture() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return

        setLoading(true)
        // Simulate API call
        try {
            // In a real implementation: await fetch('/api/leads', { method: 'POST', body: JSON.stringify({ email }) })
            await new Promise(resolve => setTimeout(resolve, 1500))
            setSuccess(true)
            toast.success("You're on the list!", {
                description: "We'll notify you when early access opens."
            })
        } catch (error) {
            toast.error("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-900/50 animate-in fade-in zoom-in duration-300">
                <CheckCircle2 className="w-6 h-6" />
                <div>
                    <h3 className="text-xl font-bold mb-2">You&apos;re on the list!</h3>
                    <p className="text-sm opacity-90">Keep an eye on your inbox.</p>
                </div>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
            <Input
                type="email"
                placeholder="Enter your email"
                className="h-12 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
            />
            <Button
                type="submit"
                disabled={loading}
                className="h-12 px-6 font-bold bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Join Waitlist"}
                {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
        </form>
    )
}
