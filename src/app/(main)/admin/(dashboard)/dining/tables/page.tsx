"use client";

import React, { useState, useEffect } from "react";
import { useBusiness } from "@/contexts/BusinessContext";
import { Plus, Users, Trash2, Edit2, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface Table {
    id: string;
    number: string | number;
    capacity: number;
    status: "Available" | "Occupied" | "Reserved" | "Dirty";
}

export default function DiningTablesPage() {
    const { currentBusiness } = useBusiness();
    const [tables, setTables] = useState<Table[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newTable, setNewTable] = useState({ number: "", capacity: "2" });

    useEffect(() => {
        if (currentBusiness?._id) {
            fetchTables();
        }
    }, [currentBusiness?._id]);

    const fetchTables = async () => {
        try {
            const res = await fetch(`/api/stores/${currentBusiness?._id}/dining/tables`);
            if (res.ok) {
                const data = await res.json();
                setTables(data.tables || []);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateTable = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/stores/${currentBusiness?._id}/dining/tables`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newTable),
            });
            if (res.ok) {
                setNewTable({ number: "", capacity: "2" });
                setIsAddOpen(false);
                fetchTables();
            }
        } catch (err) {
            console.error("Failed to create table:", err);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-zinc-500">Loading Floor Plan...</div>;

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                        <LayoutDashboard className="w-8 h-8 text-orange-500" /> Floor Plan Manager
                    </h1>
                    <p className="text-zinc-500 text-sm mt-1">Manage dining areas, table availability, and seating capacity.</p>
                </div>
                <Button onClick={() => setIsAddOpen(true)} className="gap-2 bg-orange-600 hover:bg-orange-500 shadow-xl shadow-orange-900/20">
                    <Plus className="w-4 h-4" /> Add Table
                </Button>
            </div>

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl">
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 opacity-60">Total Tables</div>
                    <div className="text-2xl font-bold text-white">{tables.length}</div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl">
                    <div className="text-[10px] font-black uppercase tracking-widest text-green-500 opacity-60">Available</div>
                    <div className="text-2xl font-bold text-white">{tables.filter(t => t.status === "Available").length}</div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl">
                    <div className="text-[10px] font-black uppercase tracking-widest text-orange-500 opacity-60">Occupied</div>
                    <div className="text-2xl font-bold text-white">{tables.filter(t => t.status === "Occupied").length}</div>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl">
                    <div className="text-[10px] font-black uppercase tracking-widest text-red-500 opacity-60">Dirty</div>
                    <div className="text-2xl font-bold text-white">{tables.filter(t => t.status === "Dirty").length}</div>
                </div>
            </div>

            {/* Grid Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {tables.map(table => (
                    <div
                        key={table.id}
                        className={cn(
                            "relative aspect-square rounded-3xl border-2 p-6 flex flex-col items-center justify-center gap-4 transition-all hover:scale-105 cursor-pointer shadow-xl",
                            table.status === "Available" ? "bg-zinc-900/50 border-zinc-800 hover:border-green-500/50" :
                                table.status === "Occupied" ? "bg-orange-500/10 border-orange-500/30 hover:border-orange-500" :
                                    table.status === "Dirty" ? "bg-red-500/10 border-red-500/30 hover:border-red-500" :
                                        "bg-zinc-900/50 border-zinc-800"
                        )}
                    >
                        <div className={cn(
                            "w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl uppercase",
                            table.status === "Available" ? "bg-green-500/20 text-green-500" :
                                table.status === "Occupied" ? "bg-orange-500/20 text-orange-500" :
                                    "bg-zinc-800 text-zinc-500"
                        )}>
                            T{table.number}
                        </div>
                        <div className="text-center">
                            <div className="text-sm font-bold text-white">Capacity: {table.capacity}</div>
                            <div className={cn(
                                "text-[10px] uppercase font-black tracking-widest",
                                table.status === "Available" ? "text-green-500" :
                                    table.status === "Occupied" ? "text-orange-500" :
                                        "text-zinc-500"
                            )}>{table.status}</div>
                        </div>

                        {/* Hover Overlay Actions */}
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover/table:opacity-100 transition-opacity">
                            <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400"><Edit2 size={14} /></button>
                        </div>
                    </div>
                ))}

                {/* Blank State Add Button */}
                <button
                    onClick={() => setIsAddOpen(true)}
                    className="aspect-square rounded-3xl border-2 border-dashed border-zinc-800 hover:border-zinc-700 flex flex-col items-center justify-center gap-2 group transition-all"
                >
                    <Plus className="w-8 h-8 text-zinc-600 group-hover:text-zinc-400 group-hover:scale-110 transition-all" />
                    <span className="text-xs uppercase font-black text-zinc-600 tracking-widest">New Table</span>
                </button>
            </div>

            {/* Simple Add Modal Overlay */}
            {isAddOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-6 flex items-center gap-2">
                            <Plus size={24} className="text-orange-500" /> Add New Table
                        </h2>
                        <form onSubmit={handleCreateTable} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-zinc-500 tracking-widest">Table Number / Name</label>
                                <input
                                    required
                                    value={newTable.number}
                                    onChange={e => setNewTable({ ...newTable, number: e.target.value })}
                                    placeholder="e.g. 15 or 'Lounge 1'"
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-zinc-500 tracking-widest">Seating Capacity</label>
                                <select
                                    value={newTable.capacity}
                                    onChange={e => setNewTable({ ...newTable, capacity: e.target.value })}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500 transition-all"
                                >
                                    {[2, 3, 4, 5, 6, 8, 10, 12].map(c => <option key={c} value={c}>{c} People</option>)}
                                </select>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                                <Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-500 uppercase tracking-widest font-black">Save Table</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
