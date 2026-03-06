"use client";

import React, { useState, useEffect } from "react";
import { useBusiness } from "@/contexts/BusinessContext";
import { Plus, Users, Search, Filter, Phone, Mail, MoreHorizontal, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface Patient {
    id: string;
    firstName: string;
    lastName: string;
    dob: string;
    gender: string;
    phone: string;
    email: string;
    bloodGroup: string;
    status: string;
}

export default function PatientRecordsPage() {
    const { currentBusiness } = useBusiness();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newPatient, setNewPatient] = useState({
        firstName: "",
        lastName: "",
        dob: "",
        gender: "Male",
        phone: "",
        email: "",
        bloodGroup: "A+",
    });

    useEffect(() => {
        if (currentBusiness?._id) fetchPatients();
    }, [currentBusiness?._id]);

    const fetchPatients = async () => {
        try {
            const res = await fetch(`/api/stores/${currentBusiness?._id}/med/patients`);
            if (res.ok) {
                const data = await res.json();
                setPatients(data.patients || []);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreatePatient = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/stores/${currentBusiness?._id}/med/patients`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newPatient),
            });
            if (res.ok) {
                setNewPatient({
                    firstName: "", lastName: "", dob: "", gender: "Male", phone: "", email: "", bloodGroup: "A+",
                });
                setIsAddOpen(false);
                fetchPatients();
            }
        } catch (err) {
            console.error("Failed to create patient record:", err);
        }
    };

    const filteredPatients = patients.filter(p =>
        (p.firstName + " " + p.lastName).toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.phone.includes(searchQuery) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) return <div className="p-8 text-center text-zinc-500">Loading Patient Records...</div>;

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                        <Users className="w-8 h-8 text-emerald-500" /> Patient Registry
                    </h1>
                    <p className="text-zinc-500 text-sm mt-1">Manage health records, contact information, and medical history.</p>
                </div>
                <Button onClick={() => setIsAddOpen(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-500 shadow-xl shadow-emerald-900/20">
                    <Plus className="w-4 h-4" /> New Patient
                </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search by name, phone, or email..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-4 py-3 text-white outline-none focus:border-emerald-500 transition-all shadow-sm"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="gap-2 border-zinc-800 text-zinc-400 hover:text-white">
                    <Filter className="w-4 h-4" /> Filters
                </Button>
            </div>

            {/* Table Area */}
            <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl overflow-hidden backdrop-blur-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-zinc-800/50">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 opacity-60">Patient Name</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 opacity-60">DOB / Gender</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 opacity-60">Blood Group</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 opacity-60">Status</th>
                            <th className="px-6 py-4 text-right"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPatients.map(patient => (
                            <tr key={patient.id} className="border-b last:border-0 border-zinc-800/30 hover:bg-zinc-800/20 transition-colors group/row">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold group-hover/row:bg-emerald-500/20 group-hover/row:text-emerald-500 transition-all">
                                            {patient.firstName[0]}{patient.lastName[0]}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white leading-none">
                                                {patient.firstName} {patient.lastName}
                                            </div>
                                            <div className="text-xs text-zinc-500 mt-1 flex items-center gap-2">
                                                <Phone className="w-3 h-3 text-zinc-600" /> {patient.phone}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-zinc-300 font-medium">{new Date(patient.dob).toLocaleDateString()}</div>
                                    <div className="text-[10px] text-zinc-500 font-bold uppercase">{patient.gender}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 rounded-lg bg-red-500/10 text-red-500 font-bold text-xs">
                                        {patient.bloodGroup}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-black text-[10px] uppercase tracking-widest border border-emerald-500/20">
                                        {patient.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-500 transition-all"><MoreHorizontal size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Empty State */}
            {filteredPatients.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-20 h-20 rounded-full bg-zinc-800/30 flex items-center justify-center text-zinc-400 opacity-20"><Users size={40} /></div>
                    <div className="max-w-xs text-zinc-500 text-sm">No patient records found matching your search. Create one to get started.</div>
                </div>
            )}

            {/* Add Patient Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-8 flex items-center gap-3 border-b border-zinc-800 pb-4">
                            <Plus size={24} className="text-emerald-500" /> Register New Patient
                        </h2>
                        <form onSubmit={handleCreatePatient} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">First Name</label>
                                <input required value={newPatient.firstName} onChange={e => setNewPatient({ ...newPatient, firstName: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Last Name</label>
                                <input required value={newPatient.lastName} onChange={e => setNewPatient({ ...newPatient, lastName: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Date of Birth</label>
                                <input required type="date" value={newPatient.dob} onChange={e => setNewPatient({ ...newPatient, dob: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Gender</label>
                                <select value={newPatient.gender} onChange={e => setNewPatient({ ...newPatient, gender: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-all">
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Phone Number</label>
                                <input required type="tel" value={newPatient.phone} onChange={e => setNewPatient({ ...newPatient, phone: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Email Address</label>
                                <input type="email" value={newPatient.email} onChange={e => setNewPatient({ ...newPatient, email: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Blood Group</label>
                                <select value={newPatient.bloodGroup} onChange={e => setNewPatient({ ...newPatient, bloodGroup: e.target.value })} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-all">
                                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(g => <option key={g}>{g}</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-2 flex gap-4 pt-6">
                                <Button type="button" variant="outline" className="flex-1 rounded-2xl" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                                <Button type="submit" className="flex-1 rounded-2xl bg-emerald-600 hover:bg-emerald-500 uppercase tracking-widest font-black text-sm">Create Patient Record</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
