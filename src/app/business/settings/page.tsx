"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Loader2, Receipt, ShoppingCart, Users, Settings as SettingsIcon, ChevronRight, Plus, MapPin, Pencil, Trash, Percent, CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"

import { AddressDialog } from "@/components/business/settings/address-dialog"
import dynamic from "next/dynamic"

// Dynamically import MapPicker
const AddressMapPicker = dynamic(() => import("@/components/business/settings/address-map-picker"), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-muted animate-pulse" />
})

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CurrencySelector } from "@/components/ui/currency-selector"

export default function SettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [businessId, setBusinessId] = useState<string | null>(null)
    const [activeSection, setActiveSection] = useState("general")
    const [originalGeneralData, setOriginalGeneralData] = useState<any>(null)
    const [originalConfig, setOriginalConfig] = useState<any>(null)

    // State for general business details matching wizard fields
    const [generalData, setGeneralData] = useState({
        name: '', // Step 1: Name
        slug: '', // Step 1: Link name
        email: '', // Step 1: Business Email
        phone: { code: '+254', number: '' }, // Step 1: Phone
        businessType: '', // Step 3: Business Type (Retailer, Distributor, etc.)
        industry: '', // Step 2: Business Category (Agriculture, etc.)
        goals: [] as string[], // Step 3: Goals
        deliveryMethods: [] as any[], // Step 5: Delivery
        paymentMethods: [] as any[], // Step 6: Payment
        whatsappNumber: '', // Step 7: WhatsApp
        businessHours: [] as any[], // Step 8: Business Hours
        website: '', // Optional additional field
        address: {
            streetAddress: '',
            addressLocality: '',
            addressRegion: '',
            postalCode: '',
            addressCountry: 'Kenya',
            lat: 0,
            lng: 0,
            mapSnapshotUrl: '',
        }
    })


    const [showAddressDialog, setShowAddressDialog] = useState(false)

    // State for configuration settings
    const [config, setConfig] = useState({
        invoice: {
            prefix: 'INV',
            nextNumber: 1001,
            dueDateDays: 7,
            footerMessage: '',
            defaultTerms: 'Payment due upon receipt.',
            paymentDetails: '',
            showLogo: true,
            showAddress: true,
            showEmail: true,
            accentColor: '#000000',
        },
        order: {
            prefix: 'ORD',
            defaultStatus: 'pending',
            enableNotifications: true,
        },
        customer: {
            welcomeMessage: '',
            requirePhone: false,
        },
        regional: {
            currency: 'KES',
            timezone: 'Africa/Nairobi',
            dateFormat: 'DD/MM/YYYY',
            language: 'en',
            firstDayOfWeek: '1',
            numberFormat: 'commadecimal',
            measurementSystem: 'metric',
            distanceUnit: 'km',
        },
        tax: {
            taxId: '',
            pricesIncludeTax: false,
            taxEnabled: true,
            taxes: [
                { id: '1', name: 'VAT', rate: 0 }
            ],
        },
        payments: {
            gateways: [
                { id: 'mpesa', name: 'M-Pesa', enabled: false, credentials: { shortcode: '', consumerKey: '', consumerSecret: '' } },
                { id: 'stripe', name: 'Stripe', enabled: false, credentials: { publishableKey: '', secretKey: '' } },
                { id: 'paypal', name: 'PayPal', enabled: false, credentials: { clientId: '', clientSecret: '' } },
                { id: 'bank', name: 'Bank Transfer', enabled: true, credentials: { details: '' } },
            ]
        },
    })

    const navItems = [
        { id: "general", label: "General", icon: SettingsIcon },
        { id: "regional", label: "Regional", icon: MapPin },
        { id: "tax", label: "Tax", icon: Percent },
        { id: "payments", label: "Payments", icon: CreditCard },
        { id: "invoices", label: "Invoices", icon: Receipt },
        { id: "orders", label: "Orders", icon: ShoppingCart },
        { id: "customers", label: "Customers", icon: Users },
    ]

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/businesses')
                if (!res.ok) throw new Error('Failed to fetch business')
                const businesses = await res.json()
                const biz = businesses[0] // Assuming single business for now
                if (biz) {
                    // Load Configuration
                    // Load Configuration
                    if (biz.configuration) {
                        const loadedConfig = {
                            invoice: { ...config.invoice, ...biz.configuration.invoice },
                            order: { ...config.order, ...biz.configuration.order },
                            customer: { ...config.customer, ...biz.configuration.customer },
                            regional: { ...config.regional, ...biz.configuration.regional },
                            tax: { ...config.tax, ...biz.configuration.tax },
                            payments: { ...config.payments, ...biz.configuration.payments },
                        }
                        setConfig(loadedConfig)
                        setOriginalConfig(loadedConfig)
                    } else {
                        setOriginalConfig(config)
                    }

                    // Load General Data mapping from DB to state
                    const loadedGeneral = {
                        name: biz.name || '',
                        slug: biz.slug || '',
                        email: biz.email || '',
                        phone: biz.phone || { code: '+254', number: '' },
                        businessType: biz.businessType || '',
                        industry: biz.industry || '',
                        goals: biz.goals || [],
                        deliveryMethods: biz.deliveryMethods || [],
                        paymentMethods: biz.paymentMethods || [],
                        whatsappNumber: biz.whatsappNumber || '',
                        businessHours: biz.businessHours || [],
                        website: biz.url || '', // 'url' in DB usually refers to website
                        address: biz.address || {
                            streetAddress: '',
                            addressLocality: '',
                            addressRegion: '',
                            postalCode: '',
                            addressCountry: 'Kenya',
                            lat: -1.2921,
                            lng: 36.8219,
                            mapSnapshotUrl: '',
                        }
                    }
                    setGeneralData(loadedGeneral)
                    setOriginalGeneralData(loadedGeneral)

                    setBusinessId(biz._id)
                }
            } catch (error) {
                console.error("Error loading settings:", error)
                toast.error("Failed to load settings")
            } finally {
                setLoading(false)
            }
        }
        // Assuming 'status' is available from a context or hook like useSession
        // For now, calling directly. If 'status' is needed, it should be passed or imported.
        // if (status === 'authenticated') {
        fetchSettings()
        // }
    }, []) // Added missing dependency array, assuming 'status' is not a direct dependency for this snippet.

    // Check for changes
    const hasChanges = (originalGeneralData && JSON.stringify(generalData) !== JSON.stringify(originalGeneralData)) ||
        (originalConfig && JSON.stringify(config) !== JSON.stringify(originalConfig))

    // Warn on unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasChanges) {
                e.preventDefault()
                e.returnValue = ''
            }
        }
        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [hasChanges])

    const handleSave = async () => {
        if (!businessId) return

        setSaving(true)
        try {
            // Combine general data and configuration in the payload
            const payload = {
                // General fields
                name: generalData.name,
                slug: generalData.slug,
                email: generalData.email,
                phone: generalData.phone,
                businessType: generalData.businessType,
                industry: generalData.industry,
                // goals: generalData.goals,
                whatsappNumber: generalData.whatsappNumber,
                url: generalData.website,
                address: generalData.address,

                // Configuration object
                configuration: config
            }

            const res = await fetch(`/api/businesses/${businessId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            if (!res.ok) throw new Error("Failed to update settings")

            toast.success("Settings saved successfully")
            setOriginalGeneralData(generalData)
            setOriginalConfig(config)
        } catch (error) {
            console.error("Error saving settings:", error)
            toast.error("Failed to save settings")
        } finally {
            setSaving(false)
        }
    }

    const handleChange = (section: keyof typeof config, field: string, value: any) => {
        setConfig(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }))
    }

    const handleGeneralChange = (field: string, value: any) => {
        setGeneralData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handlePhoneChange = (field: 'code' | 'number', value: string) => {
        setGeneralData(prev => ({
            ...prev,
            phone: {
                ...prev.phone,
                [field]: value
            }
        }))
    }

    const handleTaxChange = (index: number, field: string, value: any) => {
        const newTaxes = [...(config.tax.taxes || [])]
        newTaxes[index] = { ...newTaxes[index], [field]: value }
        handleChange('tax', 'taxes', newTaxes)
    }

    const handleGatewayToggle = (id: string, enabled: boolean) => {
        const newGateways = config.payments.gateways.map((g: any) =>
            g.id === id ? { ...g, enabled } : g
        )
        handleChange('payments', 'gateways', newGateways)
    }

    const handleGatewayCredentialChange = (gatewayId: string, field: string, value: any) => {
        const newGateways = config.payments.gateways.map((g: any) =>
            g.id === gatewayId ? { ...g, credentials: { ...g.credentials, [field]: value } } : g
        )
        handleChange('payments', 'gateways', newGateways)
    }

    const addTax = () => {
        const newTaxes = [...(config.tax.taxes || []), { id: Date.now().toString(), name: '', rate: 0 }]
        handleChange('tax', 'taxes', newTaxes)
    }

    const removeTax = (index: number) => {
        const newTaxes = (config.tax.taxes || []).filter((_, i) => i !== index)
        handleChange('tax', 'taxes', newTaxes)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Settings
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Manage your business preferences and identity.
                    </p>
                </div>
                <Button onClick={handleSave} disabled={saving || !hasChanges}>
                    {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Changes
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start">
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

                <div className="flex-1 w-full min-w-0">
                    {activeSection === "general" && (
                        <Accordion type="multiple" defaultValue={["general-info", "address"]} className="space-y-4">
                            <AccordionItem value="general-info" className="border rounded-lg bg-card text-card-foreground shadow-sm px-6">
                                <AccordionTrigger className="hover:no-underline py-4">
                                    <div className="flex flex-col items-start gap-1 text-left">
                                        <span className="text-lg font-semibold">General Information</span>
                                        <span className="text-sm text-muted-foreground font-normal">Your core business identity on Bized.</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pb-4">
                                    <div className="space-y-4 pt-1">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Row 1: Identity */}
                                            <div className="space-y-2">
                                                <Label>Business Name</Label>
                                                <Input
                                                    value={generalData.name}
                                                    onChange={(e) => handleGeneralChange('name', e.target.value)}
                                                    placeholder="e.g. Acme Corp"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Magic Link</Label>
                                                <div className="flex">
                                                    <span className="flex items-center px-3 rounded-l-md border border-r-0 bg-muted text-muted-foreground text-sm">
                                                        bized.app/
                                                    </span>
                                                    <Input
                                                        className="rounded-l-none"
                                                        value={generalData.slug}
                                                        onChange={(e) => handleGeneralChange('slug', e.target.value)}
                                                        placeholder="link"
                                                    />
                                                </div>
                                            </div>

                                            {/* Row 2: Contact */}
                                            <div className="space-y-2">
                                                <Label>Business Email</Label>
                                                <Input
                                                    type="email"
                                                    value={generalData.email}
                                                    onChange={(e) => handleGeneralChange('email', e.target.value)}
                                                    placeholder="contact@business.com"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Phone Number</Label>
                                                <div className="flex gap-2">
                                                    <div className="flex items-center justify-center px-3 rounded-md border bg-muted/50 font-medium text-sm text-muted-foreground whitespace-nowrap">
                                                        🇰🇪 +254
                                                    </div>
                                                    <Input
                                                        className="flex-1"
                                                        value={generalData.phone.number}
                                                        onChange={(e) => handlePhoneChange('number', e.target.value)}
                                                        placeholder="700 000 000"
                                                    />
                                                </div>
                                            </div>

                                            {/* Row 3: Details */}
                                            <div className="space-y-2">
                                                <Label>Business Category</Label>
                                                <Select
                                                    value={generalData.industry}
                                                    onValueChange={(val) => handleGeneralChange('industry', val)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select category" />
                                                    </SelectTrigger>
                                                    <SelectContent className="max-h-[300px]">
                                                        {/* Common Categories from Wizard */}
                                                        <SelectItem value="Agriculture">Agriculture</SelectItem>
                                                        <SelectItem value="Construction">Construction</SelectItem>
                                                        <SelectItem value="Education">Education</SelectItem>
                                                        <SelectItem value="Electronics">Electronics</SelectItem>
                                                        <SelectItem value="Financial Services">Financial Services</SelectItem>
                                                        <SelectItem value="Food/Restaurant">Food/Restaurant</SelectItem>
                                                        <SelectItem value="Clothes/Fashion">Clothes/Fashion</SelectItem>
                                                        <SelectItem value="Hardware">Hardware</SelectItem>
                                                        <SelectItem value="Jewellery">Jewellery</SelectItem>
                                                        <SelectItem value="Healthcare & Fitness">Healthcare & Fitness</SelectItem>
                                                        <SelectItem value="Kirana/Grocery">Kirana/Grocery</SelectItem>
                                                        <SelectItem value="Transport">Transport</SelectItem>
                                                        <SelectItem value="Other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Business Type</Label>
                                                <Select
                                                    value={generalData.businessType}
                                                    onValueChange={(val) => handleGeneralChange('businessType', val)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Retailer">Retailer</SelectItem>
                                                        <SelectItem value="Distributor">Distributor</SelectItem>
                                                        <SelectItem value="Manufacturer">Manufacturer</SelectItem>
                                                        <SelectItem value="Service Provider">Service Provider</SelectItem>
                                                        <SelectItem value="Trader">Trader</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>WhatsApp (Optional)</Label>
                                            <Input
                                                value={generalData.whatsappNumber}
                                                onChange={(e) => handleGeneralChange('whatsappNumber', e.target.value)}
                                                placeholder="e.g. +254 7..."
                                            />
                                        </div>


                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="address" className="border rounded-lg bg-card text-card-foreground shadow-sm px-6">
                                <AccordionTrigger className="hover:no-underline py-4">
                                    <div className="flex flex-col items-start gap-1 text-left">
                                        <span className="text-lg font-semibold">Address & Location</span>
                                        <span className="text-sm text-muted-foreground font-normal">Manage your business physical location.</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pb-4">
                                    <div className="space-y-4 pt-1">
                                        {generalData.address?.streetAddress ? (
                                            <div className="rounded-lg border overflow-hidden bg-muted/10 group relative">
                                                {/* Preview Map Strip */}
                                                <div className="h-32 bg-muted/30 w-full relative overflow-hidden">
                                                    {generalData.address.mapSnapshotUrl ? (
                                                        <img
                                                            src={generalData.address.mapSnapshotUrl}
                                                            alt="Map Snapshot"
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (generalData.address.lat !== 0 || generalData.address.lng !== 0) ? (
                                                        <AddressMapPicker
                                                            lat={generalData.address.lat}
                                                            lng={generalData.address.lng}
                                                            onChange={() => { }}
                                                            readOnly={true}
                                                            className="h-full w-full rounded-none border-none z-10"
                                                        />
                                                    ) : (
                                                        <>
                                                            <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover opacity-[0.03] dark:opacity-[0.05]" />
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <div className="bg-primary/10 p-3 rounded-full ring-4 ring-primary/5">
                                                                    <MapPin className="w-5 h-5 text-primary" />
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>

                                                <div className="p-4 flex items-start justify-between bg-card">
                                                    <div className="space-y-1">
                                                        <p className="font-medium text-sm">
                                                            {generalData.address.addressRegion && <span className="text-foreground">{generalData.address.addressRegion}, </span>}
                                                            {generalData.address.streetAddress}
                                                        </p>
                                                        <div className="flex flex-col text-xs text-muted-foreground">
                                                            <span>{generalData.address.addressLocality}</span>
                                                            <span>{generalData.address.addressCountry} {generalData.address.postalCode}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setShowAddressDialog(true)}>
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => {
                                                            setGeneralData(prev => ({
                                                                ...prev,
                                                                address: {
                                                                    streetAddress: '',
                                                                    addressLocality: '',
                                                                    addressRegion: '',
                                                                    postalCode: '',
                                                                    addressCountry: 'Kenya',
                                                                    lat: 0,
                                                                    lng: 0,
                                                                    mapSnapshotUrl: '',
                                                                }
                                                            }))
                                                        }}>
                                                            <Trash className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => setShowAddressDialog(true)}
                                                className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/5 hover:border-muted-foreground/30 cursor-pointer transition-colors"
                                            >
                                                <div className="bg-muted p-2 rounded-full mb-3">
                                                    <MapPin className="w-5 h-5 text-muted-foreground" />
                                                </div>
                                                <p className="text-sm font-medium text-foreground">No address added</p>
                                                <p className="text-xs text-muted-foreground mt-1">Add your business location for customers to find you.</p>
                                            </div>
                                        )}


                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    )}

                    {activeSection === "regional" && (
                        <Accordion type="single" collapsible defaultValue="regional" className="w-full">
                            <AccordionItem value="regional" className="border rounded-lg bg-card text-card-foreground shadow-sm px-6">
                                <AccordionTrigger className="hover:no-underline py-4">
                                    <div className="flex flex-col items-start gap-1 text-left">
                                        <span className="text-lg font-semibold">Regional Settings</span>
                                        <span className="text-sm text-muted-foreground font-normal">Manage your local preferences.</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pb-4">
                                    <div className="space-y-4 pt-1">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Currency</Label>
                                                <CurrencySelector
                                                    value={config.regional.currency}
                                                    onChange={(v) => handleChange('regional', 'currency', v)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Timezone</Label>
                                                <Select
                                                    value={config.regional.timezone}
                                                    onValueChange={(v) => handleChange('regional', 'timezone', v)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Africa/Nairobi">Nairobi (GMT+3)</SelectItem>
                                                        <SelectItem value="Africa/Lagos">Lagos (GMT+1)</SelectItem>
                                                        <SelectItem value="Africa/Johannesburg">Johannesburg (GMT+2)</SelectItem>
                                                        <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                                                        <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                                                        <SelectItem value="Asia/Dubai">Dubai (GMT+4)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Date Format</Label>
                                                <Select
                                                    value={config.regional.dateFormat}
                                                    onValueChange={(v) => handleChange('regional', 'dateFormat', v)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                                                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                                                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Primary Language</Label>
                                                <Select
                                                    value={config.regional.language}
                                                    onValueChange={(v) => handleChange('regional', 'language', v)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="en">English</SelectItem>
                                                        <SelectItem value="sw">Swahili</SelectItem>
                                                        <SelectItem value="fr">French</SelectItem>
                                                        <SelectItem value="es">Spanish</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>First Day of Week</Label>
                                                <Select
                                                    value={config.regional.firstDayOfWeek}
                                                    onValueChange={(v) => handleChange('regional', 'firstDayOfWeek', v)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="0">Sunday</SelectItem>
                                                        <SelectItem value="1">Monday</SelectItem>
                                                        <SelectItem value="6">Saturday</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Measurement System</Label>
                                                <Select
                                                    value={config.regional.measurementSystem}
                                                    onValueChange={(v) => handleChange('regional', 'measurementSystem', v)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="metric">Metric (kg, m, L)</SelectItem>
                                                        <SelectItem value="imperial">Imperial (lb, ft, gal)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Distance Unit (for Delivery)</Label>
                                                <Select
                                                    value={config.regional.distanceUnit}
                                                    onValueChange={(v) => handleChange('regional', 'distanceUnit', v)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="km">Kilometers (km)</SelectItem>
                                                        <SelectItem value="mi">Miles (mi)</SelectItem>
                                                        <SelectItem value="m">Meters (m)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Number Format</Label>
                                                <Select
                                                    value={config.regional.numberFormat}
                                                    onValueChange={(v) => handleChange('regional', 'numberFormat', v)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="commadecimal">1,234.56 (Comma separator)</SelectItem>
                                                        <SelectItem value="dotdecimal">1.234,56 (Dot separator)</SelectItem>
                                                        <SelectItem value="spacedecimal">1 234,56 (Space separator)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    )}

                    {activeSection === "tax" && (
                        <Accordion type="single" collapsible defaultValue="tax" className="w-full">
                            <AccordionItem value="tax" className="border rounded-lg bg-card text-card-foreground shadow-sm px-6">
                                <AccordionTrigger className="hover:no-underline py-4">
                                    <div className="flex flex-col items-start gap-1 text-left">
                                        <span className="text-lg font-semibold">Tax Settings</span>
                                        <span className="text-sm text-muted-foreground font-normal">Configure your tax identification and rates.</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pb-4">
                                    <div className="space-y-6 pt-1">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-base">Tax Rates</Label>
                                                <Button variant="outline" size="sm" onClick={addTax} className="h-8 gap-1">
                                                    <Plus className="w-3.5 h-3.5" />
                                                    Add Tax
                                                </Button>
                                            </div>

                                            <div className="space-y-3">
                                                {(config.tax.taxes || []).map((tax: any, index: number) => (
                                                    <div key={tax.id} className="flex gap-4 items-end bg-muted/30 p-3 rounded-lg border group relative">
                                                        <div className="flex-1 space-y-2">
                                                            <Label className="text-xs">Tax Name</Label>
                                                            <Input
                                                                value={tax.name}
                                                                onChange={(e) => handleTaxChange(index, 'name', e.target.value)}
                                                                placeholder="e.g. VAT"
                                                                className="bg-background"
                                                            />
                                                        </div>
                                                        <div className="w-24 space-y-2">
                                                            <Label className="text-xs">Rate (%)</Label>
                                                            <Input
                                                                type="number"
                                                                value={tax.rate}
                                                                onChange={(e) => handleTaxChange(index, 'rate', parseFloat(e.target.value) || 0)}
                                                                className="bg-background"
                                                            />
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-10 w-10 text-muted-foreground hover:text-destructive shrink-0"
                                                            onClick={() => removeTax(index)}
                                                            disabled={(config.tax.taxes || []).length <= 1}
                                                        >
                                                            <Trash className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Tax ID / Registration Number</Label>
                                            <Input
                                                value={config.tax.taxId}
                                                onChange={(e) => handleChange('tax', 'taxId', e.target.value)}
                                                placeholder="e.g. PIN-123456"
                                            />
                                        </div>

                                        <div className="space-y-4 pt-2">
                                            <div className="flex items-center justify-between p-3 rounded-lg border">
                                                <div className="space-y-0.5">
                                                    <Label className="text-sm">Prices Include Tax</Label>
                                                    <p className="text-xs text-muted-foreground">Whether product/service prices already include tax</p>
                                                </div>
                                                <Switch
                                                    checked={config.tax.pricesIncludeTax}
                                                    onCheckedChange={(c) => handleChange('tax', 'pricesIncludeTax', c)}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between p-3 rounded-lg border">
                                                <div className="space-y-0.5">
                                                    <Label className="text-sm">Enable Tax Calculation</Label>
                                                    <p className="text-xs text-muted-foreground">Automatically apply tax to invoices and orders</p>
                                                </div>
                                                <Switch
                                                    checked={config.tax.taxEnabled}
                                                    onCheckedChange={(c) => handleChange('tax', 'taxEnabled', c)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    )}

                    {activeSection === "payments" && (
                        <Accordion type="single" collapsible defaultValue="gateways" className="w-full space-y-4">
                            <AccordionItem value="gateways" className="border rounded-lg bg-card text-card-foreground shadow-sm px-6">
                                <AccordionTrigger className="hover:no-underline py-4">
                                    <div className="flex flex-col items-start gap-1 text-left">
                                        <span className="text-lg font-semibold">Payment Gateways</span>
                                        <span className="text-sm text-muted-foreground font-normal">Connect and manage your payment methods.</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pb-4">
                                    <div className="space-y-6 pt-1">
                                        {config.payments.gateways.map((gateway: any) => (
                                            <div key={gateway.id} className="p-4 rounded-lg border bg-muted/30 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center border shadow-sm">
                                                            <CreditCard className="w-5 h-5 text-muted-foreground" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium">{gateway.name}</h4>
                                                            <p className="text-xs text-muted-foreground">
                                                                {gateway.enabled ? "Active" : "Disabled"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Switch
                                                        checked={gateway.enabled}
                                                        onCheckedChange={(checked) => handleGatewayToggle(gateway.id, checked)}
                                                    />
                                                </div>

                                                {gateway.enabled && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-dashed">
                                                        {gateway.id === 'mpesa' && (
                                                            <>
                                                                <div className="space-y-2">
                                                                    <Label className="text-xs">Shortcode / Till Number</Label>
                                                                    <Input
                                                                        value={gateway.credentials.shortcode}
                                                                        onChange={(e) => handleGatewayCredentialChange('mpesa', 'shortcode', e.target.value)}
                                                                        placeholder="e.g. 123456"
                                                                        className="bg-background"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label className="text-xs">Consumer Key</Label>
                                                                    <Input
                                                                        value={gateway.credentials.consumerKey}
                                                                        onChange={(e) => handleGatewayCredentialChange('mpesa', 'consumerKey', e.target.value)}
                                                                        type="password"
                                                                        className="bg-background"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2 md:col-span-2">
                                                                    <Label className="text-xs">Consumer Secret</Label>
                                                                    <Input
                                                                        value={gateway.credentials.consumerSecret}
                                                                        onChange={(e) => handleGatewayCredentialChange('mpesa', 'consumerSecret', e.target.value)}
                                                                        type="password"
                                                                        className="bg-background"
                                                                    />
                                                                </div>
                                                            </>
                                                        )}
                                                        {gateway.id === 'stripe' && (
                                                            <>
                                                                <div className="space-y-2">
                                                                    <Label className="text-xs">Publishable Key</Label>
                                                                    <Input
                                                                        value={gateway.credentials.publishableKey}
                                                                        onChange={(e) => handleGatewayCredentialChange('stripe', 'publishableKey', e.target.value)}
                                                                        placeholder="pk_test_..."
                                                                        className="bg-background"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label className="text-xs">Secret Key</Label>
                                                                    <Input
                                                                        value={gateway.credentials.secretKey}
                                                                        onChange={(e) => handleGatewayCredentialChange('stripe', 'secretKey', e.target.value)}
                                                                        type="password"
                                                                        placeholder="sk_test_..."
                                                                        className="bg-background"
                                                                    />
                                                                </div>
                                                            </>
                                                        )}
                                                        {gateway.id === 'paypal' && (
                                                            <>
                                                                <div className="space-y-2">
                                                                    <Label className="text-xs">Client ID</Label>
                                                                    <Input
                                                                        value={gateway.credentials.clientId}
                                                                        onChange={(e) => handleGatewayCredentialChange('paypal', 'clientId', e.target.value)}
                                                                        className="bg-background"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label className="text-xs">Client Secret</Label>
                                                                    <Input
                                                                        value={gateway.credentials.clientSecret}
                                                                        onChange={(e) => handleGatewayCredentialChange('paypal', 'clientSecret', e.target.value)}
                                                                        type="password"
                                                                        className="bg-background"
                                                                    />
                                                                </div>
                                                            </>
                                                        )}
                                                        {gateway.id === 'bank' && (
                                                            <div className="space-y-2 md:col-span-2">
                                                                <Label className="text-xs">Bank Details</Label>
                                                                <Textarea
                                                                    value={gateway.credentials.details}
                                                                    onChange={(e) => handleGatewayCredentialChange('bank', 'details', e.target.value)}
                                                                    placeholder="Account Name: ...\nAccount Number: ...\nBank: ..."
                                                                    className="bg-background min-h-[100px]"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    )}

                    {
                        activeSection === "invoices" && (
                            <Accordion type="single" collapsible defaultValue="invoices" className="w-full">
                                <AccordionItem value="invoices" className="border rounded-lg bg-card text-card-foreground shadow-sm px-6">
                                    <AccordionTrigger className="hover:no-underline py-4">
                                        <div className="flex flex-col items-start gap-1 text-left">
                                            <span className="text-lg font-semibold">Invoice Settings</span>
                                            <span className="text-sm text-muted-foreground font-normal">Configure invoice appearance.</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-4">
                                        <div className="space-y-6 pt-1">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Invoice Prefix</Label>
                                                    <Input
                                                        value={config.invoice.prefix}
                                                        onChange={(e) => handleChange('invoice', 'prefix', e.target.value)}
                                                        placeholder="INV"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Next Number</Label>
                                                    <Input
                                                        type="number"
                                                        value={config.invoice.nextNumber}
                                                        onChange={(e) => handleChange('invoice', 'nextNumber', parseInt(e.target.value) || 1)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Default Due (Days)</Label>
                                                    <Input
                                                        type="number"
                                                        value={config.invoice.dueDateDays}
                                                        onChange={(e) => handleChange('invoice', 'dueDateDays', parseInt(e.target.value) || 0)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <Label className="text-base">Display Options</Label>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="flex items-center justify-between p-3 rounded-lg border">
                                                        <div className="space-y-0.5">
                                                            <Label className="text-sm">Show Business Logo</Label>
                                                            <p className="text-xs text-muted-foreground">Display logo on top of invoice</p>
                                                        </div>
                                                        <Switch
                                                            checked={config.invoice.showLogo}
                                                            onCheckedChange={(c) => handleChange('invoice', 'showLogo', c)}
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between p-3 rounded-lg border">
                                                        <div className="space-y-0.5">
                                                            <Label className="text-sm">Show Business Address</Label>
                                                            <p className="text-xs text-muted-foreground">Display your physical address</p>
                                                        </div>
                                                        <Switch
                                                            checked={config.invoice.showAddress}
                                                            onCheckedChange={(c) => handleChange('invoice', 'showAddress', c)}
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between p-3 rounded-lg border">
                                                        <div className="space-y-0.5">
                                                            <Label className="text-sm">Show Business Email</Label>
                                                            <p className="text-xs text-muted-foreground">Display contact email</p>
                                                        </div>
                                                        <Switch
                                                            checked={config.invoice.showEmail}
                                                            onCheckedChange={(c) => handleChange('invoice', 'showEmail', c)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label>Payment Instructions</Label>
                                                    <Textarea
                                                        className="h-24"
                                                        value={config.invoice.paymentDetails}
                                                        onChange={(e) => handleChange('invoice', 'paymentDetails', e.target.value)}
                                                        placeholder="Bank: Example Bank\nAccount: 123456789\nSwift: EXBKXX"
                                                    />
                                                    <p className="text-xs text-muted-foreground">Shown in the payment details section of the invoice.</p>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Terms & Conditions</Label>
                                                    <Textarea
                                                        className="h-24"
                                                        value={config.invoice.defaultTerms}
                                                        onChange={(e) => handleChange('invoice', 'defaultTerms', e.target.value)}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Footer Message</Label>
                                                    <Textarea
                                                        className="h-16"
                                                        value={config.invoice.footerMessage}
                                                        onChange={(e) => handleChange('invoice', 'footerMessage', e.target.value)}
                                                        placeholder="Thank you for your business!"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        )
                    }

                    {
                        activeSection === "orders" && (
                            <Accordion type="single" collapsible defaultValue="orders" className="w-full">
                                <AccordionItem value="orders" className="border rounded-lg bg-card text-card-foreground shadow-sm px-6">
                                    <AccordionTrigger className="hover:no-underline py-4">
                                        <div className="flex flex-col items-start gap-1 text-left">
                                            <span className="text-lg font-semibold">Order Settings</span>
                                            <span className="text-sm text-muted-foreground font-normal">Default configurations for new orders.</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-4">
                                        <div className="space-y-4 pt-1">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Order Prefix</Label>
                                                    <Input
                                                        value={config.order.prefix}
                                                        onChange={(e) => handleChange('order', 'prefix', e.target.value)}
                                                        placeholder="ORD"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Default Status</Label>
                                                    <Input
                                                        value={config.order.defaultStatus}
                                                        onChange={(e) => handleChange('order', 'defaultStatus', e.target.value)}
                                                        placeholder="pending"
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between p-3 rounded-lg border md:col-span-2">
                                                    <div className="space-y-0.5">
                                                        <Label className="text-sm">Notifications</Label>
                                                        <p className="text-xs text-muted-foreground">Receive alerts for new orders</p>
                                                    </div>
                                                    <Switch
                                                        checked={config.order.enableNotifications}
                                                        onCheckedChange={(c) => handleChange('order', 'enableNotifications', c)}
                                                    />
                                                </div>
                                            </div>


                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        )
                    }

                    {
                        activeSection === "customers" && (
                            <Accordion type="single" collapsible defaultValue="customers" className="w-full">
                                <AccordionItem value="customers" className="border rounded-lg bg-card text-card-foreground shadow-sm px-6">
                                    <AccordionTrigger className="hover:no-underline py-4">
                                        <div className="flex flex-col items-start gap-1 text-left">
                                            <span className="text-lg font-semibold">Customer Settings</span>
                                            <span className="text-sm text-muted-foreground font-normal">Manage customer interactions.</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-4">
                                        <div className="space-y-4 pt-1">
                                            <div className="flex items-center justify-between p-3 rounded-lg border">
                                                <div className="space-y-0.5">
                                                    <Label className="text-sm">Require Phone Number</Label>
                                                    <p className="text-xs text-muted-foreground">Mandatory for new customers</p>
                                                </div>
                                                <Switch
                                                    checked={config.customer.requirePhone}
                                                    onCheckedChange={(c) => handleChange('customer', 'requirePhone', c)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Welcome Message</Label>
                                                <Textarea
                                                    className="h-20"
                                                    value={config.customer.welcomeMessage}
                                                    onChange={(e) => handleChange('customer', 'welcomeMessage', e.target.value)}
                                                    placeholder="Welcome..."
                                                />
                                            </div>


                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        )
                    }
                </div >
            </div >

            <AddressDialog
                open={showAddressDialog}
                onOpenChange={setShowAddressDialog}
                initialData={generalData.address}
                onSave={async (addressData) => {
                    setGeneralData(prev => ({
                        ...prev,
                        address: {
                            streetAddress: addressData.streetAddress || '',
                            addressLocality: addressData.addressLocality || '',
                            addressRegion: addressData.addressRegion || '',
                            postalCode: addressData.postalCode || '',
                            addressCountry: addressData.addressCountry || 'Kenya',
                            lat: addressData.lat || 0,
                            lng: addressData.lng || 0,
                            mapSnapshotUrl: addressData.mapSnapshotUrl || '',
                        }
                    }))
                    return Promise.resolve()
                }}
            />
        </div >
    )
}
