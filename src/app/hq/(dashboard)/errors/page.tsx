"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    AlertTriangle, CheckCircle2, Trash2, RefreshCw,
    Search, Filter, ChevronDown, ChevronUp, Clock,
    Globe, User, Server, Info, AlertCircle, X, ChevronLeft, ChevronRight
} from "lucide-react";

interface PlatformError {
    _id: string;
    message: string;
    stack?: string;
    route?: string;
    method?: string;
    storeId?: string;
    userId?: string;
    severity: "error" | "warn" | "info";
    context?: Record<string, unknown>;
    resolved: boolean;
    resolvedAt?: string;
    resolvedBy?: string;
    createdAt: string;
}

const SEVERITY_CONFIG = {
    error: { label: "Error", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", icon: AlertCircle },
    warn: { label: "Warning", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: AlertTriangle },
    info: { label: "Info", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: Info },
};

export default function PlatformErrorsPage() {
    const [errors, setErrors] = useState<PlatformError[]>([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [severityFilter, setSeverityFilter] = useState("");
    const [resolvedFilter, setResolvedFilter] = useState("false");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchErrors = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "30",
                ...(search && { search }),
                ...(severityFilter && { severity: severityFilter }),
                ...(resolvedFilter !== "" && { resolved: resolvedFilter }),
            });
            const res = await fetch(`/api/hq/errors?${params}`);
            const data = await res.json();
            setErrors(data.errors || []);
            setTotal(data.total || 0);
            setPages(data.pages || 1);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [page, search, severityFilter, resolvedFilter]);

    useEffect(() => { fetchErrors(); }, [fetchErrors]);

    const handleResolve = async (id: string, resolved: boolean) => {
        setProcessingId(id);
        try {
            await fetch(`/api/hq/errors/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resolved, resolvedBy: "HQ Admin" }),
            });
            fetchErrors();
        } finally {
            setProcessingId(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Permanently delete this error log?")) return;
        setProcessingId(id);
        try {
            await fetch(`/api/hq/errors/${id}`, { method: "DELETE" });
            fetchErrors();
        } finally {
            setProcessingId(null);
        }
    };

    const unresolvedCount = errors.filter(e => !e.resolved).length;

    return (
        <div className="space-y-6 pb-16">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Error Logs</h1>
                    <p className="text-zinc-400 mt-1">
                        Platform-wide error tracking and resolution.
                        {total > 0 && <span className="ml-2 text-red-400 font-semibold">{total} total entries</span>}
                    </p>
                </div>
                <button
                    onClick={fetchErrors}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition-colors"
                >
                    <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} /> Refresh
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "Unresolved Errors", value: total, color: "text-red-400", filter: () => { setSeverityFilter("error"); setResolvedFilter("false"); } },
                    { label: "Warnings", value: errors.filter(e => e.severity === "warn").length, color: "text-amber-400", filter: () => { setSeverityFilter("warn"); setResolvedFilter(""); } },
                    { label: "Resolved", value: errors.filter(e => e.resolved).length, color: "text-emerald-400", filter: () => setResolvedFilter("true") },
                ].map(stat => (
                    <button
                        key={stat.label}
                        onClick={stat.filter}
                        className="text-left rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 hover:border-zinc-700 transition-colors"
                    >
                        <p className="text-xs text-zinc-500 font-medium">{stat.label}</p>
                        <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search error messages..."
                        className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                    />
                </div>
                <select
                    value={severityFilter}
                    onChange={e => { setSeverityFilter(e.target.value); setPage(1); }}
                    className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-indigo-500"
                >
                    <option value="">All Severities</option>
                    <option value="error">Errors</option>
                    <option value="warn">Warnings</option>
                    <option value="info">Info</option>
                </select>
                <select
                    value={resolvedFilter}
                    onChange={e => { setResolvedFilter(e.target.value); setPage(1); }}
                    className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-indigo-500"
                >
                    <option value="false">Unresolved</option>
                    <option value="true">Resolved</option>
                    <option value="">All</option>
                </select>
                {(search || severityFilter || resolvedFilter !== "false") && (
                    <button
                        onClick={() => { setSearch(""); setSeverityFilter(""); setResolvedFilter("false"); setPage(1); }}
                        className="flex items-center gap-1 px-3 py-2 text-xs text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded-lg transition-colors"
                    >
                        <X size={12} /> Clear
                    </button>
                )}
            </div>

            {/* Error List */}
            <div className="space-y-2">
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-20 rounded-xl bg-zinc-900/50 border border-zinc-800 animate-pulse" />
                    ))
                ) : errors.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                            <CheckCircle2 size={32} className="text-emerald-500" />
                        </div>
                        <div>
                            <p className="font-semibold text-white">All Clear</p>
                            <p className="text-sm text-zinc-500 mt-1">No errors match your current filters.</p>
                        </div>
                    </div>
                ) : (
                    errors.map(err => {
                        const sev = SEVERITY_CONFIG[err.severity] || SEVERITY_CONFIG.error;
                        const SevIcon = sev.icon;
                        const isExpanded = expandedId === err._id;

                        return (
                            <div
                                key={err._id}
                                className={`rounded-xl border transition-all ${err.resolved ? "border-zinc-800 bg-zinc-900/30 opacity-60" : `${sev.border} ${sev.bg}`}`}
                            >
                                {/* Main Row */}
                                <div className="flex items-start gap-4 p-4">
                                    <div className={`mt-0.5 shrink-0 ${sev.color}`}>
                                        <SevIcon size={16} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-sm font-medium text-white leading-tight truncate max-w-[70%]">
                                                {err.message}
                                            </p>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${sev.bg} ${sev.color} border ${sev.border}`}>
                                                    {sev.label}
                                                </span>
                                                {err.resolved && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                                                        Resolved
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3 mt-1.5">
                                            <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                                                <Clock size={10} />
                                                {new Date(err.createdAt).toLocaleString()}
                                            </span>
                                            {err.route && (
                                                <span className="flex items-center gap-1 text-[11px] text-zinc-500 font-mono">
                                                    <Globe size={10} /> {err.route}
                                                </span>
                                            )}
                                            {err.storeId && (
                                                <span className="flex items-center gap-1 text-[11px] text-zinc-500 font-mono">
                                                    <Server size={10} /> {err.storeId}
                                                </span>
                                            )}
                                            {err.userId && (
                                                <span className="flex items-center gap-1 text-[11px] text-zinc-500 font-mono">
                                                    <User size={10} /> {err.userId}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            onClick={() => setExpandedId(isExpanded ? null : err._id)}
                                            className="p-1.5 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                                            title="View details"
                                        >
                                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                        </button>
                                        <button
                                            onClick={() => handleResolve(err._id, !err.resolved)}
                                            disabled={processingId === err._id}
                                            className={`p-1.5 rounded-lg transition-colors ${err.resolved ? "hover:bg-zinc-700 text-zinc-500 hover:text-amber-400" : "hover:bg-emerald-500/10 text-zinc-400 hover:text-emerald-400"}`}
                                            title={err.resolved ? "Mark as unresolved" : "Mark as resolved"}
                                        >
                                            <CheckCircle2 size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(err._id)}
                                            disabled={processingId === err._id}
                                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Detail */}
                                {isExpanded && (
                                    <div className="px-4 pb-4 pt-0 space-y-3 border-t border-zinc-800/50">
                                        {err.stack && (
                                            <div>
                                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Stack Trace</p>
                                                <pre className="text-[11px] text-red-300/70 bg-zinc-950 p-4 rounded-xl overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                                                    {err.stack}
                                                </pre>
                                            </div>
                                        )}
                                        {err.context && (
                                            <div>
                                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Context</p>
                                                <pre className="text-[11px] text-zinc-300 bg-zinc-950 p-4 rounded-xl overflow-x-auto font-mono">
                                                    {JSON.stringify(err.context, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                        {err.resolved && err.resolvedBy && (
                                            <p className="text-[11px] text-emerald-400">
                                                ✓ Resolved by <strong>{err.resolvedBy}</strong> on {new Date(err.resolvedAt!).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Pagination */}
            {pages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                    <p className="text-sm text-zinc-500">Page {page} of {pages} ({total} total)</p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 disabled:opacity-30 hover:bg-zinc-800 transition-colors"
                        >
                            <ChevronLeft size={14} />
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(pages, p + 1))}
                            disabled={page === pages}
                            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 disabled:opacity-30 hover:bg-zinc-800 transition-colors"
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
