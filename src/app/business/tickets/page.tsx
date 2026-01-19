"use client"

import { useState, useEffect } from "react"
import {
    Calendar as CalendarIcon,
    List,
    Search,
    Filter,
    Plus,
    Clock,
    User,
    CheckCircle2,
    XCircle,
    AlertCircle,
    MoreHorizontal,
    Mail,
    Phone,
    MapPin,
    ArrowUpRight,
    DollarSign,
    CalendarDays,
    Loader2,
    ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose
} from "@/components/ui/sheet"
import {
    ChevronLeft,
    ChevronRight,
} from "lucide-react"
import {
    Card,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// Separator removed
import { cn } from "@/lib/utils"

interface Ticket {
    _id: string
    status: string
    customerName: string
    customerEmail: string
    customerPhone?: string
    serviceId?: {
        name: string
    }
    date: string
    startTime: string
    endTime: string
    totalPrice: number
    currency: string
    notes?: string
}

export default function TicketsPage() {
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [updatingTicketId, setUpdatingTicketId] = useState<string | null>(null)
    const [selectedService, setSelectedService] = useState<string>('all')
    const [isServiceFilterOpen, setIsServiceFilterOpen] = useState(false)
    const [serviceSearch, setServiceSearch] = useState("")

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    // Calendar State
    const [currentMonth, setCurrentMonth] = useState(new Date())

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        const firstDayOfMonth = new Date(year, month, 1).getDay()
        return { daysInMonth, firstDayOfMonth }
    }

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
    }

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
    }

    useEffect(() => {
        const fetchTickets = async () => {
            const stored = localStorage.getItem("selectedBusiness");
            if (!stored) return;
            const business = JSON.parse(stored);

            try {
                const res = await fetch(`/api/business/tickets?businessId=${business._id}`)
                if (res.ok) {
                    const data = await res.json()
                    setTickets(data)
                }
            } catch (error) {
                console.error("Failed to fetch tickets", error)
            } finally {
                setLoading(false)
            }
        }
        fetchTickets()
    }, [])

    // Filter Logic
    // Filter Logic
    const uniqueServices = Array.from(new Set(tickets.map(t => t.serviceId?.name).filter(Boolean))) as string[]

    const filteredServices = uniqueServices.filter(service =>
        service.toLowerCase().includes(serviceSearch.toLowerCase())
    )

    const filteredTickets = tickets.filter(ticket => {
        if (selectedService !== 'all' && ticket.serviceId?.name !== selectedService) return false
        return true
    })

    // Stats Calculation
    const totalTickets = filteredTickets.length
    const pendingTickets = filteredTickets.filter(t => t.status === 'pending').length
    const confirmedTickets = filteredTickets.filter(t => t.status === 'confirmed').length
    const totalRevenue = filteredTickets.reduce((acc, t) => acc + (t.totalPrice || 0), 0)

    // Pagination Logic
    const totalPages = Math.ceil(totalTickets / itemsPerPage)
    const paginatedTickets = filteredTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1)
        }
    }

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1)
        }
    }

    const handleViewTicket = (ticket: any) => {
        setSelectedTicket(ticket)
        setIsSheetOpen(true)
    }

    const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
        setUpdatingTicketId(ticketId)
        try {
            const res = await fetch(`/api/business/tickets/${ticketId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            })

            if (res.ok) {
                // Update local state
                setTickets(prev => prev.map(t =>
                    t._id === ticketId ? { ...t, status: newStatus } : t
                ))
                if (selectedTicket && selectedTicket._id === ticketId) {
                    setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : null)
                }
            } else {
                console.error("Failed to update status")
            }
        } catch (error) {
            console.error("Error updating status:", error)
        } finally {
            setUpdatingTicketId(null)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800'
            case 'pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800'
            case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'
            default: return 'bg-muted text-muted-foreground border-border'
        }
    }

    return (
        <div className="p-4 space-y-4 max-w-[1600px] mx-auto font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-foreground">Tickets</h1>
                    <p className="text-sm text-muted-foreground mt-1 font-medium">Manage your appointments and bookings.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-muted p-1 rounded-lg flex gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewMode('list')}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-md transition-all text-sm font-medium",
                                viewMode === 'list'
                                    ? "bg-background shadow-sm text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <List className="w-4 h-4" />
                            List
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewMode('calendar')}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-md transition-all text-sm font-medium",
                                viewMode === 'calendar'
                                    ? "bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-50"
                                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
                            )}
                        >
                            <CalendarIcon className="w-4 h-4" />
                            Calendar
                        </Button>
                    </div>
                    <Button className="font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
                        <Plus className="w-4 h-4 mr-2" />
                        New Ticket
                    </Button>
                </div>
            </div>

            {/* Stats Cards - Moved to Overview Page */}

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-3 items-center bg-card p-3 rounded-xl border border-border shadow-sm">
                <div className="relative flex-1 w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search tickets..."
                        className="pl-9 h-9 border-border bg-muted/50 rounded-lg focus:ring-ring text-sm"
                    />
                </div>
                <div className="w-px h-6 bg-border hidden md:block"></div>
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                    <Dialog open={isServiceFilterOpen} onOpenChange={setIsServiceFilterOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="h-9 border-border bg-background text-sm font-medium">
                                <Filter className="w-3.5 h-3.5 mr-2" />
                                {selectedService === 'all' ? 'All Services' : selectedService}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Filter by Service</DialogTitle>
                                <DialogDescription>
                                    Select a service to filter the tickets list.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Input
                                        placeholder="Search services..."
                                        value={serviceSearch}
                                        onChange={(e) => setServiceSearch(e.target.value)}
                                        className="h-9"
                                    />
                                </div>
                                <RadioGroup value={selectedService} onValueChange={setSelectedService} className="gap-3 max-h-[200px] overflow-y-auto">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="all" id="all" />
                                        <Label htmlFor="all">All Services</Label>
                                    </div>
                                    {filteredServices.map((service) => (
                                        <div key={service} className="flex items-center space-x-2">
                                            <RadioGroupItem value={service} id={service} />
                                            <Label htmlFor={service}>{service}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>
                            <DialogFooter>
                                <Button onClick={() => setIsServiceFilterOpen(false)}>Apply Filter</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Select defaultValue="all">
                        <SelectTrigger className="w-[120px] h-9 rounded-lg border-border font-medium bg-background text-sm">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select defaultValue="week">
                        <SelectTrigger className="w-[120px] h-9 rounded-lg border-border font-medium bg-background text-sm">
                            <SelectValue placeholder="Period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="tomorrow">Tomorrow</SelectItem>
                            <SelectItem value="week">This Week</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Content Area */}
            {viewMode === 'list' && (
                <Card className="border-border shadow-sm bg-card overflow-hidden rounded-2xl">
                    <div className="overflow-x-auto">
                        {tickets.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-center p-16">
                                <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                                    <CalendarIcon className="w-10 h-10 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground">No tickets found</h3>
                                <p className="text-muted-foreground max-w-sm mt-3 mb-8 leading-relaxed">
                                    You don't have any bookings matching your criteria.
                                </p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow className="hover:bg-transparent border-border">
                                        <TableHead className="w-[200px] sm:w-[250px] font-semibold text-muted-foreground h-10 text-xs pl-4">Customer</TableHead>
                                        <TableHead className="font-semibold text-muted-foreground h-10 text-xs hidden sm:table-cell">Service</TableHead>
                                        <TableHead className="font-semibold text-muted-foreground h-10 text-xs">Date & Time</TableHead>
                                        <TableHead className="font-semibold text-muted-foreground h-10 text-xs shadow-none">Status</TableHead>
                                        <TableHead className="font-semibold text-muted-foreground text-right pr-4 sm:pr-6 h-10 text-xs hidden sm:table-cell">Amount</TableHead>
                                        <TableHead className="w-[40px] h-10"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedTickets.map((ticket) => (
                                        <TableRow key={ticket._id} className="cursor-pointer hover:bg-muted/50 border-border/50 h-14" onClick={() => handleViewTicket(ticket)}>

                                            <TableCell className="font-medium py-2 pl-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8 bg-muted border border-border shrink-0">
                                                        <AvatarFallback className="bg-muted text-muted-foreground text-[10px] font-bold">
                                                            {ticket.customerName.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-sm font-semibold text-foreground leading-tight truncate">
                                                            {ticket.customerName}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground font-medium truncate">
                                                            {ticket.customerEmail}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-2 hidden sm:table-cell">
                                                <span className="text-xs font-medium text-foreground">
                                                    {ticket.serviceId?.name || 'Unknown Service'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-2">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                                                        <CalendarIcon className="w-3 h-3 text-muted-foreground" />
                                                        {new Date(ticket.date).toLocaleDateString()}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                                                        <Clock className="w-3 h-3 text-muted-foreground" />
                                                        {ticket.startTime} - {ticket.endTime}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-2">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                        <Button
                                                            variant="ghost"
                                                            className={cn(
                                                                "h-auto p-0 hover:bg-transparent",
                                                                "focus-visible:ring-0 focus-visible:ring-offset-0"
                                                            )}
                                                        >
                                                            <Badge variant="outline" className={cn("w-[110px] justify-between rounded-md px-2.5 py-0.5 font-bold border cursor-pointer transition-opacity hover:opacity-80 flex items-center", getStatusColor(ticket.status))}>
                                                                <div className="flex items-center gap-1.5">
                                                                    {updatingTicketId === ticket._id && <Loader2 className="h-3 w-3 animate-spin" />}
                                                                    {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                                                                </div>
                                                                <ChevronDown className="w-3 h-3 opacity-50" />
                                                            </Badge>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
                                                        <DropdownMenuItem onClick={() => handleUpdateStatus(ticket._id, 'pending')}>
                                                            <Clock className="mr-2 h-4 w-4 text-amber-500" />
                                                            Pending
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleUpdateStatus(ticket._id, 'confirmed')}>
                                                            <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                                                            Confirmed
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleUpdateStatus(ticket._id, 'cancelled')}>
                                                            <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                                            Cancelled
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                            <TableCell className="text-right pr-4 sm:pr-6 font-bold text-foreground py-2 text-sm hidden sm:table-cell">
                                                {ticket.currency} {ticket.totalPrice.toLocaleString()}
                                            </TableCell>
                                            <TableCell onClick={(e) => e.stopPropagation()} className="py-2">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-[160px]">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => handleViewTicket(ticket)}>
                                                            View details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>Start chat</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => handleUpdateStatus(ticket._id, 'confirmed')}>
                                                            Mark Confirmed
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleUpdateStatus(ticket._id, 'pending')}>
                                                            Mark Pending
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                            onClick={() => handleUpdateStatus(ticket._id, 'cancelled')}
                                                        >
                                                            Cancel booking
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                    {tickets.length > 0 && (
                        <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
                            <div className="text-sm text-muted-foreground font-medium">
                                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalTickets)}-{Math.min(currentPage * itemsPerPage, totalTickets)} of {totalTickets} tickets
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 1}
                                    className="h-8 border-border font-medium"
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                    className="h-8 border-border font-medium"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>
            )}

            {viewMode === 'calendar' && (
                <Card className="border-border shadow-sm bg-card rounded-2xl p-6 min-h-[600px]">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-bold text-foreground">
                                {currentMonth.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                            </h2>
                            <div className="flex items-center rounded-md border border-border bg-background">
                                <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 hover:bg-muted">
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div className="w-px h-8 bg-border"></div>
                                <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 hover:bg-muted">
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden border border-border">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="bg-muted p-4 text-center font-bold text-xs uppercase text-muted-foreground">
                                {day}
                            </div>
                        ))}

                        {Array.from({ length: getDaysInMonth(currentMonth).firstDayOfMonth }).map((_, i) => (
                            <div key={`empty-${i}`} className="bg-card/50 min-h-[120px] p-3 border-b border-r border-border last:border-r-0" />
                        ))}

                        {Array.from({ length: getDaysInMonth(currentMonth).daysInMonth }).map((_, i) => {
                            const date = i + 1;
                            const currentDayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), date);
                            const dayTickets = tickets.filter(t => {
                                const tDate = new Date(t.date);
                                return tDate.getDate() === date &&
                                    tDate.getMonth() === currentMonth.getMonth() &&
                                    tDate.getFullYear() === currentMonth.getFullYear();
                            });

                            return (
                                <div key={date} className="bg-card min-h-[120px] p-3 hover:bg-muted/50 transition-colors border-b border-r border-border last:border-r-0 flex flex-col gap-2">
                                    <span className={cn(
                                        "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                                        dayTickets.length > 0 ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                                    )}>
                                        {date}
                                    </span>

                                    <div className="flex flex-col gap-1 overflow-y-auto max-h-[80px] no-scrollbar">
                                        {dayTickets.map(ticket => (
                                            <div
                                                key={ticket._id}
                                                onClick={() => handleViewTicket(ticket)}
                                                className={cn(
                                                    "text-[10px] px-2 py-1 rounded border truncate cursor-pointer transition-colors",
                                                    ticket.status === 'confirmed' ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:border-green-800" :
                                                        ticket.status === 'pending' ? "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800" :
                                                            "bg-muted text-muted-foreground border-border"
                                                )}
                                            >
                                                {ticket.startTime} - {ticket.customerName}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            )}

            {/* Details Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="sm:max-w-lg p-0 overflow-hidden flex flex-col h-full bg-white dark:bg-zinc-950 border-l-zinc-200 dark:border-l-zinc-800 shadow-2xl">
                    <div className="flex flex-col h-full">
                        {/* Header */}
                        {/* Header */}
                        <SheetHeader className="p-6 border-b border-zinc-100 dark:border-zinc-800 space-y-0 text-left">
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-1">
                                    <SheetTitle className="text-lg font-bold text-zinc-900 dark:text-white">Booking Details</SheetTitle>
                                    <SheetDescription className="text-sm text-zinc-500">
                                        ID: {selectedTicket?._id}
                                    </SheetDescription>
                                </div>
                                {selectedTicket && (
                                    <Select
                                        defaultValue={selectedTicket.status}
                                        onValueChange={(value) => handleUpdateStatus(selectedTicket._id, value)}
                                    >
                                        <SelectTrigger className={cn("w-[140px] h-8 font-bold border capitalize", getStatusColor(selectedTicket.status))}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="confirmed">Confirmed</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        </SheetHeader>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {selectedTicket && (
                                <>
                                    {/* Customer Profile */}
                                    <div className="flex items-start gap-4">
                                        <Avatar className="h-14 w-14 border border-zinc-200">
                                            <AvatarFallback className="bg-zinc-100 text-zinc-600 text-lg font-bold">
                                                {selectedTicket.customerName.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-lg text-zinc-900 dark:text-white">{selectedTicket.customerName}</h3>
                                            <div className="flex items-center gap-2 text-sm text-zinc-500">
                                                <Mail className="w-4 h-4" />
                                                {selectedTicket.customerEmail}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-zinc-500">
                                                <Phone className="w-4 h-4" />
                                                {selectedTicket.customerPhone || 'No phone provided'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-[1px] w-full bg-zinc-100 dark:bg-zinc-800" />

                                    {/* Booking Info */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Appointment Info</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-xs font-medium text-zinc-500">Date</label>
                                                <div className="flex items-center gap-2 font-medium text-zinc-900 dark:text-white">
                                                    <CalendarIcon className="w-4 h-4 text-zinc-400" />
                                                    {new Date(selectedTicket.date).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-medium text-zinc-500">Time</label>
                                                <div className="flex items-center gap-2 font-medium text-zinc-900 dark:text-white">
                                                    <Clock className="w-4 h-4 text-zinc-400" />
                                                    {selectedTicket.startTime} - {selectedTicket.endTime}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-medium text-zinc-500">Service</label>
                                                <div className="font-medium text-zinc-900 dark:text-white">
                                                    {selectedTicket.serviceId?.name || 'Unknown Service'}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-medium text-zinc-500">Price</label>
                                                <div className="font-medium text-zinc-900 dark:text-white">
                                                    {selectedTicket.currency} {selectedTicket.totalPrice}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-[1px] w-full bg-zinc-100 dark:bg-zinc-800" />

                                    {/* Notes */}
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Notes</h4>
                                        <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 text-sm text-zinc-600 dark:text-zinc-300">
                                            {selectedTicket.notes || "No additional notes provided by the customer."}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 mt-auto">
                            <div className="grid grid-cols-2 gap-3">
                                <Button variant="outline" className="w-full border-zinc-200 hover:bg-white">
                                    Reschedule
                                </Button>
                                {selectedTicket && selectedTicket.status !== 'confirmed' && (
                                    <Button
                                        className="w-full bg-zinc-900 text-white hover:bg-zinc-800"
                                        onClick={() => handleUpdateStatus(selectedTicket._id, 'confirmed')}
                                    >
                                        Check In / Confirm
                                    </Button>
                                )}
                                {selectedTicket && selectedTicket.status === 'confirmed' && (
                                    <Button
                                        className="w-full bg-blue-600 text-white hover:bg-blue-700"
                                        disabled
                                    >
                                        Checked In
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}
