"use client";

import React from "react";
import { useBusiness } from "@/contexts/BusinessContext";
import { Shield, CheckCircle2, Lock, AlertCircle, Eye, Edit2, Archive } from "lucide-react";
import { Button } from "@/components/ui/Button";

type RolePermission = {
    resource: string;
    description: string;
    owner: boolean;
    admin: boolean;
    staff: boolean;
};

const permissionsInfo: RolePermission[] = [
    {
        resource: "Store Settings & Themes",
        description: "Change visual appearance, brand assets, and general configuration.",
        owner: true, admin: true, staff: false
    },
    {
        resource: "Product / Catalog Management",
        description: "Add, edit, or archive products and inventory.",
        owner: true, admin: true, staff: true
    },
    {
        resource: "Order Fulfillment",
        description: "Process orders, change statuses, and print receipts.",
        owner: true, admin: true, staff: true
    },
    {
        resource: "Financials & Payouts",
        description: "View sales reports, link bank accounts, and configure payouts.",
        owner: true, admin: false, staff: false
    },
    {
        resource: "User Management",
        description: "Invite new team members, change roles, and modify permissions.",
        owner: true, admin: false, staff: false
    },
    {
        resource: "Business Deletion",
        description: "Permanently delete the organization and data.",
        owner: true, admin: false, staff: false
    }
];

export default function PermissionsPage() {
    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--color-on-surface)]">Permissions</h1>
                    <p className="text-sm font-medium text-[var(--color-on-surface-variant)] opacity-60">
                        View default role capabilities. Granular override controls are coming soon.
                    </p>
                </div>
            </div>

            {/* Default Roles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-[var(--radius-m3-2xl)] bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 shadow-sm flex flex-col gap-4 relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-[var(--color-primary)]/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                            <Shield size={20} />
                        </div>
                        <div>
                            <h3 className="font-black text-lg text-[var(--color-on-surface)]">Owner</h3>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-primary)]">Unrestricted</span>
                        </div>
                    </div>
                    <p className="text-xs font-medium text-[var(--color-on-surface-variant)] leading-relaxed opacity-80">
                        The creator of the business account. Has absolute control over billing, data deletion, and team management.
                    </p>
                </div>

                <div className="p-6 rounded-[var(--radius-m3-2xl)] bg-[var(--color-secondary)]/5 border border-[var(--color-secondary)]/20 shadow-sm flex flex-col gap-4 relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-[var(--color-secondary)]/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] flex items-center justify-center">
                            <Edit2 size={20} />
                        </div>
                        <div>
                            <h3 className="font-black text-lg text-[var(--color-on-surface)]">Admin</h3>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-secondary)]">Management</span>
                        </div>
                    </div>
                    <p className="text-xs font-medium text-[var(--color-on-surface-variant)] leading-relaxed opacity-80">
                        Can configure the store layout, process heavy operations, and edit product structures. Cannot touch payouts.
                    </p>
                </div>

                <div className="p-6 rounded-[var(--radius-m3-2xl)] bg-[var(--color-tertiary)]/5 border border-[var(--color-tertiary)]/20 shadow-sm flex flex-col gap-4 relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-[var(--color-tertiary)]/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-[var(--color-tertiary)]/10 text-[var(--color-tertiary)] flex items-center justify-center">
                            <Eye size={20} />
                        </div>
                        <div>
                            <h3 className="font-black text-lg text-[var(--color-on-surface)]">Staff</h3>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-tertiary)]">Operations</span>
                        </div>
                    </div>
                    <p className="text-xs font-medium text-[var(--color-on-surface-variant)] leading-relaxed opacity-80">
                        Task-focused role designed for daily order fulfillment, managing basic chats/tickets, and viewing inventory.
                    </p>
                </div>
            </div>

            {/* Matrix Table */}
            <div className="bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 rounded-[2rem] overflow-hidden shadow-[var(--shadow-m3-1)]">
                <div className="p-6 sm:p-8 pb-4 border-b border-[var(--color-outline-variant)]/10">
                    <h3 className="text-lg font-black text-[var(--color-on-surface)] mb-1">Access Matrix</h3>
                    <p className="text-xs text-[var(--color-on-surface-variant)] opacity-60">A breakdown of which operations are permitted by each standard role.</p>
                </div>

                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="border-b border-[var(--color-outline-variant)]/10 bg-[var(--color-surface-container)]/30">
                                <th className="px-8 py-5 text-xs font-black text-[var(--color-on-surface-variant)] opacity-60 uppercase tracking-widest w-2/5">Capability Area</th>
                                <th className="px-6 py-5 text-xs font-black text-[var(--color-on-surface-variant)] opacity-60 uppercase tracking-widest text-center">Owner</th>
                                <th className="px-6 py-5 text-xs font-black text-[var(--color-on-surface-variant)] opacity-60 uppercase tracking-widest text-center">Admin</th>
                                <th className="px-6 py-5 text-xs font-black text-[var(--color-on-surface-variant)] opacity-60 uppercase tracking-widest text-center">Staff</th>
                            </tr>
                        </thead>
                        <tbody>
                            {permissionsInfo.map((perm, i) => (
                                <tr key={i} className="border-b border-[var(--color-outline-variant)]/5 hover:bg-[var(--color-surface-container)]/30 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="font-bold text-sm text-[var(--color-on-surface)] mb-1">{perm.resource}</div>
                                        <div className="text-xs text-[var(--color-on-surface-variant)] opacity-70">{perm.description}</div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        {perm.owner ? (
                                            <CheckCircle2 size={18} className="text-[var(--color-primary)] inline-block" />
                                        ) : (
                                            <div className="w-4 h-[2px] bg-[var(--color-on-surface-variant)] opacity-20 inline-block rounded-full" />
                                        )}
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        {perm.admin ? (
                                            <CheckCircle2 size={18} className="text-[var(--color-secondary)] inline-block" />
                                        ) : (
                                            <div className="w-4 h-[2px] bg-[var(--color-on-surface-variant)] opacity-20 inline-block rounded-full" />
                                        )}
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        {perm.staff ? (
                                            <CheckCircle2 size={18} className="text-[var(--color-tertiary)] inline-block" />
                                        ) : (
                                            <div className="w-4 h-[2px] bg-[var(--color-on-surface-variant)] opacity-20 inline-block rounded-full" />
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="bg-[var(--color-primary)]/5 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex gap-3">
                        <div className="text-[var(--color-primary)] mt-0.5"><Lock size={20} /></div>
                        <div>
                            <h4 className="font-bold text-sm text-[var(--color-on-surface)]">Custom Roles</h4>
                            <p className="text-xs text-[var(--color-on-surface-variant)] opacity-70 max-w-md mt-1">
                                Creating custom, granular roles is a premium feature. Upgrade your business plan to unlock detailed permission mapping.
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" className="shrink-0 h-10 px-5 rounded-lg text-xs font-bold border-[var(--color-primary)]/20 text-[var(--color-primary)] bg-[var(--color-primary)]/5 hover:bg-[var(--color-primary)] hover:text-white transition-all shadow-none">
                        Upgrade Plan
                    </Button>
                </div>
            </div>
        </div>
    );
}
