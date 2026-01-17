"use client"

import { useState } from "react"
import { Calendar as CalendarIcon, List, Search, Filter, Plus, Clock, User, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function TicketsPage() {
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')

    return (
        <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Tickets</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium">Manage your appointments and bookings.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg flex gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewMode('list')}
                            className={viewMode === 'list' ? "bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-50 font-bold" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"}
                        >
                            <List className="w-4 h-4 mr-2" />
                            List
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewMode('calendar')}
                            className={viewMode === 'calendar' ? "bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-50 font-bold" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"}
                        >
                            <CalendarIcon className="w-4 h-4 mr-2" />
                            Calendar
                        </Button>
                    </div>
                    <Button className="font-bold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900">
                        <Plus className="w-4 h-4 mr-2" />
                        New Ticket
                    </Button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="relative flex-1 w-full md:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input
                        placeholder="Search by name, email, or order ID..."
                        className="pl-10 h-10 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl"
                    />
                </div>
                <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-800 hidden md:block"></div>
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                    <Select defaultValue="all">
                        <SelectTrigger className="w-[140px] h-10 rounded-xl border-zinc-200 dark:border-zinc-800 font-medium">
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
                    <Select defaultValue="today">
                        <SelectTrigger className="w-[140px] h-10 rounded-xl border-zinc-200 dark:border-zinc-800 font-medium">
                            <SelectValue placeholder="Date Range" />
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
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm min-h-[500px] flex flex-col items-center justify-center text-center p-12">
                    <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center mb-6">
                        <CalendarIcon className="w-10 h-10 text-zinc-400" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">No tickets found</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mt-3 leading-relaxed">
                        You don't have any bookings yet. Share your booking link with customers to start receiving appointments.
                    </p>
                    <Button variant="outline" className="mt-8 rounded-xl font-bold border-zinc-200 dark:border-zinc-700">
                        View Booking Page
                    </Button>
                </div>
            )}

            {viewMode === 'calendar' && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm min-h-[600px] p-8">
                    {/* Placeholder for Calendar Grid */}
                    <div className="grid grid-cols-7 gap-px bg-zinc-200 dark:bg-zinc-800 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="bg-zinc-50 dark:bg-zinc-900/50 p-4 text-center font-bold text-xs uppercase text-zinc-400">
                                {day}
                            </div>
                        ))}
                        {Array.from({ length: 35 }).map((_, i) => (
                            <div key={i} className="bg-white dark:bg-zinc-900 min-h-[100px] p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                <span className="text-sm font-medium text-zinc-400">{i + 1}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
