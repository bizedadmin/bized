"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Loader2,
    ShieldAlert,
    Search,
    Download,
    Filter,
    ChevronLeft,
    ChevronRight,
    Calendar
} from "lucide-react"

interface AuditLog {
    event_id: string
    timestamp: string
    actor: {
        email: string
        role: string
        ip?: string
    }
    action: {
        type: string
        description: string
    }
    severity: 'INFO' | 'WARNING' | 'CRITICAL'
    status: string
}

interface MetaData {
    total: number
    page: number
    limit: number
    totalPages: number
}

export default function AuditLogsPage() {
    const router = useRouter()
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [meta, setMeta] = useState<MetaData | null>(null)
    const [loading, setLoading] = useState(true)

    // Filters state
    const [search, setSearch] = useState("")
    const [severity, setSeverity] = useState("ALL")
    const [userEmail, setUserEmail] = useState("ALL")
    const [availableUsers, setAvailableUsers] = useState<{ email: string }[]>([])
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(50)
    const [fromDate, setFromDate] = useState("")
    const [toDate, setToDate] = useState("")

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch('/api/users?silent=true')
                if (res.ok) {
                    const json = await res.json()
                    setAvailableUsers(json.data)
                }
            } catch (error) {
                console.error("Failed to fetch available users", error)
            }
        }
        fetchUsers()
    }, [])

    const fetchLogs = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                search,
                severity,
                userEmail,
                from: fromDate,
                to: toDate
            })

            const res = await fetch(`/api/admin/audit?${params.toString()}`)
            if (res.ok) {
                const data = await res.json()
                setLogs(data.data)
                setMeta(data.meta)
            }
        } catch (error) {
            console.error("Failed to fetch audit logs", error)
        } finally {
            setLoading(false)
        }
    }, [page, limit, search, severity, userEmail, fromDate, toDate])

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLogs()
        }, 300) // Debounce search
        return () => clearTimeout(timer)
    }, [fetchLogs])

    const exportToCSV = () => {
        if (logs.length === 0) return

        const headers = ["Timestamp", "Actor Email", "Actor Role", "Action Type", "Description", "Severity", "Status", "Event ID"]
        const csvContent = [
            headers.join(","),
            ...logs.map(log => [
                new Date(log.timestamp).toISOString(),
                `"${log.actor.email}"`,
                log.actor.role,
                log.action.type,
                `"${log.action.description.replace(/"/g, '""')}"`,
                log.severity,
                log.status,
                log.event_id
            ].join(","))
        ].join("\n")

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement("a")
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", `audit-logs-${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Audit Logs</h2>
                    <p className="text-muted-foreground">immutable record of system events for SOC 2 Type II compliance.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={exportToCSV} disabled={logs.length === 0}>
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </Button>
                    <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        System Protected
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <Card className="border-zinc-200 dark:border-zinc-800">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-primary" />
                        <CardTitle className="text-sm font-medium">Log Filters</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search action..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value)
                                    setPage(1)
                                }}
                            />
                        </div>

                        {/* User Filter */}
                        <Select value={userEmail} onValueChange={(val) => {
                            setUserEmail(val)
                            setPage(1)
                        }}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Users" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Users</SelectItem>
                                {availableUsers.map((u) => (
                                    <SelectItem key={u.email} value={u.email}>{u.email}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Severity */}
                        <Select value={severity} onValueChange={(val) => {
                            setSeverity(val)
                            setPage(1)
                        }}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Severities" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Severities</SelectItem>
                                <SelectItem value="CRITICAL">Critical Only</SelectItem>
                                <SelectItem value="WARNING">Warnings</SelectItem>
                                <SelectItem value="INFO">Information</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Date From */}
                        <div className="relative">
                            <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="date"
                                className="pl-9"
                                value={fromDate}
                                onChange={(e) => {
                                    setFromDate(e.target.value)
                                    setPage(1)
                                }}
                            />
                        </div>

                        {/* Date To */}
                        <div className="relative">
                            <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="date"
                                className="pl-9"
                                value={toDate}
                                onChange={(e) => {
                                    setToDate(e.target.value)
                                    setPage(1)
                                }}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="w-[180px]">Timestamp</TableHead>
                                    <TableHead>Actor</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead className="w-[120px]">Event ID</TableHead>
                                    <TableHead className="text-right">Severity</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-48 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="animate-spin h-8 w-8 text-primary" />
                                                <span className="text-sm text-muted-foreground font-medium">Loading audit history...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : logs.length > 0 ? (
                                    logs.map((log) => (
                                        <TableRow
                                            key={log.event_id}
                                            className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors group"
                                            onClick={() => router.push(`/audit/${log.event_id}`)}
                                        >
                                            <TableCell className="whitespace-nowrap font-mono text-xs">
                                                <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                                                    {new Date(log.timestamp).toLocaleDateString()}
                                                </div>
                                                <div className="text-muted-foreground">
                                                    {new Date(log.timestamp).toLocaleTimeString()}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                                        {log.actor.email[0].toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-sm group-hover:text-primary transition-colors">{log.actor.email}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">{log.actor.role}</span>
                                                            <span className="text-[10px] text-zinc-400 font-mono">{log.actor.ip || '0.0.0.0'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col max-w-[300px]">
                                                    <span className="font-semibold text-sm">{log.action.type}</span>
                                                    <span className="text-xs text-muted-foreground truncate">{log.action.description}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-[10px] text-muted-foreground">
                                                {log.event_id.substring(0, 8)}...
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant={
                                                    log.severity === 'CRITICAL' ? 'destructive' :
                                                        log.severity === 'WARNING' ? 'secondary' : 'outline'
                                                } className="text-[10px] font-bold px-2 py-0">
                                                    {log.severity}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-48 text-center bg-muted/20">
                                            <div className="flex flex-col items-center gap-1">
                                                <p className="font-medium text-zinc-900 border dark:text-zinc-100">No logs found</p>
                                                <p className="text-sm text-muted-foreground">Try adjusting your filters or search criteria.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {meta && (
                        <div className="flex flex-col md:flex-row items-center justify-between px-6 py-4 border-t bg-muted/20 gap-4">
                            <div className="flex items-center gap-4">
                                <div className="text-xs text-muted-foreground whitespace-nowrap">
                                    Showing <span className="font-bold text-foreground">{(page - 1) * meta.limit + 1}</span> to <span className="font-bold text-foreground">{Math.min(page * meta.limit, meta.total)}</span> of <span className="font-bold text-foreground">{meta.total}</span> events
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">Show</span>
                                    <Select
                                        value={meta.limit.toString()}
                                        onValueChange={(val) => {
                                            // We need to add limit state to the component
                                            setLimit(parseInt(val))
                                            setPage(1)
                                        }}
                                    >
                                        <SelectTrigger className="h-7 w-[70px] text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="10">10</SelectItem>
                                            <SelectItem value="20">20</SelectItem>
                                            <SelectItem value="50">50</SelectItem>
                                            <SelectItem value="100">100</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page === 1}
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    className="h-8"
                                >
                                    <ChevronLeft className="w-4 h-4 mr-1" />
                                    Prev
                                </Button>
                                <div className="text-xs font-bold px-3">
                                    Page {page} of {meta.totalPages || 1}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page >= meta.totalPages}
                                    onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                                    className="h-8"
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
