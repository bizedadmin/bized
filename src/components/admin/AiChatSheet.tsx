"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { useAi } from "@/contexts/AiContext";
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

export function AiChatSheet() {
    const { isChatOpen, setIsChatOpen, contextData, onApplyChanges } = useAi();
    const { currentBusiness, refreshBusinesses } = useBusiness();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [lastSuggestedChange, setLastSuggestedChange] = useState<Record<string, any> | null>(null);
    const [quickActions, setQuickActions] = useState<string[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    // Context-based initial suggestions
    useEffect(() => {
        if (isChatOpen && messages.length === 0) {
            if (contextData?.name && !contextData?.description) {
                setQuickActions(["Generate Store Description", "Create Logo Idea", "Set up WhatsApp"]);
            } else {
                setQuickActions(["Improve Branding", "Plan WA Promo", "Check SEO"]);
            }
        }
    }, [isChatOpen, messages.length, contextData]);

    const handleSend = async (customMessage?: string) => {
        const userMessage = customMessage || input.trim();
        if (!userMessage && !customMessage) return;
        if (isLoading) return;

        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMessage }]);
        setIsLoading(true);
        setQuickActions([]);

        try {
            const response = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, { role: "user", content: userMessage }],
                    business: currentBusiness,
                    context: contextData,
                }),
            });

            if (!response.ok) {
                const errData = await response.json();
                setMessages(prev => [...prev, { role: "error", content: errData.error || "Failed to get response" }]);
                return;
            }

            const data = await response.json();
            setMessages(prev => [...prev, { role: "assistant", content: data.message }]);

            if (data.suggestedChanges) {
                setLastSuggestedChange(data.suggestedChanges);
            }
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

    const handleApply = () => {
        if (onApplyChanges && lastSuggestedChange) {
            onApplyChanges(lastSuggestedChange);
            setLastSuggestedChange(null);
            setMessages(prev => [...prev, { role: "assistant", content: "Applied the changes to your screen!" }]);
        }
    };

    return (
        <Sheet
            open={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            title="AI Assistant"
            icon={<Bot size={20} />}
            footer={
                <div className="flex flex-col gap-3">
                    {lastSuggestedChange && (
                        <div className="p-4 rounded-xl bg-[var(--color-primary-container)] border border-[var(--color-primary)]/20 animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-[var(--color-primary)] flex items-center gap-1">
                                    <Sparkles size={12} /> AI suggestion
                                </span>
                                <Button size="sm" onClick={handleApply} className="h-8 px-3 text-[10px] font-black tracking-widest text-center">
                                    Apply changes
                                </Button>
                            </div>
                            <p className="text-xs text-[var(--color-on-primary-container)] opacity-80 line-clamp-2">
                                The agent has suggested updates based on your request.
                            </p>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleSend()}
                            placeholder="Ask your AI Assistant..."
                            className="flex-1 h-12 px-4 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/20 focus:border-[var(--color-primary)] outline-none transition-all text-sm"
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={isLoading || !input.trim()}
                            className="w-12 h-12 rounded-xl bg-[var(--color-primary)] text-[var(--color-on-primary)] flex items-center justify-center disabled:opacity-50 transition-all active:scale-95"
                        >
                            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        </button>
                    </div>
                </div>
            }
        >
            <div className="flex flex-col gap-4 h-full min-h-[400px]" ref={scrollRef}>
                {messages.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-40">
                        <Bot size={48} className="mb-4" />
                        <h3 className="text-lg font-bold mb-1">Your AI Assistant</h3>
                        <p className="text-xs">I can help you write product descriptions, improve your store&apos;s branding, or answer business questions.</p>
                        {!(currentBusiness?.aiConfig?.openaiApiKey || currentBusiness?.aiConfig?.googleApiKey) && (
                            <Link
                                href="/admin/settings?tab=ai"
                                onClick={() => setIsChatOpen(false)}
                                className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold hover:bg-amber-100 transition-colors flex items-center gap-2 group"
                            >
                                PLEASE CONFIGURE YOUR API KEY IN SETTINGS
                                <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                        )}
                    </div>
                )}

                {messages.map((m, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={i}
                        className={cn(
                            "max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed",
                            m.role === "user"
                                ? "self-end bg-[var(--color-primary)] text-[var(--color-on-primary)] rounded-tr-none"
                                : m.role === "error"
                                    ? "self-start bg-red-50 text-red-700 border border-red-200 rounded-tl-none flex flex-col gap-3"
                                    : "self-start bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)] rounded-tl-none border border-[var(--color-outline-variant)]/10"
                        )}
                    >
                        {m.content}
                        {m.role === "error" && (
                            <div className="flex flex-col gap-2 w-fit">
                                <button
                                    onClick={() => {
                                        // Find last user message to retry
                                        const lastUserMsg = messages.slice(0, i).reverse().find(msg => msg.role === "user");
                                        if (lastUserMsg) {
                                            // Remove the error message and retry
                                            setMessages(prev => prev.filter((_, idx) => idx !== i));
                                            handleSend(lastUserMsg.content);
                                        }
                                    }}
                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-600 hover:text-red-800 transition-colors w-fit"
                                >
                                    <RotateCw size={12} /> Retry Message
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
                                    className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-wider text-red-400 hover:text-red-500 transition-colors w-fit pl-0.5"
                                >
                                    Refresh Key & Retry
                                </button>
                            </div>
                        )}
                    </motion.div>
                ))}

                {isLoading && (
                    <div className="self-start p-4 rounded-2xl bg-[var(--color-surface-container-high)] border border-[var(--color-outline-variant)]/10 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-bounce" />
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-bounce delay-75" />
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-bounce delay-150" />
                    </div>
                )}

                {/* Quick Actions */}
                {!isLoading && quickActions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {quickActions.map((action, i) => (
                            <button
                                key={i}
                                onClick={() => handleSend(action)}
                                className="px-4 py-2 rounded-full border border-[var(--color-primary)]/20 text-[var(--color-primary)] text-xs font-bold hover:bg-[var(--color-primary)]/5 transition-colors whitespace-nowrap"
                            >
                                {action}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </Sheet>
    );
}
