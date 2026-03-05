"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    AlertTriangle, CheckCircle2, RefreshCw, Search,
    ExternalLink, X, ChevronDown, ChevronUp, Clock,
    Globe, Users, TrendingUp, BellOff, ShieldCheck,
    Flame, Activity, Circle
} from "lucide-react";

interface SentryIssue {
    id: string;
    title: string;
    culprit: string;
    level: string;
    status: "resolved" | "unresolved" | "ignored";
    count: string;
    userCount: number;
    firstSeen: string;
    lastSeen: string;
    permalink: string;
    metadata?: { value?: string; type?: string; filename?: string };
    tags?: { key: string; value: string }[];
    platform?: string;
}

const LEVEL_CONFIG: Record<string, { color: string; bg: string; border: string; dot: string; label: string }> = {
    fatal: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", dot: "bg-red-500", label: "Fatal" },
    error: { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30", dot: "bg-orange-500", label: "Error" },
    warning: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", dot: "bg-amber-500", label: "Warning" },
    info: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", dot: "bg-blue-500", label: "Info" },
    debug: { color: "text-zinc-400", bg: "bg-zinc-500/10", border: "border-zinc-700", dot: "bg-zinc-500", label: "Debug" },
};

export default function SentryIssuesPage() {
    const [issues, setIssues] = useState<SentryIssue[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isConfigured, setIsConfigured] = useState(true);
    const [search, setSearch] = useState("");
    const [levelFilter, setLevelFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("is:unresolved");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [configError, setConfigError] = useState<string | null>(null);

    const buildQuery = useCallback(() => {
        let q = statusFilter;
        if (levelFilter) q += ` level:${levelFilter}`;
        if (search) q += ` ${search}`;
        return q;
    }, [statusFilter, levelFilter, search]);

    const fetchIssues = useCallback(async () => {
        setIsLoading(true);
        setConfigError(null);
        try {
            const params = new URLSearchParams({ query: buildQuery(), limit: "30" });
            const res = await fetch(`/api/hq/sentry/issues?${params}`);
            const data = await res.json();

            if (res.status === 503) {
                setIsConfigured(false);
                setConfigError(data.error);
                return;
            }
            if (!res.ok) {
                setConfigError(data.error || "Failed to fetch from Sentry");
                return;
            }
            setIsConfigured(true);
            setIssues(data.issues || []);
        } catch {
            setConfigError("Network error connecting to Sentry proxy.");
        } finally {
            setIsLoading(false);
        }
    }, [buildQuery]);

    useEffect(() => { fetchIssues(); }, [fetchIssues]);

    const handleUpdateStatus = async (id: string, status: "resolved" | "ignored" | "unresolved") => {
        setProcessingId(id);
        try {
            await fetch(`/api/hq/sentry/issues/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            fetchIssues();
        } finally {
            setProcessingId(null);
        }
    };

    const totalEvents = issues.reduce((a, i) => a + parseInt(i.count || "0"), 0);
    const totalUsers = issues.reduce((a, i) => a + (i.userCount || 0), 0);
    const fatalCount = issues.filter(i => i.level === "fatal").length;

    if (!isConfigured) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Sentry Issues</h1>
                    <p className="text-zinc-400 mt-1">Real-time error monitoring from Sentry.</p>
                </div>

                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-8 space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Sentry Not Configured</h2>
                            <p className="text-sm text-zinc-400 mt-1">{configError}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-white">Setup Instructions</h3>
                        <ol className="space-y-3">
                            {[
                                { step: "1", text: "Go to sentry.io and create a project (choose Next.js)" },
                                { step: "2", text: "From Settings → Developer Settings → Internal Integrations, create a token with Issues: Read + Write" },
                                { step: "3", text: "Add these to your .env.local:" },
                            ].map(s => (
                                <li key={s.step} className="flex items-start gap-3">
                                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0">{s.step}</span>
                                    <span className="text-sm text-zinc-300">{s.text}</span>
                                </li>
                            ))}
                        </ol>

                        <div className="bg-zinc-950 rounded-xl p-5 font-mono text-sm space-y-1">
                            <p className="text-emerald-400"># Sentry Configuration</p>
                            <p className="text-zinc-300">NEXT_PUBLIC_SENTRY_DSN=<span className="text-blue-400">https://xxx@oXXX.ingest.sentry.io/XXX</span></p>
                            <p className="text-zinc-300">SENTRY_AUTH_TOKEN=<span className="text-blue-400">sntrys_...</span></p>
                            <p className="text-zinc-300">SENTRY_ORG_SLUG=<span className="text-blue-400">your-org</span></p>
                            <p className="text-zinc-300">SENTRY_PROJECT_SLUG=<span className="text-blue-400">your-project</span></p>
                        </div>

                        <a
                            href="https://sentry.io/settings/account/api/auth-tokens/"
                            target="_blank"
                            rel="noopener"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors"
                        >
                            Open Sentry Token Settings <ExternalLink size={14} />
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-16">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight text-white">Sentry Issues</h1>
                        <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                            <Circle size={6} className="fill-emerald-400" /> Live
                        </span>
                    </div>
                    <p className="text-zinc-400 mt-1">Real-time error monitoring from Sentry.</p>
                </div>
                <div className="flex items-center gap-2">
                    <a
                        href={`https://sentry.io`}
                        target="_blank"
                        rel="noopener"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition-colors"
                    >
                        <ExternalLink size={14} /> Open Sentry
                    </a>
                    <button
                        onClick={fetchIssues}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition-colors"
                    >
                        <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} /> Refresh
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: "Total Issues", value: issues.length, icon: AlertTriangle, color: "text-orange-400" },
                    { label: "Total Events", value: totalEvents.toLocaleString(), icon: Flame, color: "text-red-400" },
                    { label: "Users Affected", value: totalUsers.toLocaleString(), icon: Users, color: "text-purple-400" },
                    { label: "Fatal Issues", value: fatalCount, icon: TrendingUp, color: "text-red-500" },
                ].map(stat => (
                    <div key={stat.label} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-zinc-500 font-medium">{stat.label}</p>
                            <stat.icon size={14} className={stat.color} />
                        </div>
                        <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{isLoading ? "—" : stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search issues..."
                        className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                    />
                </div>
                <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
                    {[
                        { q: "is:unresolved", label: "Unresolved" },
                        { q: "is:resolved", label: "Resolved" },
                        { q: "is:ignored", label: "Ignored" },
                        { q: "", label: "All" },
                    ].map(opt => (
                        <button
                            key={opt.label}
                            onClick={() => setStatusFilter(opt.q)}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${statusFilter === opt.q ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-white"}`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
                <select
                    value={levelFilter}
                    onChange={e => setLevelFilter(e.target.value)}
                    className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-indigo-500"
                >
                    <option value="">All Levels</option>
                    <option value="fatal">Fatal</option>
                    <option value="error">Error</option>
                    <option value="warning">Warning</option>
                    <option value="info">Info</option>
                </select>
                {(search || levelFilter) && (
                    <button
                        onClick={() => { setSearch(""); setLevelFilter(""); }}
                        className="flex items-center gap-1 px-3 py-2 text-xs text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded-lg transition-colors"
                    >
                        <X size={12} /> Clear
                    </button>
                )}
            </div>

            {/* Issues List */}
            <div className="space-y-2">
                {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-[72px] rounded-xl bg-zinc-900/50 border border-zinc-800 animate-pulse" />
                    ))
                ) : configError ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                        <AlertTriangle size={32} className="text-red-400" />
                        <p className="text-white font-semibold">{configError}</p>
                    </div>
                ) : issues.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                            <ShieldCheck size={32} className="text-emerald-500" />
                        </div>
                        <div className="text-center">
                            <p className="font-semibold text-white">All Clear</p>
                            <p className="text-sm text-zinc-500 mt-1">No issues match your current filters.</p>
                        </div>
                    </div>
                ) : (
                    issues.map(issue => {
                        const lvl = LEVEL_CONFIG[issue.level] || LEVEL_CONFIG.error;
                        const isExpanded = expandedId === issue.id;

                        return (
                            <div key={issue.id} className={`rounded-xl border transition-all ${issue.status === "resolved" ? "border-zinc-800 bg-zinc-900/20 opacity-60" : `${lvl.border} bg-zinc-900/60`}`}>
                                <div className="flex items-start gap-4 p-4">
                                    {/* Level dot */}
                                    <div className="mt-2 shrink-0">
                                        <div className={`w-2 h-2 rounded-full ${lvl.dot} ${issue.level === "fatal" ? "animate-pulse" : ""}`} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 flex-wrap">
                                            <p className="text-sm font-semibold text-white leading-tight max-w-[65%]">
                                                {issue.title}
                                            </p>
                                            <div className="flex items-center gap-2 shrink-0 flex-wrap">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${lvl.bg} ${lvl.color} border ${lvl.border}`}>
                                                    {lvl.label}
                                                </span>
                                                {issue.status === "resolved" && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">Resolved</span>
                                                )}
                                                {issue.status === "ignored" && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-zinc-400 bg-zinc-700 border border-zinc-600">Ignored</span>
                                                )}
                                            </div>
                                        </div>

                                        {issue.culprit && (
                                            <p className="text-[11px] text-zinc-500 font-mono mt-0.5 truncate">{issue.culprit}</p>
                                        )}

                                        <div className="flex flex-wrap items-center gap-3 mt-1.5">
                                            <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                                                <Flame size={10} className="text-red-400" />
                                                <strong className="text-zinc-300">{parseInt(issue.count).toLocaleString()}</strong> events
                                            </span>
                                            <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                                                <Users size={10} />
                                                <strong className="text-zinc-300">{issue.userCount}</strong> users
                                            </span>
                                            <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                                                <Clock size={10} /> Last seen {new Date(issue.lastSeen).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                                                <Activity size={10} /> First seen {new Date(issue.firstSeen).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            onClick={() => setExpandedId(isExpanded ? null : issue.id)}
                                            className="p-1.5 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                                            title="Expand"
                                        >
                                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                        </button>
                                        <a
                                            href={issue.permalink}
                                            target="_blank"
                                            rel="noopener"
                                            className="p-1.5 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                                            title="Open in Sentry"
                                        >
                                            <ExternalLink size={14} />
                                        </a>
                                        {issue.status !== "resolved" && (
                                            <button
                                                onClick={() => handleUpdateStatus(issue.id, "resolved")}
                                                disabled={processingId === issue.id}
                                                className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-zinc-400 hover:text-emerald-400 transition-colors"
                                                title="Resolve"
                                            >
                                                <CheckCircle2 size={14} />
                                            </button>
                                        )}
                                        {issue.status !== "ignored" && issue.status !== "resolved" && (
                                            <button
                                                onClick={() => handleUpdateStatus(issue.id, "ignored")}
                                                disabled={processingId === issue.id}
                                                className="p-1.5 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-amber-400 transition-colors"
                                                title="Ignore"
                                            >
                                                <BellOff size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Expanded Detail */}
                                {isExpanded && (
                                    <div className="px-4 pb-4 space-y-2 border-t border-zinc-800/50 pt-3">
                                        {issue.metadata?.value && (
                                            <div>
                                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Exception Message</p>
                                                <p className="text-sm text-red-300/80 font-mono bg-zinc-950 p-3 rounded-xl">{issue.metadata.value}</p>
                                            </div>
                                        )}
                                        {issue.metadata?.filename && (
                                            <p className="text-[11px] text-zinc-500 font-mono flex items-center gap-1">
                                                <Globe size={10} /> {issue.metadata.filename}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2 pt-1">
                                            <a
                                                href={issue.permalink}
                                                target="_blank"
                                                rel="noopener"
                                                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                                            >
                                                View full stack trace & events on Sentry <ExternalLink size={12} />
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
