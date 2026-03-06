"use client";

import React, { useState, useEffect } from "react";
import { useBusiness } from "@/contexts/BusinessContext";
import { Plus, Car, Search, Filter, Phone, User, History, Wrench, MoreHorizontal, Hash } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface Vehicle {
    id: string;
    make: string;
    model: string;
    year: string;
    vin: string;
    plate: string;
    customerName: string;
    customerPhone: string;
    status: string;
}

export default function AutomotiveVehiclesPage() {
    const { currentBusiness } = useBusiness();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newVehicle, setNewVehicle] = useState({
        make: "", model: "", year: "2024", vin: "", plate: "", customerName: "", customerPhone: "",
    });

    useEffect(() => {
        if (currentBusiness?._id) fetchVehicles();
    }, [currentBusiness?._id]);

    const fetchVehicles = async () => {
        try {
            const res = await fetch(`/api/stores/${currentBusiness?._id}/automotive/vehicles`);
            if (res.ok) {
                const data = await res.json();
                setVehicles(data.vehicles || []);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateVehicle = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/stores/${currentBusiness?._id}/automotive/vehicles`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newVehicle),
            });
            if (res.ok) {
                setNewVehicle({
                    make: "", model: "", year: "2024", vin: "", plate: "", customerName: "", customerPhone: "",
                });
                setIsAddOpen(false);
                fetchVehicles();
            }
        } catch (err) {
            console.error("Failed to create vehicle record:", err);
        }
    };

    const filteredVehicles = vehicles.filter(v =>
        (v.make + " " + v.model).toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.vin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) return <div className="p-8 text-center text-zinc-500">Loading Fleet Registry...</div>;

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                        <Car className="w-8 h-8 text-blue-500" /> Service Fleet Registry
                    </h1>
                    <p className="text-zinc-500 text-sm mt-1">Track vehicle service history, VIN profiles, and customer assets.</p>
                </div>
                <Button onClick={() => setIsAddOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-900/20 px-6">
                    <Plus className="w-4 h-4" /> Register Vehicle
                </Button>
            </div>

            {/* Content Filters */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search by make, model, plate, VIN or customer..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-4 py-3 text-white outline-none focus:border-blue-500 transition-all shadow-sm"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="gap-2 border-zinc-800 text-zinc-400 hover:text-white">
                    <Filter className="w-4 h-4" /> Filters
                </Button>
            </div>

            {/* Vehicle List Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVehicles.map(vehicle => (
                    <div key={vehicle.id} className="bg-zinc-900/50 border border-zinc-800/80 rounded-3xl p-6 hover:border-blue-500/50 transition-all group/card shadow-lg hover:shadow-blue-500/10 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold group-hover/card:scale-110 transition-transform">
                                <Car size={24} />
                            </div>
                            <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                vehicle.status === "ready" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                    vehicle.status === "in-service" ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                                        "bg-zinc-800 text-zinc-500 border-zinc-700"
                            )}>
                                {vehicle.status}
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-black text-white uppercase tracking-tight leading-tight">
                                    {vehicle.year} {vehicle.make} {vehicle.model}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="px-2 py-0.5 rounded-md bg-zinc-800 text-[10px] font-mono font-bold text-zinc-400 uppercase border border-zinc-700/50">
                                        {vehicle.plate}
                                    </div>
                                    <div className="text-[10px] text-zinc-600 flex items-center gap-1 font-mono">
                                        <Hash size={10} /> {vehicle.vin.substring(0, 8)}...
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-zinc-800/80 flex items-center justify-center text-zinc-500">
                                        <User size={16} />
                                    </div>
                                    <div>
                                        <div className="text-[11px] font-black uppercase text-zinc-600 tracking-widest leading-none">Customer</div>
                                        <div className="text-sm font-bold text-white mt-0.5">{vehicle.customerName}</div>
                                    </div>
                                </div>
                                <button className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-500 transition-colors"><MoreHorizontal size={18} /></button>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <Button variant="outline" className="w-full text-[10px] font-black uppercase tracking-widest h-10 gap-2 border-zinc-800/50">
                                    <History size={14} /> History
                                </Button>
                                <Button variant="outline" className="w-full text-[10px] font-black uppercase tracking-widest h-10 gap-2 border-zinc-800/50 hover:border-blue-500/50 hover:text-blue-500">
                                    <Wrench size={14} /> New Service
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredVehicles.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-zinc-900/20 rounded-[40px] border border-dashed border-zinc-800">
                    <div className="w-24 h-24 rounded-full bg-zinc-800/30 flex items-center justify-center text-zinc-600 opacity-30"><Car size={48} /></div>
                    <div className="max-w-xs">
                        <h3 className="text-white font-bold uppercase tracking-tight">No Vehicles Registered</h3>
                        <p className="text-zinc-500 text-xs mt-1">Start by adding a vehicle to track service history and technical details.</p>
                    </div>
                    <Button onClick={() => setIsAddOpen(true)} variant="outline" className="mt-4 border-dashed border-zinc-700 text-zinc-500 hover:text-white">Register First Assets</Button>
                </div>
            )}

            {/* Add Vehicle Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] w-full max-w-2xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-6 mb-8">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                <Car size={28} className="text-blue-500" /> New Vehicle Intake
                            </h2>
                            <button onClick={() => setIsAddOpen(false)} className="text-zinc-600 hover:text-white">Close</button>
                        </div>

                        <form onSubmit={handleCreateVehicle} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Year</label>
                                    <input required value={newVehicle.year} onChange={e => setNewVehicle({ ...newVehicle, year: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-all font-mono" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Make</label>
                                    <input required value={newVehicle.make} placeholder="e.g. Toyota" onChange={e => setNewVehicle({ ...newVehicle, make: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Model</label>
                                    <input required value={newVehicle.model} placeholder="e.g. Camry" onChange={e => setNewVehicle({ ...newVehicle, model: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-all" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Plate Number</label>
                                    <input required value={newVehicle.plate} placeholder="KAA 001A" onChange={e => setNewVehicle({ ...newVehicle, plate: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-all font-mono uppercase" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">VIN Number</label>
                                    <input required value={newVehicle.vin} placeholder="17-Digit VIN" onChange={e => setNewVehicle({ ...newVehicle, vin: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-all font-mono uppercase" />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-zinc-800/50">
                                <label className="text-xs font-black uppercase text-zinc-400 tracking-[0.2em] mb-4 block">Owner Information</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Customer Name</label>
                                        <input required value={newVehicle.customerName} onChange={e => setNewVehicle({ ...newVehicle, customerName: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Phone Number</label>
                                        <input required type="tel" value={newVehicle.customerPhone} onChange={e => setNewVehicle({ ...newVehicle, customerPhone: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-all" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button type="button" variant="outline" className="flex-1 rounded-2xl py-6 border-zinc-800 h-14" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                                <Button type="submit" className="flex-1 rounded-2xl py-6 bg-blue-600 hover:bg-blue-500 uppercase tracking-widest font-black text-sm h-14 shadow-xl shadow-blue-900/20">Add to Fleet</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
