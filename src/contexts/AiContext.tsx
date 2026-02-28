"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface AiContextType {
    isChatOpen: boolean;
    setIsChatOpen: (open: boolean) => void;
    contextData: any;
    setContextData: (data: any) => void;
    onApplyChanges: ((data: any) => void) | null;
    setOnApplyChanges: (fn: ((data: any) => void) | null) => void;
}

const AiContext = createContext<AiContextType | undefined>(undefined);

export function AiProvider({ children }: { children: React.ReactNode }) {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [contextData, setContextData] = useState<any>(null);
    const [onApplyChanges, setOnApplyChanges] = useState<((data: any) => void) | null>(null);

    const value = React.useMemo(() => ({
        isChatOpen,
        setIsChatOpen,
        contextData,
        setContextData,
        onApplyChanges,
        setOnApplyChanges,
    }), [isChatOpen, contextData, onApplyChanges]);

    return (
        <AiContext.Provider value={value}>
            {children}
        </AiContext.Provider>
    );
}

export function useAi() {
    const ctx = useContext(AiContext);
    if (!ctx) throw new Error("useAi must be used within AiProvider");
    return ctx;
}
