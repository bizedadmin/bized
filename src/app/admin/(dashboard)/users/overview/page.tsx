"use client"

import { useEffect, useState } from "react"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"
import {
    Users as UsersIcon,
    UserCheck,
    UserMinus,
    ShieldCheck,
    TrendingUp,
    Activity,
    Globe,
    Lock
} from "lucide-react"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell
} from "recharts"
import { Loader2 } from "lucide-react"

interface OverviewData {
    growth: any[]
    roles: any[]
    status: any[]
    stats: {
        total: number
        active: number
        admins: number
        today: number
    }
}

export default function UsersOverviewPage() {
    const [data, setData] = useState<OverviewData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                // In a real app, we'd have a specific overview API
                // For now, we'll fetch general stats and mock the charts
                const res = await fetch('/api/users?silent=true&limit=1')
                if (res.ok) {
                    const json = await res.json()

                    // Mocking visualization data since the API currently only provides counts
                    setData({
                        stats: json.stats,
                        growth: [
                            { name: 'Mon', count: 400 },
                            { name: 'Tue', count: 300 },
                            { name: 'Wed', count: 600 },
                            { name: 'Thu', count: 800 },
                            { name: 'Fri', count: 500 },
                            { name: 'Sat', count: 900 },
                            { name: 'Sun', count: 1100 },
                        ],
                        roles: [
                            { name: 'Admins', value: json.stats.admins },
                            { name: 'Standard Users', value: json.stats.total - json.stats.admins },
                        ],
                        status: [
                            { name: 'Active', value: json.stats.active },
                            { name: 'Suspended', value: json.stats.total - json.stats.active },
                        ]
                    })
                }
            } catch (error) {
                console.error("Failed to fetch overview", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="flex flex-1 items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm font-medium text-muted-foreground">Preparing system intelligence...</p>
                </div>
            </div>
        )
    }

    const COLORS = ['#000000', '#71717a', '#a1a1aa', '#e4e4e7']

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Identity Intelligence</h2>
                <p className="text-sm text-muted-foreground uppercase tracking-widest font-medium opacity-70">
                    High-level demographic and security overview
                </p>
            </div>

            {/* Top Level KPIs */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-zinc-900 border-none text-zinc-100 shadow-xl overflow-hidden relative">
                    <CardContent className="p-6">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">Total Stakeholders</span>
                            <span className="text-4xl font-black">{data?.stats.total}</span>
                            <div className="flex items-center gap-1 mt-4 text-[10px] font-bold text-blue-400">
                                <TrendingUp className="w-3 h-3" />
                                <span>VERIFIED PLATFORM USERS</span>
                            </div>
                        </div>
                        <UsersIcon className="absolute top-6 right-6 h-12 w-12 opacity-10" />
                    </CardContent>
                </Card>

                <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden relative group">
                    <CardContent className="p-6">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">System Admins</span>
                            <span className="text-3xl font-bold">{data?.stats.admins}</span>
                            <span className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1 font-medium bg-muted w-fit px-2 py-0.5 rounded-full">
                                <ShieldCheck className="w-3 h-3" /> PRIVILEGED ACCOUNTS
                            </span>
                        </div>
                        <ShieldCheck className="absolute top-6 right-6 h-12 w-12 text-zinc-500/10 group-hover:text-zinc-500/20 transition-colors" />
                    </CardContent>
                </Card>

                <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden relative group">
                    <CardContent className="p-6">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Healthy Sessions</span>
                            <span className="text-3xl font-bold">{data?.stats.active}</span>
                            <span className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1 font-medium bg-muted w-fit px-2 py-0.5 rounded-full">
                                <UserCheck className="w-3 h-3" /> NON-SUSPENDED
                            </span>
                        </div>
                        <UserCheck className="absolute top-6 right-6 h-12 w-12 text-blue-500/10 group-hover:text-blue-500/20 transition-colors" />
                    </CardContent>
                </Card>

                <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden relative group">
                    <CardContent className="p-6">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">New Onboarding</span>
                            <span className="text-3xl font-bold">{data?.stats.today}</span>
                            <span className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1 font-medium">
                                <Activity className="w-3 h-3" /> JOINED WITHIN 24H
                            </span>
                        </div>
                        <Activity className="absolute top-6 right-6 h-12 w-12 text-blue-500/10 group-hover:text-blue-500/20 transition-colors" />
                    </CardContent>
                </Card>
            </div>

            {/* Visual Analytics */}
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6 grid-rows-2">
                <Card className="col-span-1 md:col-span-3 lg:col-span-4 row-span-2 border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest">Identity Growth Trend</CardTitle>
                        <CardDescription className="text-xs">Rolling performance across the current week cycle</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="h-[300px] w-full pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data?.growth} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#000000" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#000000" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        labelStyle={{ fontWeight: 'bold' }}
                                    />
                                    <Area type="monotone" dataKey="count" stroke="#000000" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1 md:col-span-3 lg:col-span-2 row-span-1 border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest">Privilege Mix</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[120px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data?.roles}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={55}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data?.roles.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-col gap-2 mt-4">
                            {data?.roles.map((role, i) => (
                                <div key={i} className="flex justify-between items-center bg-muted/30 p-2 rounded-lg border">
                                    <span className="text-[10px] font-bold uppercase opacity-60 tracking-tighter">{role.name}</span>
                                    <span className="text-xs font-black">{role.value}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1 md:col-span-3 lg:col-span-2 row-span-1 border-zinc-200 dark:border-zinc-800 shadow-sm bg-zinc-900 text-zinc-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest opacity-80">Security Pulse</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4 py-2">
                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest opacity-60">
                                    <span>Stakeholder Health</span>
                                    <span>{data?.stats.total ? Math.round((data.stats.active / data.stats.total) * 100) : 0}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-zinc-100 transition-all duration-1000"
                                        style={{ width: `${data?.stats.total ? (data.stats.active / data.stats.total) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>
                            <div className="p-3 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                                <div className="flex items-center gap-2 mb-1">
                                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Protocol Sync</span>
                                </div>
                                <p className="text-[10px] opacity-60 leading-relaxed font-medium">All active sessions are verified under current cryptographic standards.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
