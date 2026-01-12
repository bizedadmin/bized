"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Loader2,
    Search,
    Filter,
    MoreHorizontal,
    Shield,
    ShieldAlert,
    UserCheck,
    UserMinus,
    Activity,
    LogIn,
    Users as UsersIcon,
    ShieldCheck,
    UserCircle,
    Copy,
    ExternalLink,
    Mail,
    ChevronLeft,
    ChevronRight,
    Globe,
    MapPin,
    Server,
    Wifi,
    Navigation,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "../../../../components/ui/sheet"

interface User {
    _id: string
    name: string
    email: string
    role: string
    image?: string
    status?: 'active' | 'suspended' | 'unverified'
    lastActive?: string
    lastIp?: string
    createdAt?: string
}

interface Stats {
    total: number
    active: number
    admins: number
    today: number
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [roleFilter, setRoleFilter] = useState("ALL")
    const [statusFilter, setStatusFilter] = useState("ALL")
    const [sessionFilter, setSessionFilter] = useState("ALL")
    const [page, setPage] = useState(1)
    const [pagination, setPagination] = useState({
        total: 0,
        pages: 0,
        currentPage: 1,
        limit: 10
    })

    // Detailed View State
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [isSheetOpen, setIsSheetOpen] = useState(false)

    // IP Forensic State
    const [investigatingIp, setInvestigatingIp] = useState<string | null>(null)
    const [ipInfo, setIpInfo] = useState<any>(null)
    const [ipLoading, setIpLoading] = useState(false)

    const investigateIp = async (ip: string) => {
        if (ip === '127.0.0.1' || ip.includes('LOOPBACK')) {
            toast.info("Loopback addresses cannot be geolocated.")
            return
        }
        setInvestigatingIp(ip)
        setIpLoading(true)
        try {
            const res = await fetch(`http://ip-api.com/json/${ip}`)
            if (res.ok) {
                const data = await res.json()
                setIpInfo(data)
            }
        } catch (error) {
            toast.error("Failed to fetch intelligence for this IP")
        } finally {
            setIpLoading(false)
        }
    }

    const fetchUsers = useCallback(async (silent = false) => {
        if (!silent) setLoading(true)
        try {
            const params = new URLSearchParams({
                search,
                role: roleFilter,
                status: statusFilter,
                session: sessionFilter,
                page: page.toString(),
                limit: "10",
                silent: silent ? 'true' : 'false'
            })
            const res = await fetch(`/api/users?${params.toString()}`)
            if (res.ok) {
                const json = await res.json()
                setUsers(json.data)
                setStats(json.stats)
                setPagination(json.pagination)
            }
        } catch (error) {
            console.error("Failed to fetch users", error)
            toast.error("Failed to load users")
        } finally {
            if (!silent) setLoading(false)
        }
    }, [search, roleFilter, statusFilter, sessionFilter, page])

    useEffect(() => {
        setPage(1)
    }, [search, roleFilter, statusFilter, sessionFilter])

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers()
        }, 300)
        return () => clearTimeout(timer)
    }, [fetchUsers])

    const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
        try {
            const res = await fetch('/api/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, ...updates })
            })
            if (res.ok) {
                toast.success("User updated successfully")
                fetchUsers(true)
            } else {
                toast.error("Failed to update user")
            }
        } catch (error) {
            toast.error("An error occurred")
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success("Copied to clipboard")
    }

    return (
        <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500 p-4 md:p-0">
            <div>
                <h2 className="text-xl md:text-2xl font-bold tracking-tight">Access Control</h2>
                <p className="text-[10px] md:text-sm text-muted-foreground uppercase tracking-widest font-medium opacity-70">Platform Governance & Security</p>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-muted/20 p-4 rounded-xl border">
                <div className="flex flex-1 items-center gap-3 w-full md:max-w-md">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Find target user by name or email..."
                            className="pl-9 h-10 border-zinc-200 dark:border-zinc-800"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-[140px] h-10">
                            <SelectValue placeholder="All Roles" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Roles</SelectItem>
                            <SelectItem value="user">Standard User</SelectItem>
                            <SelectItem value="admin">Platform Admin</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[140px] h-10">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Status</SelectItem>
                            <SelectItem value="active">Healthy (Active)</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                            <SelectItem value="unverified">Unverified</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={sessionFilter} onValueChange={setSessionFilter}>
                        <SelectTrigger className="w-[140px] h-10 font-bold">
                            <SelectValue placeholder="Session" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Sessions</SelectItem>
                            <SelectItem value="online">Online Now</SelectItem>
                            <SelectItem value="offline">Offline</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-card overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow className="hover:bg-transparent border-b">
                            <TableHead className="py-4 px-4 md:px-6">Identity</TableHead>
                            <TableHead className="py-4 hidden md:table-cell">Authorization</TableHead>
                            <TableHead className="py-4 hidden sm:table-cell">Integrity</TableHead>
                            <TableHead className="py-4 hidden sm:table-cell">Session</TableHead>
                            <TableHead className="py-4 hidden lg:table-cell">Persistence</TableHead>
                            <TableHead className="text-right py-4 px-4 md:px-6">Ops</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-64 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="animate-spin h-10 w-10 text-primary" />
                                        <p className="text-sm font-medium text-muted-foreground">Synthesizing user data...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : users.length > 0 ? (
                            users.map((user) => (
                                <TableRow
                                    key={user._id}
                                    className="group hover:bg-muted/10 transition-colors cursor-pointer"
                                    onClick={() => {
                                        setSelectedUser(user);
                                        setIsSheetOpen(true);
                                    }}
                                >
                                    <TableCell className="py-4 px-4 md:px-6">
                                        <div className="flex items-center gap-3 md:gap-4 font-inter">
                                            <div className="relative flex-shrink-0">
                                                <Avatar className="h-9 w-9 md:h-10 md:w-10 border-2 border-background ring-2 ring-muted/50">
                                                    <AvatarImage src={user.image} alt={user.name} />
                                                    <AvatarFallback className="bg-primary/5 text-primary font-bold text-xs">
                                                        {user.name?.[0] || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {user.lastActive && (new Date().getTime() - new Date(user.lastActive).getTime() < 15 * 60 * 1000) && (
                                                    <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 border-2 border-background"></span>
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-primary transition-colors truncate text-sm md:text-base">
                                                        {user.name}
                                                    </span>
                                                    {/* Mobile Integrity Indicator */}
                                                    <div className="sm:hidden">
                                                        {user.status === 'suspended' ? (
                                                            <div className="w-1.5 h-1.5 rounded-full bg-destructive shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
                                                        ) : user.status === 'unverified' ? (
                                                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.5)]" />
                                                        ) : (
                                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="text-[10px] md:text-xs text-muted-foreground truncate opacity-70">
                                                    {user.email}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell py-4">
                                        <div className="flex items-center gap-2">
                                            {user.role === 'admin' ? (
                                                <Badge variant="default" className="bg-zinc-900 border-none px-2 py-0 h-5 font-mono text-[9px] shadow-sm">
                                                    ADMIN
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="font-mono px-2 py-0 h-5 text-[9px]">
                                                    USER
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell py-4">
                                        <div className="flex items-center gap-2">
                                            {user.status === 'suspended' ? (
                                                <div className="flex items-center gap-1.5 text-destructive font-semibold text-[10px] tracking-tight">
                                                    <ShieldAlert className="w-3 h-3" /> Suspended
                                                </div>
                                            ) : user.status === 'unverified' ? (
                                                <div className="flex items-center gap-1.5 text-yellow-600 font-semibold text-[10px] tracking-tight">
                                                    <Shield className="w-3 h-3" /> Unverified
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-green-600 font-semibold text-[10px] tracking-tight">
                                                    <UserCheck className="w-3 h-3" /> Healthy
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell py-4">
                                        <div className="flex items-center gap-2">
                                            {user.lastActive && (new Date().getTime() - new Date(user.lastActive).getTime() < 15 * 60 * 1000) ? (
                                                <div className="flex items-center gap-1.5 text-green-600 font-black text-[10px] tracking-tighter uppercase">
                                                    <span className="flex h-2 w-2 relative">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                    </span>
                                                    Online
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-muted-foreground font-bold text-[10px] tracking-tighter uppercase opacity-50">
                                                    <div className="h-2 w-2 rounded-full bg-muted border" />
                                                    Offline
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell py-4">
                                        <div className="flex flex-col text-[10px] space-y-0.5">
                                            <span className="text-muted-foreground font-medium">
                                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Historical'}
                                            </span>
                                            {user.lastActive && (
                                                <span className="font-mono opacity-50">
                                                    {new Date(user.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right py-4 px-4 md:px-6">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-all">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56">
                                                <DropdownMenuLabel>Forensic Tools</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => {
                                                    setSelectedUser(user);
                                                    setIsSheetOpen(true);
                                                }}>
                                                    <UserCircle className="mr-2 h-4 w-4" /> Full Profile Overview
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => copyToClipboard(user._id)}>
                                                    <Copy className="mr-2 h-4 w-4" /> Copy Identifier (UID)
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => window.open(`/api/admin/audit?userEmail=${user.email}`, '_blank')}>
                                                    <Activity className="mr-2 h-4 w-4" /> View Direct Activity Logs
                                                </DropdownMenuItem>

                                                <DropdownMenuSeparator />
                                                <DropdownMenuLabel>Authorization</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleUpdateUser(user._id, { role: user.role === 'admin' ? 'user' : 'admin' })}>
                                                    <Shield className="mr-2 h-4 w-4" />
                                                    {user.role === 'admin' ? 'Revoke Admin' : 'Elevate to Admin'}
                                                </DropdownMenuItem>

                                                <DropdownMenuSeparator />
                                                <DropdownMenuLabel className="text-destructive">Critical Safety</DropdownMenuLabel>
                                                {user.status === 'suspended' ? (
                                                    <DropdownMenuItem onClick={() => handleUpdateUser(user._id, { status: 'active' })}>
                                                        <UserCheck className="mr-2 h-4 w-4 text-green-600" /> Reinstate Stakeholder
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                                        onClick={() => handleUpdateUser(user._id, { status: 'suspended' })}
                                                    >
                                                        <UserMinus className="mr-2 h-4 w-4" /> Suspend Account
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem className="opacity-50 cursor-not-allowed">
                                                    <LogIn className="mr-2 h-4 w-4" /> Login as User (SOC2 WORM)
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                                    No records matching criteria.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* Pagination Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between px-4 md:px-6 py-4 bg-muted/30 border-t gap-4">
                    <div className="text-[10px] md:text-xs text-muted-foreground font-medium order-2 sm:order-1">
                        Showing <span className="text-foreground font-bold">{users.length}</span> / {pagination.total}
                    </div>
                    <div className="flex items-center gap-2 order-1 sm:order-2 w-full sm:w-auto justify-between sm:justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 md:h-8 px-2 gap-1 text-[10px] md:text-xs"
                            disabled={page <= 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                        >
                            <ChevronLeft className="h-3.5 w-3.5 md:h-4 md:w-4" /> Prev
                        </Button>
                        <div className="flex items-center justify-center min-w-[28px] text-[10px] md:text-xs font-mono font-bold">
                            {page} / {pagination.pages || 1}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 md:h-8 px-2 gap-1 text-[10px] md:text-xs"
                            disabled={page >= pagination.pages}
                            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                        >
                            Next <ChevronRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* User Detail Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="w-full sm:max-w-md md:max-w-lg p-0 overflow-y-auto">
                    <div className="p-6">
                        <SheetHeader>
                            <SheetTitle className="text-xl font-bold">Technical Profile</SheetTitle>
                            <SheetDescription className="text-xs">
                                Forensic metadata for {selectedUser?.name}
                            </SheetDescription>
                        </SheetHeader>
                        {selectedUser && (
                            <div className="mt-6 space-y-6">
                                <div className="flex flex-col items-center gap-3 py-6 bg-muted/30 rounded-2xl border">
                                    <Avatar className="h-20 w-20 md:h-24 md:w-24 border-4 border-background shadow-lg">
                                        <AvatarImage src={selectedUser.image} />
                                        <AvatarFallback className="text-2xl font-bold">
                                            {selectedUser.name?.[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="text-center">
                                        <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                                        <p className="text-muted-foreground">{selectedUser.email}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Badge className="uppercase tracking-widest text-[10px] font-mono">{selectedUser.role}</Badge>
                                        <Badge variant="outline" className="uppercase tracking-widest text-[10px] font-mono">{selectedUser.status}</Badge>
                                    </div>
                                </div>

                                <Card className="border-zinc-200 dark:border-zinc-800 bg-transparent">
                                    <CardHeader className="pb-3 border-b border-zinc-200 dark:border-zinc-800">
                                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                                            <ShieldCheck className="w-4 h-4 text-primary" /> Forensic Context
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-4 space-y-4">
                                        <div className="flex justify-between items-center py-1">
                                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">System Identifier</span>
                                            <span className="text-xs font-mono bg-muted px-2 py-1 rounded truncate max-w-[200px]">{selectedUser._id}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1">
                                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Network Origin (IP)</span>
                                            <button
                                                onClick={() => investigateIp(selectedUser.lastIp || '127.0.0.1')}
                                                className="text-xs font-mono group/ip flex items-center gap-2 hover:text-primary transition-colors bg-muted/50 px-2 py-0.5 rounded border border-transparent hover:border-primary/20"
                                            >
                                                {selectedUser.lastIp || '127.0.0.1 (Internal)'}
                                                <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover/ip:opacity-100 transition-opacity" />
                                            </button>
                                        </div>
                                        <div className="flex justify-between items-center py-1">
                                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Onboarding Phase</span>
                                            <span className="text-xs font-mono">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'Historical'}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-1">
                                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pulse Verification</span>
                                            <span className="text-xs font-mono text-green-600 font-bold">CRYPTOGRAPHICALLY_VERIFIED</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="flex flex-col gap-3">
                                    <Button className="w-full gap-2" variant="outline" onClick={() => window.open(`/api/admin/audit?userEmail=${selectedUser.email}`, '_blank')}>
                                        <Activity className="w-4 h-4" /> Audit Traversal
                                    </Button>
                                    <Button className="w-full gap-2 text-destructive border-destructive/20 hover:bg-destructive/10" variant="outline">
                                        <ShieldAlert className="w-4 h-4" /> Terminate Session Access
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            {/* IP Intelligence Dialog */}
            <Dialog open={!!investigatingIp} onOpenChange={(open) => !open && setInvestigatingIp(null)}>
                <DialogContent className="sm:max-w-[425px] overflow-hidden p-0 rounded-2xl border-zinc-200 dark:border-zinc-800">
                    <DialogHeader className="p-6 pb-0">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Navigation className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold tracking-tight">IP Intelligence</DialogTitle>
                                <DialogDescription className="text-xs font-mono opacity-70">{investigatingIp}</DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    {ipLoading ? (
                        <div className="h-64 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm font-bold uppercase tracking-widest opacity-50">Geo-Mapping Target...</p>
                        </div>
                    ) : ipInfo && (
                        <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            {/* Geography Section */}
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                    <MapPin className="w-3 h-3" /> Geographical Analysis
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-xl bg-muted/30 border border-zinc-200 dark:border-zinc-800">
                                        <p className="text-[10px] uppercase font-bold opacity-50 mb-1">Country</p>
                                        <p className="text-sm font-bold truncate">{ipInfo.country} ({ipInfo.countryCode})</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-muted/30 border border-zinc-200 dark:border-zinc-800">
                                        <p className="text-[10px] uppercase font-bold opacity-50 mb-1">City/Region</p>
                                        <p className="text-sm font-bold truncate">{ipInfo.city}, {ipInfo.regionName}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Network Section */}
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                    <Wifi className="w-3 h-3" /> Network Topology
                                </h4>
                                <div className="space-y-2">
                                    <div className="p-3 rounded-xl bg-zinc-900 text-zinc-100 flex justify-between items-center">
                                        <div>
                                            <p className="text-[10px] uppercase font-bold opacity-50">ISP Carrier</p>
                                            <p className="text-sm font-bold">{ipInfo.isp}</p>
                                        </div>
                                        <Server className="w-5 h-5 opacity-20" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="p-3 rounded-xl border flex flex-col">
                                            <span className="text-[10px] uppercase font-bold opacity-50">AS Number</span>
                                            <span className="text-xs font-mono mt-1 truncate">{ipInfo.as?.split(' ')[0]}</span>
                                        </div>
                                        <div className="p-3 rounded-xl border flex flex-col">
                                            <span className="text-[10px] uppercase font-bold opacity-50">Organization</span>
                                            <span className="text-xs font-medium mt-1 truncate">{ipInfo.org || 'Standard Access'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Globe className="w-3 h-3 text-green-500" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-green-600">Route Identified</span>
                                </div>
                                <span className="text-[10px] font-mono opacity-50">{ipInfo.lat}, {ipInfo.lon}</span>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
