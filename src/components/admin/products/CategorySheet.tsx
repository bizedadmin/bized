"use client";

import React, { useState, useEffect, useMemo } from "react";
import { FolderTree, Plus, Trash2, Loader2, ChevronRight, CornerDownRight, Sparkles, CheckCircle2, Pencil, Check, X } from "lucide-react";
import { useBusiness, ProductCategory } from "@/contexts/BusinessContext";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { cn } from "@/lib/utils";

type CategoryTreeNode = ProductCategory & { children: CategoryTreeNode[] };

interface CategorySheetProps {
    open: boolean;
    onClose: () => void;
    autoAi?: boolean;
    initialParentId?: string;
}

export function CategorySheet({ open, onClose, autoAi, initialParentId }: CategorySheetProps) {
    const { currentBusiness, updateBusiness } = useBusiness();
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryParent, setNewCategoryParent] = useState<string>("");
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState("");
    const [isAutoImporting, setIsAutoImporting] = useState(false);

    // AI Assist States
    const [isAiSheetOpen, setIsAiSheetOpen] = useState(false);
    const [aiResults, setAiResults] = useState<{ name: string; subcategories: string[]; selected: boolean }[]>([]);
    const [isAiLoading, setIsAiLoading] = useState(false);

    // Initialize & Migrate categories from context when sheet opens
    useEffect(() => {
        if (!currentBusiness || !open) return;

        const rawCategories = currentBusiness.productCategories || [];
        let migratedCategories: ProductCategory[] = [];
        let needsSave = false;

        // 1. Migrate existing string categories to objects
        rawCategories.forEach(cat => {
            if (typeof cat === 'string') {
                migratedCategories.push({
                    id: Math.random().toString(36).substr(2, 9),
                    name: cat
                });
                needsSave = true;
            } else {
                migratedCategories.push(cat);
            }
        });

        // 2. Auto-import categories if none exist but products have them
        if (migratedCategories.length === 0 && currentBusiness.products && currentBusiness.products.length > 0) {
            const productCategories = new Set(
                currentBusiness.products
                    .map(p => p.category?.trim())
                    .filter(c => c && c.length > 0)
            );

            if (productCategories.size > 0) {
                setIsAutoImporting(true);
                Array.from(productCategories).forEach(catName => {
                    migratedCategories.push({
                        id: Math.random().toString(36).substr(2, 9),
                        name: catName as string
                    });
                });
                needsSave = true;
            }
        }

        if (needsSave) {
            updateBusiness({ productCategories: migratedCategories }).then(() => {
                setIsAutoImporting(false);
            });
        }

        setCategories(migratedCategories);
    }, [currentBusiness, open, updateBusiness]);

    // Handle autoAi and initialParentId
    useEffect(() => {
        if (open && autoAi && categories.length >= 0) {
            handleFetchAiCategories();
        }
        if (open && initialParentId) {
            setNewCategoryParent(initialParentId);
        } else if (open) {
            setNewCategoryParent("");
        }
    }, [open, autoAi, initialParentId]);

    // Build hierarchical tree
    const categoryTree = useMemo(() => {
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

        // STRICT FILTERING: If initialParentId is provided, only show that branch
        if (initialParentId) {
            return tree.filter(node => node.id === initialParentId);
        }

        return tree;
    }, [categories, initialParentId]);

    const handleAddCategory = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const trimmed = newCategoryName.trim();
        if (!trimmed) return;

        // Prevent exact duplicates at the same level
        if (categories.some(c => c.name.toLowerCase() === trimmed.toLowerCase() && c.parentId === (newCategoryParent || undefined))) {
            alert("This category already exists at this level.");
            return;
        }

        const newCat: ProductCategory = {
            id: Math.random().toString(36).substr(2, 9),
            name: trimmed,
            ...(newCategoryParent ? { parentId: newCategoryParent } : {})
        };

        const newCategories = [...categories, newCat];
        setCategories(newCategories);
        setNewCategoryName("");
        setNewCategoryParent("");

        // Auto-save instantly
        await updateBusiness({ productCategories: newCategories });
    };

    const handleRemoveCategory = async (catToRemove: ProductCategory) => {
        // ... previous logic ...
        const idsToRemove = new Set<string>([catToRemove.id]);

        const collectChildren = (parentId: string) => {
            categories.filter(c => c.parentId === parentId).forEach(child => {
                idsToRemove.add(child.id);
                collectChildren(child.id);
            });
        };
        collectChildren(catToRemove.id);

        const confirmMsg = idsToRemove.size > 1
            ? `Remove category "${catToRemove.name}" and ALL its ${idsToRemove.size - 1} subcategories? Products using these categories will not be deleted, but they will lose their category association if re-edited.`
            : `Remove category "${catToRemove.name}"? Products using this category will not be deleted, but they will lose their category association if re-edited.`;

        if (!confirm(confirmMsg)) return;

        const newCategories = categories.filter(c => !idsToRemove.has(c.id));
        setCategories(newCategories);

        // Auto-save instantly
        await updateBusiness({ productCategories: newCategories });
    };

    const handleUpdateCategoryName = async (id: string, newName: string) => {
        const trimmed = newName.trim();
        if (!trimmed) return;

        const newCategories = categories.map(c => c.id === id ? { ...c, name: trimmed } : c);
        setCategories(newCategories);
        setEditingCategoryId(null);
        await updateBusiness({ productCategories: newCategories });
    };

    const handleFetchAiCategories = async () => {
        if (!currentBusiness?._id) return;

        setIsAiLoading(true);
        setIsAiSheetOpen(true);

        try {
            const response = await fetch("/api/ai/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    storeId: currentBusiness._id,
                    industry: currentBusiness.industry,
                    businessType: currentBusiness.businessType
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Failed to fetch categories");
            }

            const data = await response.json();
            setAiResults((data.categories || []).map((cat: any) => ({ ...cat, selected: true })));
        } catch (error) {
            console.error("AI Error:", error);
            alert(error instanceof Error ? error.message : "AI suggestion failed");
            setIsAiSheetOpen(false);
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleApplyAiCategories = async () => {
        const selected = aiResults.filter(r => r.selected);
        if (selected.length === 0) return;

        let newCategories = [...categories];

        selected.forEach(aiCat => {
            // Check if parent category exists, if not create it
            let parentId = "";
            const existingParent = newCategories.find(c => c.name.toLowerCase() === aiCat.name.toLowerCase() && !c.parentId);

            if (existingParent) {
                parentId = existingParent.id;
            } else {
                parentId = Math.random().toString(36).substr(2, 9);
                newCategories.push({
                    id: parentId,
                    name: aiCat.name
                });
            }

            // Add subcategories
            aiCat.subcategories.forEach(subName => {
                const exists = newCategories.some(c => c.name.toLowerCase() === subName.toLowerCase() && c.parentId === parentId);
                if (!exists) {
                    newCategories.push({
                        id: Math.random().toString(36).substr(2, 9),
                        name: subName,
                        parentId
                    });
                }
            });
        });

        setCategories(newCategories);
        setIsAiSheetOpen(false);
        await updateBusiness({ productCategories: newCategories });
    };

    // Recursive render function for category tree
    const renderNode = (node: CategoryTreeNode, level = 0) => {
        const isEditing = editingCategoryId === node.id;
        const isTargetParent = node.id === initialParentId;

        return (
            <React.Fragment key={node.id}>
                <div className={cn(
                    "flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/10 group transition-all",
                    isEditing ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/10" :
                        isTargetParent ? "border-[var(--color-primary)]/40 bg-[var(--color-primary)]/5" :
                            "hover:border-[var(--color-primary)]/30"
                )}>
                    <div className="flex items-center gap-3 w-full min-w-0" style={{ paddingLeft: `${level * 24}px` }}>
                        <div className="flex items-center gap-2 text-[var(--color-on-surface-variant)] opacity-60 shrink-0">
                            {level > 0 ? (
                                <CornerDownRight size={16} className="mt-[-8px] text-[var(--color-primary)] opacity-50" />
                            ) : (
                                <FolderTree size={16} />
                            )}
                        </div>

                        {isEditing ? (
                            <input
                                autoFocus
                                value={editingName}
                                onChange={e => setEditingName(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') handleUpdateCategoryName(node.id, editingName);
                                    if (e.key === 'Escape') setEditingCategoryId(null);
                                }}
                                className="flex-1 bg-transparent border-none outline-none font-bold text-sm text-[var(--color-on-surface)]"
                            />
                        ) : (
                            <span className="font-bold text-sm text-[var(--color-on-surface)] truncate">{node.name}</span>
                        )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                        {isEditing ? (
                            <>
                                <button
                                    type="button"
                                    onClick={() => handleUpdateCategoryName(node.id, editingName)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-green-600 hover:bg-green-500/10 transition-all"
                                >
                                    <Check size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditingCategoryId(null)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-500/10 transition-all"
                                >
                                    <X size={16} />
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingCategoryId(node.id);
                                        setEditingName(node.name);
                                    }}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-on-surface-variant)] opacity-0 group-hover:opacity-60 hover:opacity-100 hover:bg-[var(--color-on-surface-variant)]/5 transition-all"
                                    title="Edit Name"
                                >
                                    <Pencil size={14} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveCategory(node)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 transition-all"
                                    title="Remove Category"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
                {node.children.map(child => renderNode(child, level + 1))}
            </React.Fragment>
        );
    };

    return (
        <>
            <Sheet
                open={open}
                onClose={onClose}
                title={initialParentId ? `Manage ${categories.find(c => c.id === initialParentId)?.name || 'Category'}` : "Manage Categories"}
                icon={<FolderTree size={20} />}
                footer={
                    <Button
                        type="button"
                        onClick={onClose}
                        className="w-full h-12 rounded-xl font-bold bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-highest)]"
                    >
                        Done
                    </Button>
                }
            >
                <div className="space-y-6">
                    <p className="text-sm font-medium text-[var(--color-on-surface-variant)] opacity-80">
                        {initialParentId
                            ? `Customize your subcategories for ${categories.find(c => c.id === initialParentId)?.name}.`
                            : "Organize your product catalog with standardized categories and subcategories."
                        }
                    </p>

                    {/* Add Category Form (changed to div to avoid nested forms) */}
                    <div className="space-y-3 bg-[var(--color-surface-container-low)] p-4 rounded-2xl border border-[var(--color-outline-variant)]/10">
                        <div className="flex flex-col gap-1.5 pb-2 border-b border-[var(--color-outline-variant)]/10">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-[var(--color-on-surface-variant)] opacity-60 uppercase tracking-widest pl-1">
                                    {initialParentId ? "Add Subcategory" : "Create New"}
                                </label>
                                {!initialParentId && (
                                    <button
                                        type="button"
                                        onClick={handleFetchAiCategories}
                                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-[10px] font-black hover:bg-[var(--color-primary)]/20 transition-all active:scale-95"
                                    >
                                        <Sparkles size={12} /> AI ASSIST
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <select
                                value={newCategoryParent}
                                onChange={e => setNewCategoryParent(e.target.value)}
                                disabled={!!initialParentId}
                                className={cn(
                                    "w-full h-11 px-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 text-sm font-medium outline-none transition-all appearance-none cursor-pointer",
                                    !!initialParentId ? "opacity-50 cursor-not-allowed bg-[var(--color-surface-container-low)]" : "focus:border-[var(--color-primary)]"
                                )}
                            >
                                <option value="">Top Level Category (No Parent)</option>
                                {/* Flatten tree for select dropdown */}
                                {categories.sort((a, b) => a.name.localeCompare(b.name)).map(cat => (
                                    <option key={cat.id} value={cat.id}>Inside: {cat.name}</option>
                                ))}
                            </select>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    autoFocus={!!initialParentId}
                                    placeholder="Category Name..."
                                    value={newCategoryName}
                                    onChange={e => setNewCategoryName(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddCategory();
                                        }
                                    }}
                                    className="flex-1 h-11 px-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)]/20 text-sm font-medium outline-none focus:border-[var(--color-primary)] transition-all shadow-inner"
                                />
                                <Button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleAddCategory();
                                    }}
                                    disabled={!newCategoryName.trim()}
                                    className="h-11 px-4 rounded-xl bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-sm font-bold flex items-center shrink-0"
                                >
                                    <Plus size={18} />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Auto-import alert */}
                    {isAutoImporting && (
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 flex items-start gap-2 text-xs">
                            <Loader2 size={14} className="animate-spin shrink-0 mt-0.5" />
                            <div><span className="font-bold">Auto-importing</span> existing categories...</div>
                        </div>
                    )}

                    {/* Category List */}
                    <div className="space-y-2 pt-2 border-t border-[var(--color-outline-variant)]/10">
                        {categoryTree.length === 0 ? (
                            <div className="py-8 flex flex-col items-center text-center opacity-40">
                                <FolderTree size={32} className="mb-3" />
                                <h3 className="text-sm font-bold text-[var(--color-on-surface)]">No categories yet</h3>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2 relative z-[100]">
                                {categoryTree.map(node => renderNode(node))}
                            </div>
                        )}
                    </div>
                </div>
            </Sheet>

            {/* AI Suggestions Sheet */}
            <Sheet
                open={isAiSheetOpen}
                onClose={() => !isAiLoading && setIsAiSheetOpen(false)}
                title="AI Category Suggestions"
                icon={<Sparkles size={20} />}
                footer={
                    <div className="flex gap-3 w-full">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsAiSheetOpen(false)}
                            disabled={isAiLoading}
                            className="flex-1 rounded-xl font-bold"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleApplyAiCategories}
                            disabled={isAiLoading || aiResults.length === 0}
                            className="flex-[2] rounded-xl font-bold bg-[var(--color-primary)] text-white"
                        >
                            Apply Selected
                        </Button>
                    </div>
                }
            >
                <div className="space-y-6">
                    <p className="text-sm font-medium text-[var(--color-on-surface-variant)] opacity-80">
                        Suggested categories for your <strong>{currentBusiness?.industry}</strong> business.
                    </p>

                    {isAiLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)]" />
                            <p className="text-sm font-bold opacity-60 animate-pulse">Analyzing industry trends...</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {aiResults.map((cat, i) => (
                                <div key={i} className="space-y-2">
                                    <label className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/10 cursor-pointer hover:bg-[var(--color-surface-container-high)] transition-all group">
                                        <div className="relative flex items-center justify-center">
                                            <input
                                                type="checkbox"
                                                checked={cat.selected}
                                                onChange={e => {
                                                    const newR = [...aiResults];
                                                    newR[i].selected = e.target.checked;
                                                    setAiResults(newR);
                                                }}
                                                className="peer appearance-none w-5 h-5 rounded border-2 border-[var(--color-outline-variant)]/30 checked:bg-[var(--color-primary)] checked:border-[var(--color-primary)] transition-all cursor-pointer"
                                            />
                                            <CheckCircle2 size={14} className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors truncate">{cat.name}</p>
                                            <p className="text-[10px] text-[var(--color-on-surface-variant)] opacity-60 truncate">
                                                {cat.subcategories.join(", ")}
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Sheet>
        </>
    );
}
