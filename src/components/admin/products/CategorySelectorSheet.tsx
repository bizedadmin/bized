"use client";

import React, { useState, useMemo } from "react";
import {
    Search,
    ChevronRight,
    FolderTree,
    Settings2,
    Check,
    ChevronLeft,
    CornerDownRight,
    X
} from "lucide-react";
import { useBusiness, ProductCategory } from "@/contexts/BusinessContext";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { cn } from "@/lib/utils";

interface CategorySelectorSheetProps {
    open: boolean;
    onClose: () => void;
    onSelect: (categoryId: string) => void;
    onOpenManage: () => void;
    selectedId?: string;
}

type CategoryTreeNode = ProductCategory & { children: CategoryTreeNode[] };

export function CategorySelectorSheet({
    open,
    onClose,
    onSelect,
    onOpenManage,
    selectedId
}: CategorySelectorSheetProps) {
    const { currentBusiness } = useBusiness();
    const [searchQuery, setSearchQuery] = useState("");
    const [currentParentId, setCurrentParentId] = useState<string | null>(null);

    const categories = useMemo(() => {
        return (currentBusiness?.productCategories || []) as ProductCategory[];
    }, [currentBusiness]);

    // Build hierarchical tree
    const categoryTree = useMemo(() => {
        const tree: CategoryTreeNode[] = [];
        const map = new Map<string, CategoryTreeNode>();

        categories.forEach(cat => {
            map.set(cat.id, { ...cat, children: [] });
        });

        categories.forEach(cat => {
            const node = map.get(cat.id)!;
            if (cat.parentId && map.has(cat.parentId)) {
                map.get(cat.parentId)!.children.push(node);
            } else {
                tree.push(node);
            }
        });

        const sortTree = (nodes: CategoryTreeNode[]) => {
            nodes.sort((a, b) => a.name.localeCompare(b.name));
            nodes.forEach(n => sortTree(n.children));
        };
        sortTree(tree);

        return tree;
    }, [categories]);

    // Get flat list for searching
    const flatCategories = useMemo(() => {
        const list: { id: string; name: string; path: string[] }[] = [];

        const traverse = (nodes: CategoryTreeNode[], path: string[]) => {
            nodes.forEach(node => {
                const currentPath = [...path, node.name];
                list.push({ id: node.id, name: node.name, path: currentPath });
                traverse(node.children, currentPath);
            });
        };

        traverse(categoryTree, []);
        return list;
    }, [categoryTree]);

    const filteredSearchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const query = searchQuery.toLowerCase();
        return flatCategories.filter(cat =>
            cat.name.toLowerCase().includes(query) ||
            cat.path.join(" > ").toLowerCase().includes(query)
        );
    }, [flatCategories, searchQuery]);

    const currentLevelNodes = useMemo(() => {
        if (currentParentId === null) return categoryTree;

        const findNodes = (nodes: CategoryTreeNode[]): CategoryTreeNode[] | null => {
            for (const node of nodes) {
                if (node.id === currentParentId) return node.children;
                const found = findNodes(node.children);
                if (found) return found;
            }
            return null;
        };

        return findNodes(categoryTree) || [];
    }, [categoryTree, currentParentId]);

    const parentCategory = useMemo(() => {
        if (!currentParentId) return null;
        return categories.find(c => c.id === currentParentId);
    }, [categories, currentParentId]);

    const handleSelect = (id: string) => {
        onSelect(id);
        onClose();
        setSearchQuery("");
        setCurrentParentId(null);
    };

    return (
        <Sheet
            open={open}
            onClose={onClose}
            title="Select Category"
            icon={<FolderTree size={20} />}
            footer={
                <Button
                    type="button"
                    variant="outline"
                    onClick={onOpenManage}
                    className="w-full h-12 rounded-xl font-bold border-[var(--color-outline-variant)]/20 text-[var(--color-on-surface-variant)] flex items-center gap-2"
                >
                    <Settings2 size={18} />
                    Manage Categories
                </Button>
            }
        >
            <div className="space-y-6">
                {/* Search Header */}
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)] opacity-40 group-focus-within:opacity-100 transition-opacity" size={18} />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-12 pl-12 pr-10 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 focus:border-[var(--color-primary)] outline-none text-sm font-medium transition-all"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center hover:bg-[var(--color-surface-container-high)] transition-colors"
                        >
                            <X size={14} className="opacity-40" />
                        </button>
                    )}
                </div>

                {searchQuery.trim() ? (
                    /* Search Results */
                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-30 px-1">Search Results</p>
                        <div className="flex flex-col gap-1.5">
                            {filteredSearchResults.length === 0 ? (
                                <div className="py-12 text-center opacity-40">
                                    <p className="text-sm font-bold">No categories found</p>
                                </div>
                            ) : (
                                filteredSearchResults.map(result => (
                                    <button
                                        key={result.id}
                                        type="button"
                                        onClick={() => handleSelect(result.id)}
                                        className={cn(
                                            "w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group",
                                            selectedId === result.id
                                                ? "bg-[var(--color-primary)]/5 border-[var(--color-primary)]/30"
                                                : "bg-[var(--color-surface)] border-[var(--color-outline-variant)]/10 hover:border-[var(--color-primary)]/30"
                                        )}
                                    >
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-medium opacity-40 truncate mb-0.5">
                                                {result.path.slice(0, -1).join(" > ") || "Top Level"}
                                            </p>
                                            <p className="font-bold text-sm text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors truncate">
                                                {result.name}
                                            </p>
                                        </div>
                                        {selectedId === result.id && (
                                            <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shrink-0">
                                                <Check size={14} strokeWidth={3} />
                                            </div>
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                ) : (
                    /* Browse Mode */
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                                {currentParentId && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const parent = categories.find(c => c.id === currentParentId);
                                            setCurrentParentId(parent?.parentId || null);
                                        }}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--color-surface-container-high)] hover:bg-[var(--color-surface-container-highest)] transition-colors"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                )}
                                <h3 className="text-[10px] font-black uppercase tracking-widest opacity-30">
                                    {parentCategory ? parentCategory.name : "All Categories"}
                                </h3>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            {currentParentId && parentCategory && (
                                <button
                                    type="button"
                                    onClick={() => handleSelect(parentCategory.id)}
                                    className={cn(
                                        "w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group",
                                        selectedId === parentCategory.id
                                            ? "bg-[var(--color-primary)]/5 border-[var(--color-primary)]/40 ring-1 ring-[var(--color-primary)]/20"
                                            : "bg-[var(--color-surface-container-low)] border-[var(--color-outline-variant)]/10 hover:border-[var(--color-primary)]/30"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center shrink-0">
                                            <Check size={16} strokeWidth={3} />
                                        </div>
                                        <span className="font-bold text-sm text-[var(--color-primary)]">
                                            Select "{parentCategory.name}"
                                        </span>
                                    </div>
                                    {selectedId === parentCategory.id && (
                                        <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shrink-0">
                                            <Check size={14} strokeWidth={3} />
                                        </div>
                                    )}
                                </button>
                            )}

                            {currentLevelNodes.length === 0 ? (
                                <div className="py-12 text-center opacity-40 border-2 border-dashed border-[var(--color-outline-variant)]/10 rounded-2xl">
                                    <p className="text-sm font-bold">No subcategories</p>
                                </div>
                            ) : (
                                currentLevelNodes.map(node => (
                                    <div key={node.id} className="flex gap-1">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (node.children.length > 0) {
                                                    setCurrentParentId(node.id);
                                                } else {
                                                    handleSelect(node.id);
                                                }
                                            }}
                                            className={cn(
                                                "flex-1 text-left p-4 rounded-xl border transition-all flex items-center justify-between group",
                                                selectedId === node.id
                                                    ? "bg-[var(--color-primary)]/5 border-[var(--color-primary)]/30"
                                                    : "bg-[var(--color-surface)] border-[var(--color-outline-variant)]/10 hover:border-[var(--color-primary)]/30"
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                {node.children.length > 0 && <FolderTree size={16} className="text-[var(--color-primary)] opacity-40" />}
                                                <span className="font-bold text-sm text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors truncate">
                                                    {node.name}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {selectedId === node.id && (
                                                    <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shrink-0">
                                                        <Check size={14} strokeWidth={3} />
                                                    </div>
                                                )}
                                                {node.children.length > 0 && (
                                                    <ChevronRight size={18} className="text-[var(--color-on-surface-variant)] opacity-20 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                                                )}
                                            </div>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Sheet>
    );
}
