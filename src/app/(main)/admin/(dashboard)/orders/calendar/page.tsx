"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useBusiness } from "@/contexts/BusinessContext";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Package, Truck, Clock, ShoppingBag } from "lucide-react";

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STATUS_DOT: Record<string, string> = {
    OrderPaymentDue: "bg-amber-500",
    OrderProcessing: "bg-blue-500",
    OrderShipped: "bg-violet-500",
    OrderPickupAvailable: "bg-cyan-500",
    OrderDelivered: "bg-emerald-500",
    OrderCancelled: "bg-rose-500",
};

const STATUS_BAR: Record<string, string> = {
    OrderPaymentDue: "bg-amber-500",
    OrderProcessing: "bg-blue-500",
    OrderShipped: "bg-violet-500",
    OrderPickupAvailable: "bg-cyan-500",
    OrderDelivered: "bg-emerald-500",
    OrderCancelled: "bg-rose-400",
};

const STATUS_LABEL: Record<string, string> = {
    OrderPaymentDue: "Payment Due",
    OrderProcessing: "Processing",
    OrderShipped: "Shipped",
    OrderDelivered: "Delivered",
    OrderCancelled: "Cancelled",
};

function daysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function firstDay(y: number, m: number) { return new Date(y, m, 1).getDay(); }
function toDateStr(d: Date) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }

export default function OrderCalendarPage() {
    const { currentBusiness, isLoading } = useBusiness();
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth());
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = useCallback(async () => {
        if (!currentBusiness?._id) return;
        setLoading(true);
        try {
            // Fetch a wider range (entire month +/- buffer)
            const from = new Date(year, month - 1, 1).toISOString();
            const to = new Date(year, month + 2, 0).toISOString();
            const res = await fetch(`/api/orders?storeId=${currentBusiness._id}&from=${from}&to=${to}`);
            const data = await res.json();
            setOrders(data.orders ?? []);
        } finally {
            setLoading(false);
        }
    }, [currentBusiness?._id, year, month]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); };
    const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); };

    const totals = daysInMonth(year, month) + firstDay(year, month);
    const cells = Math.ceil(totals / 7) * 7;

    const getOrdersForDay = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return orders.filter(o => {
            const d = new Date(o.createdAt);
            return toDateStr(d) === dateStr;
        });
    };

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--color-on-surface)] flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                            <CalendarIcon size={24} />
                        </div>
                        Order Calendar
                    </h1>
                    <p className="mt-2 text-sm font-medium text-[var(--color-on-surface-variant)] opacity-60 ml-[60px]">
                        Visual timeline of all orders · {orders.length} in view
                    </p>
                </div>
            </div>

            {/* Calendar card */}
            <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 rounded-[2rem] overflow-hidden shadow-[var(--shadow-m3-1)]">
                {/* Month navigation */}
                <div className="p-6 border-b border-[var(--color-outline-variant)]/10 flex items-center justify-between">
                    <button onClick={prevMonth} className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[var(--color-surface-container-high)] transition-all">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="text-center">
                        <h2 className="text-xl font-black text-[var(--color-on-surface)]">
                            {MONTH_NAMES[month]} {year}
                        </h2>
                        {loading && <p className="text-xs opacity-40 font-medium mt-0.5">Loading orders...</p>}
                    </div>
                    <button onClick={nextMonth} className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[var(--color-surface-container-high)] transition-all">
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 border-b border-[var(--color-outline-variant)]/10">
                    {DAY_NAMES.map(d => (
                        <div key={d} className="py-3 text-center text-[10px] font-black uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-40">
                            {d}
                        </div>
                    ))}
                </div>

                {/* Day cells */}
                <div className="grid grid-cols-7 auto-rows-[minmax(96px,auto)]">
                    {Array.from({ length: cells }).map((_, i) => {
                        const day = i - firstDay(year, month) + 1;
                        const isValid = day >= 1 && day <= daysInMonth(year, month);
                        const isToday = isValid && day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
                        const dayOrders = isValid ? getOrdersForDay(day) : [];

                        return (
                            <div key={i} className={`p-2 border-b border-r border-[var(--color-outline-variant)]/5 ${isValid ? "hover:bg-[var(--color-surface-container-high)]/30 transition-colors" : ""}`}>
                                {isValid && (
                                    <>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black mb-1.5 ${isToday
                                                ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                                                : "text-[var(--color-on-surface-variant)]"
                                            }`}>
                                            {day}
                                        </div>
                                        <div className="space-y-0.5">
                                            {dayOrders.slice(0, 3).map(o => (
                                                <a key={o._id} href={`/admin/orders/${o._id}`}
                                                    className={`flex items-center gap-1 ${STATUS_BAR[o.orderStatus] ?? "bg-[var(--color-surface-container)]"} rounded px-1.5 py-0.5 hover:opacity-80 transition-opacity`}>
                                                    <span className="text-[10px] font-black text-white truncate leading-none">
                                                        {o.orderNumber}
                                                    </span>
                                                </a>
                                            ))}
                                            {dayOrders.length > 3 && (
                                                <div className="text-[10px] font-black opacity-40 pl-1">+{dayOrders.length - 3} more</div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 flex-wrap">
                {Object.entries(STATUS_LABEL).map(([key, label]) => (
                    <div key={key} className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${STATUS_DOT[key]}`} />
                        <span className="text-xs font-bold opacity-50">{label}</span>
                    </div>
                ))}
            </div>

            {/* Empty state */}
            {!loading && orders.length === 0 && (
                <div className="text-center py-12 opacity-30 space-y-2">
                    <ShoppingBag size={48} className="mx-auto opacity-30" />
                    <p className="font-bold">No orders in this period.</p>
                    <p className="text-xs">Navigate to a month when orders were placed to see them here.</p>
                </div>
            )}
        </div>
    );
}
