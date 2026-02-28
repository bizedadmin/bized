"use client";

import React, { useState, useMemo } from "react";
import { FolderTree, Plus, Sparkles, ChevronRight, Layers } from "lucide-react";
import { useBusiness, ProductCategory } from "@/contexts/BusinessContext";
import { Button } from "@/components/ui/Button";
import { CategorySheet } from "@/components/admin/products/CategorySheet";

type CategoryTreeNode = ProductCategory & { children: CategoryTreeNode[] };

export default function CategoriesPage() {
    const { currentBusiness, isLoading } = useBusiness();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isAiAutoTrigger, setIsAiAutoTrigger] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();

    const rawCategories = currentBusiness?.productCategories || [];

    // Build hierarchical tree for professional display
    const categoryTree = useMemo(() => {
        const categories: ProductCategory[] = rawCategories.map(cat =>
            typeof cat === 'string' ? { id: cat, name: cat } : cat
        );

        const tree: CategoryTreeNode[] = [];
        const map = new Map<string, CategoryTreeNode>();

        // Initialize map
        categories.forEach(cat => {
            map.set(cat.id, { ...cat, children: [] });
        });

        // Build tree
        categories.forEach(cat => {
            const node = map.get(cat.id)!;
            if (cat.parentId && map.has(cat.parentId)) {
                map.get(cat.parentId)!.children.push(node);
            } else {
                tree.push(node);
            }
        });

        // Sort alphabetically
        const sortTree = (nodes: any[]) => {
            nodes.sort((a, b) => a.name.localeCompare(b.name));
            nodes.forEach(n => sortTree(n.children));
        };
        sortTree(tree);

        return tree;
    }, [rawCategories]);

    if (isLoading) return <div className="p-8"><div className="w-full h-64 rounded-3xl bg-[var(--color-surface-container-low)] animate-pulse" /></div>;

    return (
        <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--color-on-surface)]">Product Categories</h1>
                    <p className="text-sm font-medium text-[var(--color-on-surface-variant)] opacity-60">
                        Organize your store catalog with professional hierarchical groups.
                    </p>
                </div>
                <div className="flex gap-3 shrink-0">
                    <Button
                        onClick={() => {
                            setIsAiAutoTrigger(true);
                            setIsSheetOpen(true);
                        }}
                        variant="outline"
                        className="h-14 px-6 rounded-[var(--radius-m3-xl)] gap-2 border-[var(--color-primary)]/30 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 active:scale-95 transition-all"
                    >
                        <Sparkles size={20} className="text-[var(--color-primary)]" /> <span className="text-lg font-bold">AI Assist</span>
                    </Button>
                    <Button
                        onClick={() => setIsSheetOpen(true)}
                        className="h-14 px-8 rounded-[var(--radius-m3-xl)] gap-2 shadow-[var(--shadow-m3-2)] hover:shadow-[var(--shadow-m3-3)] transition-all bg-[var(--color-primary)] text-[var(--color-on-primary)] active:scale-95 shrink-0"
                    >
                        <Plus size={22} strokeWidth={3} /> <span className="text-lg font-bold">Manage</span>
                    </Button>
                </div>
            </div>

            {categoryTree.length === 0 ? (
                <div className="bg-[var(--color-surface-container-low)] border-2 border-dashed border-[var(--color-outline-variant)]/20 rounded-[2.5rem] py-20 flex flex-col items-center text-center opacity-40">
                    <Layers size={64} className="mb-4 text-[var(--color-primary)]" />
                    <h3 className="text-2xl font-black text-[var(--color-on-surface)]">Catalog is empty</h3>
                    <p className="text-sm mt-2 max-w-xs">Use AI Assist or click Manage to build your category hierarchy.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {categoryTree.map((parent) => (
                        <div
                            key={parent.id}
                            onClick={() => {
                                setSelectedCategoryId(parent.id);
                                setIsSheetOpen(true);
                            }}
                            className="group cursor-pointer flex flex-col bg-[var(--color-surface-container-low)] rounded-[2rem] border border-[var(--color-outline-variant)]/10 shadow-[var(--shadow-m3-1)] hover:shadow-[var(--shadow-m3-2)] hover:border-[var(--color-primary)]/30 transition-all overflow-hidden h-fit"
                        >
                            <div className="p-6 pb-4 flex items-center justify-between border-b border-[var(--color-outline-variant)]/5 bg-[var(--color-surface-container-high)]/30">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center shadow-inner">
                                        <FolderTree size={24} />
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="text-xl font-black text-[var(--color-on-surface)] tracking-tight">{parent.name}</h3>
                                        <span className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-widest opacity-70">
                                            {parent.children.length} {parent.children.length === 1 ? 'Subcategory' : 'Subcategories'}
                                        </span>
                                    </div>
                                </div>
                                <ChevronRight size={18} className="text-[var(--color-on-surface-variant)] opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </div>

                            <div className="p-4 space-y-1.5 min-h-[60px]">
                                {parent.children.length > 0 ? (
                                    <>
                                        {parent.children.slice(0, 4).map((child) => (
                                            <div key={child.id} className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/5 hover:border-[var(--color-primary)]/20 transition-all group/item">
                                                <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] opacity-40 group-hover/item:scale-125 group-hover/item:opacity-100 transition-all" />
                                                <span className="font-bold text-[var(--color-on-surface-variant)] text-sm">{child.name}</span>
                                            </div>
                                        ))}
                                        {parent.children.length > 4 && (
                                            <div className="flex items-center justify-center pt-2">
                                                <div className="flex items-center gap-2 px-6 py-2 rounded-full bg-[var(--color-primary)]/5 text-[var(--color-primary)] text-xs font-black uppercase tracking-widest hover:bg-[var(--color-primary)]/10 transition-all active:scale-95 shadow-sm">
                                                    More details <ChevronRight size={14} strokeWidth={3} />
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="py-4 px-2 italic text-xs text-[var(--color-on-surface-variant)] opacity-40">
                                        No subcategories defined
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <CategorySheet
                open={isSheetOpen}
                onClose={() => {
                    setIsSheetOpen(false);
                    setIsAiAutoTrigger(false);
                    setSelectedCategoryId(undefined);
                }}
                autoAi={isAiAutoTrigger}
                initialParentId={selectedCategoryId}
            />
        </div>
    );
}
