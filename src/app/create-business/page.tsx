"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
    Tractor,
    Hammer,
    BookOpen,
    Zap,
    CircleDollarSign,
    UtensilsCrossed,
    Shirt,
    PaintRoller,
    Gem,
    Stethoscope,
    ShoppingBasket,
    Truck,
    LayoutGrid,
    Store,
    Factory,
    Wrench,
    Handshake,
    ArrowLeft,
    Loader2,
    Wand2,
    Check,
    ChevronRight,
    Mail,
    Globe,
    User,
    Phone
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useTheme } from "next-themes"
import { useSession } from "next-auth/react"
import { CountrySelector } from "@/components/create-business/country-selector"
import { COUNTRIES } from "@/lib/countries"

const CATEGORIES = [
    { id: 'Agriculture', name: 'Agriculture', icon: Tractor, color: 'text-green-600', bgColor: 'bg-green-50' },
    { id: 'Construction', name: 'Construction', icon: Hammer, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { id: 'Education', name: 'Education', icon: BookOpen, color: 'text-sky-600', bgColor: 'bg-sky-50' },
    { id: 'Electronics', name: 'Electronics', icon: Zap, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    { id: 'Financial Services', name: 'Financial Services', icon: CircleDollarSign, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    { id: 'Food/Restaurant', name: 'Food/Restaurant', icon: UtensilsCrossed, color: 'text-red-600', bgColor: 'bg-red-50' },
    { id: 'Clothes/Fashion', name: 'Clothes/Fashion', icon: Shirt, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
    { id: 'Hardware', name: 'Hardware', icon: PaintRoller, color: 'text-teal-600', bgColor: 'bg-teal-50' },
    { id: 'Jewellery', name: 'Jewellery', icon: Gem, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { id: 'Healthcare & Fitness', name: 'Healthcare & Fitness', icon: Stethoscope, color: 'text-rose-600', bgColor: 'bg-rose-50' },
    { id: 'Kirana/Grocery', name: 'Kirana/Grocery', icon: ShoppingBasket, color: 'text-green-700', bgColor: 'bg-green-100' },
    { id: 'Transport', name: 'Transport', icon: Truck, color: 'text-blue-700', bgColor: 'bg-blue-100' },
    { id: 'Other', name: 'Other', icon: LayoutGrid, color: 'text-gray-600', bgColor: 'bg-gray-100' },
]

const BUSINESS_TYPES = [
    { id: 'Retailer', name: 'Retailer', description: 'Sell directly to consumers', icon: Store },
    { id: 'Distributor', name: 'Distributor', description: 'Supply goods to other businesses', icon: Truck },
    { id: 'Manufacturer', name: 'Manufacturer', description: 'Produce goods from raw materials', icon: Factory },
    { id: 'Service Provider', name: 'Service Provider', description: 'Offer specialized services', icon: Wrench },
    { id: 'Trader', name: 'Trader', description: 'Buy and sell goods', icon: Handshake },
]

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
};

export default function CreateBusinessPage() {
    const router = useRouter()
    const { theme, resolvedTheme } = useTheme()
    const { data: session } = useSession()
    const [mounted, setMounted] = useState(false)
    const [step, setStep] = useState(1)
    const [creating, setCreating] = useState(false)

    // Form state
    const [name, setName] = useState("")
    const [slug, setSlug] = useState("")
    const [email, setEmail] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("")
    const [selectedBusinessType, setSelectedBusinessType] = useState("")
    const [phoneCode, setPhoneCode] = useState("+254")
    const [phoneNumber, setPhoneNumber] = useState("")

    // Validation state
    const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
    const [isCheckingSlug, setIsCheckingSlug] = useState(false)
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false)

    useEffect(() => {
        setMounted(true)

        // Automatic Geo-Location Detection
        const detectCountry = async () => {
            try {
                const res = await fetch('http://ip-api.com/json/')
                if (res.ok) {
                    const data = await res.json()
                    const country = COUNTRIES.find(c => c.code === data.countryCode)
                    if (country) {
                        setPhoneCode(country.dialCode)
                    }
                }
            } catch (error) {
                console.error("Geo-detection failed:", error)
            }
        }
        detectCountry()
    }, [])

    // Check slug availability
    useEffect(() => {
        const checkSlug = async () => {
            if (!slug) {
                setSlugAvailable(null)
                return
            }
            if (slug.length < 3) return

            setIsCheckingSlug(true)
            try {
                const res = await fetch(`/api/businesses/check-slug?slug=${slug}`)
                const result = await res.json()
                setSlugAvailable(result.available)
            } catch (error) {
                console.error("Failed to check slug", error)
            } finally {
                setIsCheckingSlug(false)
            }
        }

        const timeoutId = setTimeout(checkSlug, 500)
        return () => clearTimeout(timeoutId)
    }, [slug])

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value
        setName(newName)
        if (!isSlugManuallyEdited) {
            setSlug(newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''))
        }
    }

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ''))
        setIsSlugManuallyEdited(true)
    }

    const shortenSlug = async () => {
        if (!name) return

        setIsCheckingSlug(true)
        const cleanName = name.toLowerCase().replace(/[^a-z0-9\s]/g, '')
        const words = cleanName.split(/\s+/).filter(Boolean)

        if (words.length === 0) {
            setIsCheckingSlug(false)
            return
        }

        const candidates: string[] = []
        candidates.push(words[0])

        if (words.length > 1) {
            let current = words[0]
            for (let i = 1; i < words.length; i++) {
                current += words[i][0]
                candidates.push(current)
            }
        }

        let found = false
        for (const candidate of candidates) {
            try {
                const res = await fetch(`/api/businesses/check-slug?slug=${candidate}`)
                const result = await res.json()
                if (result.available) {
                    setSlug(candidate)
                    setIsSlugManuallyEdited(true)
                    found = true
                    break
                }
            } catch {
                console.error("Check failed for candidate:", candidate)
            }
        }

        if (!found) {
            setSlug(candidates[candidates.length - 1])
            setIsSlugManuallyEdited(true)
        }

        setIsCheckingSlug(false)
    }

    const nextStep = () => {
        if (step === 1 && (!name || !slug || !email || slugAvailable === false)) {
            toast.error("Please fill in all fields correctly")
            return
        }
        if (step === 2 && !selectedCategory) {
            toast.error("Please select a business category")
            return
        }
        if (step === 3 && !selectedBusinessType) {
            toast.error("Please select a business type")
            return
        }
        if (step < 4) setStep(step + 1)
    }

    const prevStep = () => {
        if (step > 1) setStep(step - 1)
    }

    const handleCreateBusiness = async () => {
        if (!phoneNumber) {
            toast.error("Please provide a phone number")
            return
        }

        setCreating(true)
        try {
            const res = await fetch("/api/businesses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    slug,
                    email,
                    businessCategories: [selectedCategory],
                    industry: selectedCategory,
                    businessType: selectedBusinessType,
                    phone: {
                        code: phoneCode,
                        number: phoneNumber,
                    },
                    telephone: `${phoneCode}${phoneNumber}`,
                    setupCompleted: false,
                    isDraft: false,
                    setupStep: 1,
                })
            })

            if (res.ok) {
                const business = await res.json()

                // Store in localStorage so the dashboard and design pages can load data immediately
                localStorage.setItem("selectedBusiness", JSON.stringify(business))

                toast.success("Business created successfully!")
                router.push(`/business/dashboard?businessId=${business._id}`)
            } else {
                const error = await res.json()
                toast.error(error.message || "Failed to create business")
            }
        } catch (error) {
            console.error("Error creating business:", error)
            toast.error("An unexpected error occurred")
        } finally {
            setCreating(false)
        }
    }

    const logoSrc = mounted && (theme === "dark" || resolvedTheme === "dark") ? "/logo-dark-mode.png" : "/logo-light-mode.png";

    return (
        <div className="min-h-screen bg-background font-sans text-foreground overflow-x-hidden flex flex-col relative">
            {/* GLOBAL GRID BACKGROUND */}
            <div className="fixed inset-0 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" />
            <div className="fixed inset-0 h-full w-full bg-[radial-gradient(circle_800px_at_50%_-30%,#10b98115,transparent)] pointer-events-none -z-10" />

            {/* Header */}
            <header className="h-20 sticky top-0 bg-background/80 backdrop-blur-xl border-b border-border/40 z-50 px-4 md:px-0">
                <div className="max-w-3xl mx-auto h-full flex items-center justify-between w-full">
                    <Link href="/" className="flex items-center gap-2 group">
                        {mounted && (
                            <Image
                                src={logoSrc}
                                alt="Bized Logo"
                                width={36}
                                height={36}
                                className="h-9 w-auto group-hover:scale-105 transition-transform rounded-sm"
                                priority
                            />
                        )}
                        <span className="font-bold text-xl tracking-tighter text-foreground hidden sm:block">
                            BizedApp
                        </span>
                    </Link>

                    <div className="flex-1 flex justify-center px-4">
                        <div className="max-w-[140px] md:max-w-[200px] w-full bg-muted/50 h-1.5 rounded-full overflow-hidden border border-border/20">
                            <motion.div
                                className="h-full bg-primary shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                initial={{ width: `${((step - 1) / 4) * 100}%` }}
                                animate={{ width: `${(step / 4) * 100}%` }}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/account">
                            <button className="p-2.5 rounded-full bg-muted/50 border border-border/60 hover:bg-muted text-foreground transition-all flex items-center justify-center overflow-hidden">
                                {session?.user?.image ? (
                                    <Image
                                        src={session.user.image}
                                        alt="User"
                                        width={24}
                                        height={24}
                                        className="rounded-full"
                                    />
                                ) : (
                                    <User className="w-5 h-5" />
                                )}
                            </button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-4 py-8 md:px-6 md:py-12 md:max-w-3xl md:mx-auto w-full relative z-10 min-h-[450px]">
                <AnimatePresence mode="popLayout">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20, position: "absolute" }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="space-y-10 w-full"
                        >
                            <div className="text-center space-y-3">
                                <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-2">
                                    Step 1: Basics
                                </motion.div>
                                <motion.h1 variants={fadeInUp} className="text-2xl md:text-4xl font-bold text-foreground tracking-tighter leading-tight">
                                    Tell us about your business
                                </motion.h1>
                                <motion.p variants={fadeInUp} className="text-base md:text-lg text-muted-foreground max-w-lg mx-auto font-light leading-relaxed">
                                    Let&apos;s start with the essential identity details for your brand.
                                </motion.p>
                            </div>

                            <div className="space-y-5 bg-card/50 backdrop-blur-sm p-5 md:p-8 rounded-3xl border border-border/60 shadow-xl shadow-black/5">
                                <div className="space-y-3">
                                    <Label htmlFor="name" className="text-sm font-semibold text-foreground/80 ml-1">Business Name</Label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Store className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        </div>
                                        <Input
                                            id="name"
                                            value={name}
                                            onChange={handleNameChange}
                                            placeholder="Acme Corporation"
                                            className="pl-11 h-14 text-lg border-border/60 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all rounded-2xl bg-background/50"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="slug" className="text-sm font-semibold text-foreground/80 ml-1">Magic Link</Label>
                                    <div className={cn(
                                        "flex items-center border h-14 rounded-2xl px-4 bg-background/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all",
                                        slugAvailable === false ? "border-destructive ring-4 ring-destructive/5" :
                                            slugAvailable === true ? "border-primary ring-4 ring-primary/5" : "border-border/60 focus-within:border-primary"
                                    )}>
                                        <Globe className="w-5 h-5 text-muted-foreground mr-2" />
                                        <span className="text-muted-foreground font-medium whitespace-nowrap">bized.app/</span>
                                        <input
                                            id="slug"
                                            value={slug}
                                            onChange={handleSlugChange}
                                            className="flex-1 border-none bg-transparent h-full px-1 text-lg font-medium focus:outline-none text-foreground"
                                            placeholder="link"
                                        />
                                        <div className="flex items-center gap-2">
                                            {isCheckingSlug ? (
                                                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                            ) : slugAvailable === true ? (
                                                <div className="bg-primary/20 p-1 rounded-full">
                                                    <Check className="w-3 h-3 text-primary" />
                                                </div>
                                            ) : slug && slugAvailable === false ? (
                                                <div className="bg-destructive/20 p-1 rounded-full">
                                                    <Loader2 className="w-3 h-3 text-destructive rotate-45" />
                                                </div>
                                            ) : null}
                                            <button
                                                type="button"
                                                onClick={shortenSlug}
                                                className="p-1.5 hover:bg-muted rounded-xl text-muted-foreground hover:text-primary transition-all border border-transparent hover:border-border/40"
                                            >
                                                <Wand2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    {slug && slugAvailable === false && (
                                        <p className="text-xs text-destructive ml-2 font-medium">This link is already taken.</p>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="email" className="text-sm font-semibold text-foreground/80 ml-1">Business Email</Label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        </div>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="contact@business.com"
                                            className="pl-11 h-14 text-lg border-border/60 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all rounded-2xl bg-background/50"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20, position: "absolute" }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="space-y-10 w-full"
                        >
                            <div className="text-center space-y-3">
                                <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-2">
                                    Step 2: Industry
                                </motion.div>
                                <motion.h1 variants={fadeInUp} className="text-2xl md:text-4xl font-bold text-foreground tracking-tighter leading-tight">
                                    Select business category
                                </motion.h1>
                                <motion.p variants={fadeInUp} className="text-base md:text-lg text-muted-foreground font-light mx-auto max-w-md leading-relaxed">
                                    Help us personalize your platform experience.
                                </motion.p>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                {CATEGORIES.map((cat) => {
                                    const Icon = cat.icon
                                    const isSelected = selectedCategory === cat.name
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(cat.name)}
                                            className={cn(
                                                "flex flex-col items-center justify-center p-4 rounded-[1.5rem] md:rounded-[2rem] border-2 transition-all duration-300 text-center gap-3 relative overflow-hidden group",
                                                isSelected
                                                    ? "border-primary bg-primary/[0.03] ring-4 ring-primary/5 shadow-xl shadow-primary/10"
                                                    : "border-border/40 hover:border-primary/30 hover:bg-muted/30 bg-card/30 backdrop-blur-sm"
                                            )}
                                        >
                                            <div className={cn(
                                                "p-3 rounded-2xl transition-all duration-300 shadow-sm",
                                                isSelected ? "bg-primary text-primary-foreground scale-105 shadow-md shadow-primary/25" : cn("bg-muted/50 text-muted-foreground group-hover:scale-105 group-hover:text-primary transition-transform")
                                            )}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <span className={cn(
                                                "font-bold text-xs tracking-tight transition-colors leading-tight",
                                                isSelected ? "text-primary" : "text-foreground/70 group-hover:text-foreground"
                                            )}>
                                                {cat.name}
                                            </span>
                                            {isSelected && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="absolute top-3 right-3 bg-primary rounded-full p-0.5"
                                                >
                                                    <Check className="w-2.5 h-2.5 text-primary-foreground" />
                                                </motion.div>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20, position: "absolute" }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="space-y-10 w-full"
                        >
                            <div className="text-center space-y-3">
                                <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-2">
                                    Step 3: Operation
                                </motion.div>
                                <motion.h1 variants={fadeInUp} className="text-2xl md:text-4xl font-bold text-foreground tracking-tighter leading-tight">
                                    Select business type
                                </motion.h1>
                                <motion.p variants={fadeInUp} className="text-base md:text-lg text-muted-foreground font-light mx-auto max-w-md leading-relaxed">
                                    Define your primary business model.
                                </motion.p>
                            </div>

                            <div className="space-y-3">
                                {BUSINESS_TYPES.map((type) => {
                                    const Icon = type.icon
                                    const isSelected = selectedBusinessType === type.name
                                    return (
                                        <button
                                            key={type.id}
                                            onClick={() => setSelectedBusinessType(type.name)}
                                            className={cn(
                                                "w-full flex items-center p-3 md:p-4 rounded-2xl border-2 transition-all duration-300 text-left gap-3 md:gap-4 relative group",
                                                isSelected
                                                    ? "border-primary bg-primary/[0.03] ring-4 ring-primary/5 shadow-lg shadow-primary/5"
                                                    : "border-border/40 hover:border-primary/20 hover:bg-muted/30 bg-card/30 backdrop-blur-sm"
                                            )}
                                        >
                                            <div className={cn(
                                                "p-2.5 md:p-3 rounded-xl md:rounded-2xl transition-all duration-300 flex-shrink-0",
                                                isSelected ? "bg-primary text-primary-foreground scale-105 shadow-md shadow-primary/25" : "bg-muted/80 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary group-hover:scale-105"
                                            )}>
                                                <Icon className="w-5 h-5 md:w-6 md:h-6" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className={cn(
                                                    "font-bold text-base md:text-lg tracking-tight transition-colors mb-0.5",
                                                    isSelected ? "text-primary" : "text-foreground"
                                                )}>
                                                    {type.name}
                                                </h3>
                                                <p className="text-xs md:text-sm text-muted-foreground font-light leading-tight">
                                                    {type.description}
                                                </p>
                                            </div>
                                            <div className={cn(
                                                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all px-0 flex-shrink-0",
                                                isSelected ? "border-primary bg-primary scale-110 shadow-md shadow-primary/20" : "border-border/80 group-hover:border-primary/40"
                                            )}>
                                                {isSelected && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20, position: "absolute" }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="space-y-10 w-full"
                        >
                            <div className="text-center space-y-3">
                                <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-2">
                                    Step 4: Contact
                                </motion.div>
                                <motion.h1 variants={fadeInUp} className="text-2xl md:text-4xl font-bold text-foreground tracking-tighter leading-tight">
                                    Provide your phone number
                                </motion.h1>
                                <motion.p variants={fadeInUp} className="text-base md:text-lg text-muted-foreground max-w-lg mx-auto font-light leading-relaxed">
                                    This will be used to contact you and displayed on your business profile.
                                </motion.p>
                            </div>

                            <div className="bg-card/50 backdrop-blur-sm p-6 md:p-10 rounded-[2.5rem] border border-border/60 shadow-2xl shadow-black/5 space-y-8">
                                <div className="space-y-4">
                                    <Label htmlFor="phone" className="text-sm font-bold text-foreground/80 flex items-center gap-2 ml-1">
                                        <Phone className="w-4 h-4 text-primary" />
                                        Phone Number
                                    </Label>
                                    <div className="flex gap-3">
                                        <div className="w-auto relative group">
                                            <CountrySelector
                                                value={phoneCode}
                                                onChange={(country) => setPhoneCode(country.dialCode)}
                                            />
                                            <div className="absolute -top-2 left-3 px-2 bg-background/80 backdrop-blur-sm rounded-md border border-border/40 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Country</div>
                                        </div>
                                        <div className="flex-1 relative group">
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                placeholder="700 000 000"
                                                className="h-16 pl-6 text-xl tracking-widest font-bold border-border/60 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all rounded-2xl bg-background/50"
                                            />
                                            <div className="absolute -top-2 left-3 px-2 bg-background/80 backdrop-blur-sm rounded-md border border-border/40 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Number</div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground px-2 font-medium">
                                        We&apos;ll never share your number with unauthorized third parties.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Footer Navigation */}
            <footer className="p-5 md:p-8 lg:p-12 bg-background/50 backdrop-blur-xl border-t border-border/40 sticky bottom-0 z-50">
                <div className="max-w-2xl mx-auto space-y-6 md:space-y-8">
                    <div className="flex items-center gap-4 w-full">
                        <div className="flex-1 h-1.5 bg-muted rounded-full relative">
                            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full flex justify-between px-0 pointer-events-none">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className={cn(
                                        "w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-500 border-2 bg-background",
                                        step >= i ? "border-primary scale-125 bg-primary" : "border-muted"
                                    )} />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 items-center gap-2">
                        <div className="flex justify-start">
                            <button
                                onClick={prevStep}
                                className={cn(
                                    "flex items-center gap-1.5 md:gap-2 px-4 md:px-6 py-3 md:py-3.5 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold transition-all border border-border/60 hover:bg-muted active:scale-95 whitespace-nowrap",
                                    step === 1 ? "opacity-0 pointer-events-none" : "opacity-100"
                                )}
                            >
                                <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                <span>Back</span>
                            </button>
                        </div>

                        <div className="flex justify-center">
                            <button
                                onClick={() => router.push('/businesses/select')}
                                className="px-4 py-3 md:py-3.5 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold transition-all text-muted-foreground hover:text-foreground active:scale-95"
                            >
                                Skip
                            </button>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                size="lg"
                                onClick={step === 4 ? handleCreateBusiness : nextStep}
                                disabled={creating}
                                className="w-full sm:w-auto sm:min-w-[140px] md:min-w-[180px] h-12 md:h-14 rounded-xl md:rounded-2xl text-base md:text-lg font-bold shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] bg-primary hover:bg-primary/90 text-primary-foreground px-4 md:px-8"
                            >
                                {creating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 animate-spin" />
                                        Creating...
                                    </>
                                ) : step === 4 ? (
                                    "Launch"
                                ) : (
                                    <span className="flex items-center">
                                        Continue
                                        <ChevronRight className="w-4 h-4 md:w-5 md:h-5 ml-1.5 md:ml-2" strokeWidth={3} />
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
