"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useBusiness } from "@/contexts/BusinessContext";
import {
    Users, UserPlus, Shield, CheckCircle2,
    Mail, Search, Trash2, Edit2, X, AlertCircle, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function UsersPage() {
    const { data: session } = useSession();
    const { currentBusiness, updateBusiness, isLoading } = useBusiness();

    const [searchQuery, setSearchQuery] = useState("");
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    // Invite Form State
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState<"Owner" | "Admin" | "Staff">("Staff");
    const [inviteName, setInviteName] = useState("");
    const [isInviting, setIsInviting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Get members from business or initialize with owner
    const members = currentBusiness?.teamMembers || [];

    // On mount, if no members exist, seed the owner. In a real app, this might be handled on backend creation.
    useEffect(() => {
        if (!isLoading && currentBusiness && members.length === 0 && session?.user?.email) {
            const ownerMember = {
                id: crypto.randomUUID(),
                name: session.user.name || "Business Owner",
                email: session.user.email,
                role: "Owner" as const,
                status: "Active" as const,
                avatar: session.user.image || "",
                lastActive: "Just now"
            };
            updateBusiness({ teamMembers: [ownerMember] });
        }
    }, [isLoading, currentBusiness, members.length, session, updateBusiness]);

    const displayMembers = members.length > 0 ? members : (session?.user?.email ? [{
        id: "temp-owner",
        name: session.user.name || "Business Owner",
        email: session.user.email,
        role: "Owner" as const,
        status: "Active" as const,
        avatar: session.user.image || "",
        lastActive: "Just now"
    }] : []);

    const activeMembers = displayMembers.filter(m => m.status === "Active");
    const pendingMembers = displayMembers.filter(m => m.status === "Pending");

    const filteredMembers = displayMembers.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getRoleColor = (role: string) => {
        switch (role) {
            case "Owner": return "bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-[var(--color-primary)]/20";
            case "Admin": return "bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] border-[var(--color-secondary)]/20";
            case "Staff": return "bg-[var(--color-tertiary)]/10 text-[var(--color-tertiary)] border-[var(--color-tertiary)]/20";
            default: return "bg-[var(--color-surface-variant)]/50 text-[var(--color-on-surface-variant)] border-[var(--color-outline-variant)]/20";
        }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail || !inviteName) {
            setError("Name and Email are required");
            return;
        }

        if (members.some(m => m.email.toLowerCase() === inviteEmail.toLowerCase())) {
            setError("User is already a member or invited.");
            return;
        }

        setIsInviting(true);
        setError(null);

        const newMember = {
            id: crypto.randomUUID(),
            name: inviteName,
            email: inviteEmail,
            role: inviteRole,
            status: "Pending" as const,
            invitedAt: new Date().toISOString()
        };

        const success = await updateBusiness({
            teamMembers: [...members, newMember]
        });

        if (success) {
            setIsInviteModalOpen(false);
            setInviteEmail("");
            setInviteName("");
            setInviteRole("Staff");
        } else {
            setError("Failed to send invitation. Please try again.");
        }
        setIsInviting(false);
    };

    const handleRemoveMember = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to remove ${name} from your business?`)) {
            const updatedMembers = members.filter(m => m.id !== id);
            await updateBusiness({ teamMembers: updatedMembers });
        }
    };

    const handleResendInvite = (email: string) => {
        alert(`Invitation link resent to ${email}`);
    };

    const handleRoleChange = async (id: string, newRole: "Owner" | "Admin" | "Staff") => {
        const updatedMembers = members.map(m =>
            m.id === id ? { ...m, role: newRole } : m
        );
        await updateBusiness({ teamMembers: updatedMembers });
    };

    if (isLoading) return <div className="p-8"><div className="w-full h-64 rounded-3xl bg-[var(--color-surface-container-low)] animate-pulse" /></div>;

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--color-on-surface)]">Team & Users</h1>
                    <p className="text-sm font-medium text-[var(--color-on-surface-variant)] opacity-60">Manage your business members and their access levels.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => setIsInviteModalOpen(true)}
                        className="h-14 px-6 rounded-[var(--radius-m3-xl)] gap-2 shadow-sm font-bold bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity"
                    >
                        <UserPlus size={18} /> Invite Member
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-[var(--radius-m3-2xl)] bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 shadow-[var(--shadow-m3-1)] flex flex-col gap-4 group hover:shadow-[var(--shadow-m3-2)] transition-shadow">
                    <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                            <Users size={24} />
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-black text-[var(--color-on-surface)] tracking-tight">{displayMembers.length}</div>
                        <div className="text-sm font-bold text-[var(--color-on-surface-variant)] opacity-60">Total Members</div>
                    </div>
                </div>

                <div className="p-6 rounded-[var(--radius-m3-2xl)] bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 shadow-[var(--shadow-m3-1)] flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--color-tertiary)]/10 text-[var(--color-tertiary)] flex items-center justify-center">
                            <CheckCircle2 size={24} />
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-black text-[var(--color-on-surface)] tracking-tight">{activeMembers.length}</div>
                        <div className="text-sm font-bold text-[var(--color-on-surface-variant)] opacity-60">Active</div>
                    </div>
                </div>

                <div className="p-6 rounded-[var(--radius-m3-2xl)] bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 shadow-[var(--shadow-m3-1)] flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] flex items-center justify-center">
                            <Mail size={24} />
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-black text-[var(--color-on-surface)] tracking-tight">{pendingMembers.length}</div>
                        <div className="text-sm font-bold text-[var(--color-on-surface-variant)] opacity-60">Pending Invites</div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 rounded-[2rem] overflow-hidden shadow-[var(--shadow-m3-1)] space-y-6 pb-6">

                {/* Toolbox */}
                <div className="p-6 sm:p-8 pb-0 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <h3 className="text-lg font-black text-[var(--color-on-surface)]">Directory</h3>

                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] opacity-50" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 rounded-xl bg-[var(--color-surface-container)] text-sm font-medium border-transparent focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all placeholder:opacity-50"
                        />
                    </div>
                </div>

                {/* Team Members List */}
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="border-b border-[var(--color-outline-variant)]/10">
                                <th className="px-8 py-4 text-xs font-black text-[var(--color-on-surface-variant)] opacity-60 uppercase tracking-widest bg-[var(--color-surface-container)]/30">Member Details</th>
                                <th className="px-8 py-4 text-xs font-black text-[var(--color-on-surface-variant)] opacity-60 uppercase tracking-widest bg-[var(--color-surface-container)]/30">Role</th>
                                <th className="px-8 py-4 text-xs font-black text-[var(--color-on-surface-variant)] opacity-60 uppercase tracking-widest bg-[var(--color-surface-container)]/30">Status</th>
                                <th className="px-8 py-4 text-xs font-black text-[var(--color-on-surface-variant)] opacity-60 uppercase tracking-widest bg-[var(--color-surface-container)]/30 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {filteredMembers.map((member) => (
                                    <motion.tr
                                        key={member.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="group border-b border-[var(--color-outline-variant)]/5 hover:bg-[var(--color-surface-container)]/40 transition-colors"
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-[var(--color-primary)]/10 flex items-center justify-center font-bold text-[var(--color-primary)] shadow-sm">
                                                    {member.avatar ? (
                                                        <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        member.name.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors">
                                                        {member.name}
                                                    </div>
                                                    <div className="text-xs font-medium text-[var(--color-on-surface-variant)] opacity-70">
                                                        {member.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            {member.role !== 'Owner' ? (
                                                <select
                                                    value={member.role}
                                                    onChange={(e) => handleRoleChange(member.id, e.target.value as "Admin" | "Staff")}
                                                    className={cn(
                                                        "h-8 px-3 rounded-md text-[11px] font-black uppercase tracking-wider border appearance-none cursor-pointer outline-none focus:ring-1 focus:ring-[var(--color-primary)] transition-colors",
                                                        getRoleColor(member.role)
                                                    )}
                                                >
                                                    <option value="Admin">Admin</option>
                                                    <option value="Staff">Staff</option>
                                                </select>
                                            ) : (
                                                <span className={cn(
                                                    "inline-flex items-center justify-center h-8 px-3 rounded-md text-[11px] font-black uppercase tracking-wider border",
                                                    getRoleColor(member.role)
                                                )}>
                                                    <Shield size={12} className="mr-1.5" />
                                                    {member.role}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "w-2 h-2 rounded-full",
                                                    member.status === 'Active' ? "bg-[var(--color-tertiary)]" : "bg-[var(--color-secondary)]"
                                                )} />
                                                <div className="text-xs font-bold text-[var(--color-on-surface-variant)]">
                                                    {member.status}
                                                    {member.status === 'Active' && member.lastActive ? (
                                                        <span className="opacity-50 block mt-0.5 text-[10px] font-medium leading-none">
                                                            Active {member.lastActive}
                                                        </span>
                                                    ) : member.status === 'Pending' && member.invitedAt && (
                                                        <span className="opacity-50 block mt-0.5 text-[10px] font-medium leading-none">
                                                            Invited {new Date(member.invitedAt).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2 pr-2">
                                                {member.status === 'Pending' && (
                                                    <button
                                                        onClick={() => handleResendInvite(member.email)}
                                                        title="Resend Invitation"
                                                        className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--color-on-surface-variant)] opacity-60 hover:opacity-100 hover:bg-[var(--color-surface-container-high)] hover:text-[var(--color-primary)] transition-all"
                                                    >
                                                        <RefreshCw size={16} />
                                                    </button>
                                                )}
                                                {member.role !== 'Owner' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleRemoveMember(member.id, member.name)}
                                                            title="Remove User"
                                                            className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--color-on-surface-variant)] opacity-60 hover:opacity-100 hover:bg-[var(--color-error)]/10 hover:text-[var(--color-error)] transition-all"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                            {filteredMembers.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-8 py-16 text-center">
                                        <div className="w-16 h-16 rounded-3xl bg-[var(--color-surface-container)] flex items-center justify-center mx-auto mb-4 text-[var(--color-on-surface-variant)] opacity-20">
                                            <Users size={32} />
                                        </div>
                                        <p className="text-sm font-bold text-[var(--color-on-surface)]">No members found</p>
                                        <p className="text-xs text-[var(--color-on-surface-variant)] opacity-60 mt-1">Try adjusting your search query.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Invite Modal Overlay */}
            <AnimatePresence>
                {isInviteModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                        onClick={() => setIsInviteModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-[var(--color-primary)] opacity-50" />
                            <div className="flex justify-between items-start mb-2">
                                <h2 className="text-2xl font-black text-[var(--color-on-surface)]">Invite Teammate</h2>
                                <button onClick={() => setIsInviteModalOpen(false)} className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] opacity-50 hover:opacity-100 transition-opacity">
                                    <X size={20} />
                                </button>
                            </div>
                            <p className="text-sm text-[var(--color-on-surface-variant)] opacity-70 mb-6">
                                Send an invitation link directly to their email address.
                            </p>

                            {error && (
                                <div className="mb-4 p-3 bg-[var(--color-error)]/10 text-[var(--color-error)] rounded-xl flex items-center gap-2 text-sm font-medium">
                                    <AlertCircle size={16} /> <span>{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleInvite} className="space-y-5 flex-1 w-full">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-60 mb-2 block">Full Name</label>
                                    <input
                                        type="text"
                                        placeholder="Colleague's Name"
                                        value={inviteName}
                                        onChange={(e) => setInviteName(e.target.value)}
                                        className="w-full h-12 px-4 rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)]/50 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all font-medium text-sm"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-60 mb-2 block">Email Address</label>
                                    <input
                                        type="email"
                                        placeholder="colleague@example.com"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        className="w-full h-12 px-4 rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)]/50 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all font-medium text-sm"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-60 mb-2 block">Assign Role</label>
                                    <div className="relative">
                                        <select
                                            value={inviteRole}
                                            onChange={(e) => setInviteRole(e.target.value as any)}
                                            className="w-full h-12 px-4 pr-10 rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)]/50 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all font-medium text-sm appearance-none"
                                        >
                                            <option value="Admin">Administrator</option>
                                            <option value="Staff">Staff Member</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[var(--color-on-surface-variant)] opacity-50">
                                            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.41 0.589966L6 5.16997L10.59 0.589966L12 1.99997L6 7.99997L0 1.99997L1.41 0.589966Z" fill="currentColor" /></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-6 border-t border-[var(--color-outline-variant)]/10 mt-6">
                                    <Button type="button" variant="text" onClick={() => setIsInviteModalOpen(false)} className="h-10 px-5 rounded-lg text-sm font-bold opacity-70">
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isInviting} className="h-10 px-6 rounded-lg text-sm font-bold shadow-sm bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity">
                                        {isInviting ? "Sending..." : "Send Invite"}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
