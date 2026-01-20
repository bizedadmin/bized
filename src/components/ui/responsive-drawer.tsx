"use client"

import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"
import { cn } from "@/lib/utils"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog"

interface ResponsiveDrawerProps {
    children: React.ReactNode | ((setOpen: (open: boolean) => void) => React.ReactNode)
    trigger: React.ReactNode
    title: string
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
}

export function ResponsiveDrawer({
    children,
    trigger,
    title,
    isOpen: controlledOpen,
    onOpenChange: setControlledOpen,
}: ResponsiveDrawerProps) {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
    const [isDesktop, setIsDesktop] = React.useState(false)

    const isOpen = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen
    const setOpen = setControlledOpen !== undefined ? setControlledOpen : setUncontrolledOpen

    React.useEffect(() => {
        const checkIsDesktop = () => setIsDesktop(window.innerWidth >= 768)
        checkIsDesktop()
        window.addEventListener("resize", checkIsDesktop)
        return () => window.removeEventListener("resize", checkIsDesktop)
    }, [])

    const content = typeof children === "function" ? children(setOpen) : children

    if (isDesktop) {
        return (
            <Dialog open={isOpen} onOpenChange={setOpen}>
                <DialogTrigger asChild>{trigger}</DialogTrigger>
                <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-[32px] border-none shadow-2xl">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle className="text-2xl font-black text-center">{title}</DialogTitle>
                    </DialogHeader>
                    {content}
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <DrawerPrimitive.Root open={isOpen} onOpenChange={setOpen}>
            <DrawerPrimitive.Trigger asChild>{trigger}</DrawerPrimitive.Trigger>
            <DrawerPrimitive.Portal>
                <DrawerPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40" />
                <DrawerPrimitive.Content className="fixed inset-x-0 bottom-0 z-50 mt-24 flex h-[85vh] flex-col rounded-t-[32px] bg-white dark:bg-zinc-900 outline-none">
                    <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-gray-200 dark:bg-zinc-800 shrink-0" />
                    <div className="p-6 pb-0 text-center shrink-0">
                        <DrawerPrimitive.Title className="text-2xl font-black">{title}</DrawerPrimitive.Title>
                    </div>
                    <div className="flex-1 overflow-y-auto px-6 py-4">
                        {content}
                    </div>
                </DrawerPrimitive.Content>
            </DrawerPrimitive.Portal>
        </DrawerPrimitive.Root>
    )
}
