"use client";

import React, { useState, useRef, useEffect } from "react";
import { useBusiness } from "@/contexts/BusinessContext";
import { Button } from "@/components/ui/Button";
import { Bot, Send, Loader2, Sparkles, ChevronRight, RotateCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Message {
    role: "user" | "assistant" | "error";
    content: string;
}

export default function AiAssistantPage() {
    const { currentBusiness, refreshBusinesses } = useBusiness();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [quickActions, setQuickActions] = useState<string[]>([
        "Improve Branding",
        "Plan WA Promo",
        "Check SEO",
        "Generate Store Description",
        "Create Logo Idea"
    ]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSend = async (customMessage?: string) => {
        const userMessage = customMessage || input.trim();
        if (!userMessage && !customMessage) return;
        if (isLoading) return;

        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, { role: "user", content: userMessage }],
                    business: currentBusiness,
                }),
            });

            if (!response.ok) {
                const errData = await response.json();
                setMessages(prev => [...prev, { role: "error", content: errData.error || "Failed to get response" }]);
                return;
            }

            const data = await response.json();
            setMessages(prev => [...prev, { role: "assistant", content: data.message }]);

            if (data.quickActions) {
                setQuickActions(data.quickActions);
            }
        } catch (error) {
            console.error("Chat error:", error);
            const msg = error instanceof Error ? error.message : "Sorry, I encountered an error. Please check your AI configuration.";
            setMessages(prev => [...prev, { role: "error", content: msg }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden max-w-5xl mx-auto md:p-6 lg:p-8">
            {/* Header Area */}
            <div className="flex items-center gap-4 mb-6 shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)] text-[var(--color-on-primary)] flex items-center justify-center shadow-lg shadow-[var(--color-primary)]/20 shadow-md transition-transform hover:scale-105">
                    <Bot size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-[var(--color-on-surface)] tracking-tight">AI Assistant</h1>
                    <p className="text-sm font-medium text-[var(--color-on-surface-variant)] opacity-70">Your personal business assistant</p>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-[var(--color-surface-container)] rounded-[2rem] border border-[var(--color-outline-variant)]/20 shadow-lg overflow-hidden relative">

                {/* Messages Container */}
                <div
                    className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-6"
                    ref={scrollRef}
                >
                    {messages.length === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-60 mt-8">
                            <div className="w-24 h-24 mb-6 rounded-[2rem] bg-[var(--color-surface-container-high)] flex items-center justify-center">
                                <Bot size={48} className="text-[var(--color-on-surface)]" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">How can I help you today?</h3>
                            <p className="text-sm max-w-md text-[var(--color-on-surface-variant)] mb-8">
                                I can write product descriptions, optimize your store's branding, suggest promotions, or answer questions about your business analytics.
                            </p>

                            {!(currentBusiness?.aiConfig?.openaiApiKey || currentBusiness?.aiConfig?.googleApiKey) && (
                                <Link
                                    href="/admin/settings?tab=ai"
                                    className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition-colors flex items-center gap-2 group"
                                >
                                    PLEASE CONFIGURE YOUR API KEY IN SETTINGS
                                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            )}

                            {/* Quick Actions at empty state */}
                            {(currentBusiness?.aiConfig?.openaiApiKey || currentBusiness?.aiConfig?.googleApiKey) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full mt-4">
                                    {quickActions.slice(0, 4).map((action, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSend(action)}
                                            className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/10 hover:border-[var(--color-primary)]/30 hover:shadow-md transition-all text-sm font-medium text-left flex items-center gap-3 group"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center shrink-0">
                                                <Sparkles size={14} />
                                            </div>
                                            <span className="flex-1">{action}</span>
                                            <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-on-surface-variant)]" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {messages.map((m, i) => (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            key={i}
                            className={cn(
                                "max-w-[85%] flex flex-col gap-2",
                                m.role === "user" ? "self-end items-end" : "self-start items-start"
                            )}
                        >
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-on-surface-variant)] opacity-50 px-2">
                                {m.role === "user" ? "You" : "AI Assistant"}
                            </span>
                            <div className={cn(
                                "p-5 rounded-3xl text-[15px] leading-relaxed shadow-sm",
                                m.role === "user"
                                    ? "bg-[var(--color-primary)] text-[var(--color-on-primary)] rounded-tr-sm"
                                    : m.role === "error"
                                        ? "bg-red-50 text-red-700 border border-red-200 rounded-tl-sm"
                                        : "bg-[var(--color-surface)] text-[var(--color-on-surface)] rounded-tl-sm border border-[var(--color-outline-variant)]/10"
                            )}>
                                {m.content}

                                {/* Error Retry Options */}
                                {m.role === "error" && (
                                    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-red-200/50">
                                        <button
                                            onClick={() => {
                                                const lastUserMsg = messages.slice(0, i).reverse().find(msg => msg.role === "user");
                                                if (lastUserMsg) {
                                                    setMessages(prev => prev.filter((_, idx) => idx !== i));
                                                    handleSend(lastUserMsg.content);
                                                }
                                            }}
                                            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-red-600 hover:text-red-900 transition-colors"
                                        >
                                            <RotateCw size={14} /> Retry
                                        </button>
                                        <button
                                            onClick={async () => {
                                                await refreshBusinesses?.();
                                                const lastUserMsg = messages.slice(0, i).reverse().find(msg => msg.role === "user");
                                                if (lastUserMsg) {
                                                    setMessages(prev => prev.filter((_, idx) => idx !== i));
                                                    handleSend(lastUserMsg.content);
                                                }
                                            }}
                                            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-600 transition-colors"
                                        >
                                            Refresh Key & Retry
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}

                    {isLoading && (
                        <div className="self-start items-start max-w-[85%] flex flex-col gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-on-surface-variant)] opacity-50 px-2">
                                AI Assistant
                            </span>
                            <div className="px-6 py-5 rounded-3xl rounded-tl-sm bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/10 shadow-sm flex items-center gap-2.5">
                                <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-bounce" />
                                <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 md:p-6 bg-[var(--color-surface)] border-t border-[var(--color-outline-variant)]/10 flex flex-col justify-center">

                    {/* Quick Follow-up Actions */}
                    {!isLoading && messages.length > 0 && quickActions.length > 0 && (
                        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-2">
                            {quickActions.map((action, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSend(action)}
                                    className="px-4 py-2 rounded-full border border-[var(--color-primary)]/20 text-[var(--color-primary)] font-bold text-xs hover:bg-[var(--color-primary)]/5 transition-colors whitespace-nowrap whitespace-nowrap shrink-0"
                                >
                                    {action}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="relative group">
                        <textarea
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Message your AI Sales Assistant..."
                            className="w-full min-h-[60px] max-h-[200px] resize-none px-5 py-4 pr-16 rounded-[1.5rem] bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)]/50 focus:ring-4 focus:ring-[var(--color-primary)]/10 outline-none transition-all text-[15px]"
                            rows={1}
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={isLoading || !input.trim()}
                            className="absolute right-2 top-2 bottom-2 w-12 rounded-xl bg-[var(--color-primary)] text-[var(--color-on-primary)] flex items-center justify-center disabled:opacity-50 transition-all active:scale-95 group-focus-within:shadow-md"
                        >
                            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-1" />}
                        </button>
                    </div>
                    <div className="text-center mt-3">
                        <span className="text-[10px] text-[var(--color-on-surface-variant)] opacity-50 font-medium">
                            AI Assistant can make mistakes. Consider verifying important information.
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
