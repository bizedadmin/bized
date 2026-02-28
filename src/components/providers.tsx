
"use client";

import { SessionProvider } from "next-auth/react";
import { BusinessProvider } from "@/contexts/BusinessContext";
import { AiProvider } from "@/contexts/AiContext";
import { CartProvider } from "@/contexts/CartContext";
import { SnackbarProvider } from "@/components/ui/Snackbar";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <BusinessProvider>
                <AiProvider>
                    <CartProvider>
                        <SnackbarProvider>
                            {children}
                        </SnackbarProvider>
                    </CartProvider>
                </AiProvider>
            </BusinessProvider>
        </SessionProvider>
    );
}
