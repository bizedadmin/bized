"use client";
import React, { useState, useEffect } from "react";
import {
    MessageSquare,
    Smartphone,
    ShieldCheck,
    Zap,
    ArrowRight,
    CheckCircle2,
    Database,
    CreditCard,
    Settings2,
    UploadCloud,
    RefreshCw,
    CheckCircle,
    Clock,
    Plus,
    Copy,
    Save,
    Edit3,
    Trash2,
    Layout,
    GripVertical,
    ChevronRight,
    Search,
    ChevronLeft,
    Layers,
    Activity,
    Target,
    X
} from "lucide-react";

export default function OnboardingBuilderPage() {
    const [activePhase, setActivePhase] = useState(1);
    const [activeStep, setActiveStep] = useState("p1_s1");

    const [loading, setLoading] = useState<number | null>(null);
    const [statuses, setStatuses] = useState<Record<number, string>>({
        1: "DRAFT",
        2: "READY",
        3: "AUTOMATED",
        4: "DRAFT"
    });

    const [toast, setToast] = useState<{ visible: boolean; message: string } | null>(null);

    const [journey, setJourney] = useState([
        {
            phase: 1,
            title: "Discovery & Lead Capture",
            subtitle: "Phase 1: WhatsApp Anchor Data",
            steps: [
                { id: "p1_s1", type: "MESSAGE", sublabel: "Initial Contact", title: "Step 1: Welcome Pitch", content: "Welcome to the future of Commerce. Reply with your Business Name to launch your AI-powered WhatsApp storefront instantly.", badge: "Marketing", icon: <MessageSquare className="w-4 h-4" />, buttonText: "Start Selling" },
                { id: "p1_s2", type: "SCREEN", sublabel: "Identity Form", title: "Step 2: Business Identity", fields: ["Business Name (Text Input)", "Business Category (Dropdown)"], icon: <Smartphone className="w-4 h-4" />, buttonText: "Continue" },
                { id: "p1_s3", type: "SCREEN", sublabel: "Migration Logic", title: "Step 3: Number Transition", fields: ["Number Status (Radio: New vs. Existing)"], icon: <Smartphone className="w-4 h-4" />, buttonText: "Next Step" },
                { id: "p1_s4", type: "MESSAGE", sublabel: "Next Steps", title: "Step 4: Session Bridge", content: "Ready to launch? Complete your secure provisioning here: https://bized.app/onboard?session={{flow_token}}", badge: "Utility", icon: <Layers className="w-4 h-4" />, buttonText: "Setup with Meta" }
            ]
        },
        {
            phase: 2,
            title: "Permissioning",
            subtitle: "Phase 2: Secure Meta Link",
            steps: [
                { id: "p2_s1", type: "SYSTEM", sublabel: "Auth Flow", title: "Secure Login Bridge", description: "Detects session_id from URL and triggers FB.login popup for WABA selection.", icon: <ShieldCheck className="w-4 h-4" /> }
            ]
        },
        {
            phase: 3,
            title: "Provisioning",
            subtitle: "Phase 3: Automated Sync",
            steps: [
                { id: "p3_s1", type: "SYSTEM", sublabel: "API Sync", title: "Zero-Input Data Harvest", description: "Server-side harvest of Address, Email, and 6-month chat history via Meta Graph API.", icon: <Database className="w-4 h-4" /> }
            ]
        },
        {
            phase: 4,
            title: "Operational Config",
            subtitle: "Phase 4: Final Activation",
            steps: [
                { id: "p4_s1", type: "SCREEN", sublabel: "Vertical Logic", title: "Step 1: Commerce Niche", fields: ["Niche Selection (HVAC/Solar/Retail)"], icon: <Smartphone className="w-4 h-4" />, buttonText: "Next" },
                { id: "p4_s2", type: "SCREEN", sublabel: "Global Config", title: "Step 2: Payment Parameters", fields: ["Currency (KES/USD)", "Region Target"], icon: <Smartphone className="w-4 h-4" />, buttonText: "Finish Setup" },
                { id: "p4_s3", type: "MESSAGE", sublabel: "Go Live", title: "Step 3: Goal Success", content: "Welcome {{business_name}}! Your shop is live on Bized. Access your dashboard below.", badge: "Success", icon: <Target className="w-4 h-4" /> }
            ]
        }
    ]);

    const handleUpdate = (stepId: string, newData: any) => {
        setJourney(prev => prev.map(phase => ({
            ...phase,
            steps: phase.steps.map(step =>
                step.id === stepId ? { ...step, ...newData } : step
            )
        })));
    };

    const handleSave = () => {
        setToast({ visible: true, message: "Template Bundle saved successfully" });
        setTimeout(() => setToast(null), 3000);
    };

    const currentPhaseData = journey.find(p => p.phase === activePhase);
    const currentStepData = currentPhaseData?.steps.find(s => s.id === activeStep) || currentPhaseData?.steps[0];

    const submitToMeta = async (phase: number) => {
        setLoading(phase);
        try {
            const res = await fetch("/api/hq/onboarding/templates", {
                method: "POST",
                body: JSON.stringify({ action: "submit_design", phase }),
                headers: { "Content-Type": "application/json" }
            });
            const data = await res.json();
            if (data.success) {
                setStatuses(prev => ({ ...prev, [phase]: "IN_REVIEW" }));
                setToast({ visible: true, message: "Pushed to Meta for review" });
                setTimeout(() => setToast(null), 3000);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="flex h-[calc(100vh-100px)] bg-zinc-950 overflow-hidden rounded-[2.5rem] border border-zinc-900 shadow-2xl animate-in fade-in zoom-in-95 duration-700 relative">

            {/* LEFT SIDEBAR: VERTICAL TABS */}
            <div className="w-80 border-r border-zinc-900 flex flex-col bg-zinc-950 relative z-20">
                <div className="p-8 border-b border-zinc-900">
                    <div className="flex items-center gap-3 text-indigo-500 font-black text-xs uppercase tracking-widest mb-2">
                        <Activity className="w-4 h-4" /> Onboarding Engine
                    </div>
                    <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase whitespace-nowrap">Architect <span className="text-zinc-700">HQ</span></h1>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-8 scrollbar-hide py-8">
                    {journey.map((phase) => (
                        <div key={phase.phase} className="space-y-2">
                            <div
                                onClick={() => setActivePhase(phase.phase)}
                                className={`px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer transition-colors ${activePhase === phase.phase ? 'text-indigo-400' : 'text-zinc-600 hover:text-zinc-400'}`}
                            >
                                {phase.title}
                            </div>
                            <div className="space-y-1">
                                {phase.steps.map((step) => (
                                    <div
                                        key={step.id}
                                        onClick={() => {
                                            setActivePhase(phase.phase);
                                            setActiveStep(step.id);
                                        }}
                                        className={`group relative flex items-center gap-3 px-4 py-3 cursor-pointer rounded-2xl transition-all duration-300 ${activeStep === step.id ? 'bg-indigo-600/10 text-white' : 'text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-300'}`}
                                    >
                                        {activeStep === step.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full" />}
                                        <div className={`p-2 rounded-xl border ${activeStep === step.id ? 'border-indigo-500/50 bg-indigo-500/20 text-indigo-400' : 'border-zinc-800 bg-zinc-900 text-zinc-600 group-hover:border-zinc-700'}`}>
                                            {step.icon}
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <div className="text-[10px] font-black uppercase tracking-widest truncate leading-none mb-1">{step.sublabel}</div>
                                            <div className="text-[11px] font-bold italic truncate opacity-70 whitespace-nowrap">{step.title}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-6 bg-zinc-900/30 border-t border-zinc-900">
                    <button onClick={handleSave} className="w-full py-4 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2">
                        <UploadCloud className="w-4 h-4" /> Deploy All Changes
                    </button>
                </div>
            </div>

            {/* MAIN WORKSPACE */}
            <div className="flex-1 flex flex-col bg-zinc-900/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-600/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

                {/* Workspace Header */}
                <div className="h-24 border-b border-zinc-900 flex items-center justify-between px-10 relative z-10 backdrop-blur-md">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 leading-none mb-1">Editing Mode</span>
                            <span className="text-lg font-black text-white italic tracking-tighter uppercase">{currentStepData?.title}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <StatusBadge status={statuses[activePhase]} />
                        {statuses[activePhase] === "DRAFT" && activePhase !== 2 && activePhase !== 3 && (
                            <button
                                onClick={() => submitToMeta(activePhase)}
                                disabled={loading === activePhase}
                                className="h-10 px-6 bg-white text-indigo-950 text-[10px] font-black uppercase italic rounded-xl flex items-center gap-2 hover:bg-zinc-200 transition disabled:opacity-50"
                            >
                                {loading === activePhase ? <RefreshCw className="w-3 h-3 animate-spin text-indigo-500" /> : <UploadCloud className="w-3 h-3 text-indigo-500" />}
                                Push to Meta
                            </button>
                        )}
                    </div>
                </div>

                {/* Editor Content Area */}
                <div className="flex-1 overflow-y-auto p-12 relative z-10 scrollbar-hide">
                    <div className="max-w-4xl mx-auto py-4">
                        {currentStepData?.type === "MESSAGE" && (
                            <MessageEditor
                                data={currentStepData}
                                onUpdate={(newData: any) => handleUpdate(currentStepData.id, newData)}
                                onSave={handleSave}
                            />
                        )}
                        {currentStepData?.type === "SCREEN" && (
                            <ScreenEditor
                                data={currentStepData}
                                onUpdate={(newData: any) => handleUpdate(currentStepData.id, newData)}
                                onSave={handleSave}
                            />
                        )}
                        {currentStepData?.type === "SYSTEM" && (
                            <SystemProcessView data={currentStepData} />
                        )}
                    </div>
                </div>
            </div>

            {/* M3 SNACKBAR */}
            {toast && (
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-8 duration-500">
                    <div className="bg-zinc-900 border border-zinc-800 text-white rounded-2xl py-4 px-6 flex items-center gap-6 shadow-2xl min-w-[320px] overflow-hidden relative">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div className="flex-1 flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-0.5">Architect Notification</span>
                            <span className="text-xs font-bold italic text-white underline underline-offset-4 decoration-indigo-500/30">{toast.message}</span>
                        </div>
                        <button onClick={() => setToast(null)} className="p-1.5 hover:bg-zinc-800 rounded-lg transition text-zinc-600 hover:text-white">
                            <X className="w-4 h-4" />
                        </button>

                        {/* PROGRESS INDICATOR */}
                        <div className="absolute bottom-0 left-0 h-[2px] bg-indigo-500 progress-bar-anim" style={{ width: '100%' }} />
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes progressShrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                .progress-bar-anim {
                    animation: progressShrink 3s linear forwards;
                }
            `}</style>
        </div>
    );
}

// ---------------- SUB-COMPONENTS -----------------

function StatusBadge({ status }: any) {
    const badges: any = {
        DRAFT: <div className="flex items-center gap-2 px-4 py-1.5 bg-zinc-950 border border-zinc-800 rounded-full text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-none italic"><Clock className="w-3 h-3" /> Draft</div>,
        IN_REVIEW: <div className="flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none italic animate-pulse"><RefreshCw className="w-3 h-3" /> In Review</div>,
        READY: <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-[9px] font-black text-emerald-400 uppercase tracking-widest leading-none italic"><CheckCircle className="w-3 h-3" /> Active</div>,
        AUTOMATED: <div className="flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-[9px] font-black text-amber-400 uppercase tracking-widest leading-none italic"><Activity className="w-3 h-3" /> Managed</div>
    };
    return badges[status] || badges["DRAFT"];
}

function MessageEditor({ data, onUpdate, onSave }: any) {
    return (
        <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-500 shadow-xl shadow-indigo-600/5">
                    <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">Template Content</h3>
                    <p className="text-zinc-600 text-xs font-black uppercase tracking-widest mt-1">Configuring outgoing WhatsApp Notification</p>
                </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-900 rounded-[3rem] p-10 space-y-10 shadow-2xl overflow-hidden relative group">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <span className="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-[8px] font-black text-indigo-400 uppercase tracking-widest italic">{data.badge} Type</span>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-600 tracking-widest italic">
                            <Activity className="w-3 h-3 text-indigo-500" /> Interactive CTA Active
                        </div>
                    </div>
                    <button className="p-3 bg-zinc-900 rounded-2xl border border-zinc-800 text-zinc-600 hover:text-white transition group-hover:border-zinc-700"><Copy className="w-4 h-4" /></button>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 pl-2">Message Body (WhatsApp Text Bundle)</label>
                    <textarea
                        className="w-full bg-zinc-900/50 border border-zinc-900 rounded-[2rem] p-8 text-white italic text-lg focus:outline-none focus:border-indigo-500/30 transition-all min-h-[180px] shadow-inner font-medium leading-relaxed"
                        value={data.content || ""}
                        onChange={(e) => onUpdate({ content: e.target.value })}
                        placeholder="Enter template message..."
                    />
                </div>

                {/* INTERACTIVE BUTTON CONFIGURATION */}
                <div className="space-y-6 pt-10 border-t border-zinc-900">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 pl-2 italic underline underline-offset-8">Primary Call-To-Action (Flow Trigger)</label>
                        <span className="text-[9px] text-zinc-700 font-black uppercase">Standard WhatsApp UI Component</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        <div className="space-y-4">
                            <div className="p-1 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center">
                                <div className="px-6 py-4 bg-zinc-950 rounded-xl border border-zinc-900 text-[10px] font-black uppercase text-zinc-500">BUTTON LABEL</div>
                                <input
                                    className="flex-1 bg-transparent px-6 py-4 text-white font-bold italic focus:outline-none placeholder:text-zinc-800"
                                    value={data.buttonText || ""}
                                    onChange={(e) => onUpdate({ buttonText: e.target.value })}
                                    placeholder="Button text..."
                                />
                            </div>
                            <p className="text-[10px] text-zinc-700 font-medium italic pl-4">Max 25 characters. This button will trigger the next Step automatically.</p>
                        </div>

                        {/* VISUAL BUTTON PREVIEW */}
                        <div className="space-y-3">
                            <div className="p-6 bg-zinc-900/30 rounded-[2.5rem] border border-zinc-900/50 flex flex-col items-center justify-center gap-4">
                                <div className="w-[85%] py-4 bg-white rounded-2xl flex items-center justify-center gap-2 shadow-[0_10px_40px_rgba(255,255,255,0.15)] text-indigo-950 font-black italic uppercase text-xs">
                                    {data.buttonText || "Action"}
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                                <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">WhatsApp UI Mockup</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-zinc-900 flex justify-end gap-4">
                    <button className="px-8 py-3 bg-zinc-950 border border-zinc-900 text-zinc-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:text-white transition">Cancel Edits</button>
                    <button onClick={onSave} className="px-8 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-500 transition shadow-xl shadow-indigo-600/20">Save Template Bundle</button>
                </div>
            </div>
        </div>
    );
}

function ScreenEditor({ data, onUpdate, onSave }: any) {
    const handleFieldEdit = (index: number, value: string) => {
        const newFields = [...data.fields];
        newFields[index] = value;
        onUpdate({ fields: newFields });
    };

    return (
        <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-xl shadow-emerald-600/5">
                    <Smartphone className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">Screen Interactions</h3>
                    <p className="text-zinc-600 text-xs font-black uppercase tracking-widest mt-1">Editing UI Fields for WhatsApp Flow</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                <div className="lg:col-span-3 space-y-8">
                    <div className="bg-zinc-950 border border-zinc-900 rounded-[3rem] p-10 space-y-8 shadow-2xl">
                        <div className="flex justify-between items-center pb-6 border-b border-zinc-900">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Component List</h4>
                            <button className="p-2 bg-zinc-900 rounded-xl text-zinc-500 hover:text-white transition"><Plus className="w-4 h-4" /></button>
                        </div>
                        <div className="space-y-4">
                            {data.fields.map((field: string, i: number) => (
                                <div key={i} className="group flex items-center gap-4 p-5 bg-zinc-900/50 border border-zinc-900 rounded-2xl hover:border-emerald-500/30 transition-all cursor-move">
                                    <GripVertical className="w-4 h-4 text-zinc-800" />
                                    <input
                                        className="flex-1 bg-transparent border-none text-white italic focus:outline-none focus:text-emerald-400 transition-colors"
                                        value={field}
                                        onChange={(e) => handleFieldEdit(i, e.target.value)}
                                    />
                                    <button className="opacity-0 group-hover:opacity-100 p-2 text-zinc-700 hover:text-red-500 transition"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            ))}
                            <div className="p-1 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center mt-8">
                                <div className="px-6 py-4 bg-zinc-950 rounded-xl border border-zinc-900 text-[10px] font-black uppercase text-zinc-500">FOOTER BUTTON</div>
                                <input
                                    className="flex-1 bg-transparent px-6 py-4 text-white font-bold italic focus:outline-none placeholder:text-zinc-800"
                                    value={data.buttonText || ""}
                                    onChange={(e) => onUpdate({ buttonText: e.target.value })}
                                    placeholder="Enter button text..."
                                />
                            </div>
                        </div>
                        <div className="pt-6 flex flex-col gap-6">
                            <button className="w-full py-6 border border-zinc-900 border-dashed rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] text-zinc-700 hover:text-emerald-400 hover:border-emerald-500/20 transition-all">+ Add New Interaction Item</button>
                            <button onClick={onSave} className="w-full py-4 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2">
                                <Save className="w-4 h-4" /> Save Screen Configuration
                            </button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="sticky top-0 bg-zinc-950 border border-zinc-900 rounded-[3.5rem] p-1 shadow-2xl">
                        <div className="bg-zinc-900 p-8 rounded-[3.4rem] space-y-8 min-h-[500px] border border-zinc-950 relative overflow-hidden">
                            <div className="bg-white/5 absolute inset-0 backdrop-blur-3xl animate-pulse" />
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-center justify-between mb-8 opacity-40">
                                    <div className="w-16 h-4 bg-zinc-800 rounded-full" />
                                    <div className="w-4 h-4 bg-zinc-800 rounded-full" />
                                </div>
                                <h5 className="text-white font-black italic uppercase text-lg leading-tight mb-8">Preview: {data.title}</h5>
                                <div className="space-y-4 flex-1">
                                    {data.fields.map((f: string, i: number) => (
                                        <div key={i} className="p-5 bg-zinc-950/50 border border-zinc-800 rounded-2xl text-[10px] font-bold text-zinc-600 italic uppercase">
                                            {f}
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-8 pt-6 border-t border-zinc-800/50 flex flex-col gap-4">
                                    <div className="w-full py-4 bg-white rounded-2xl flex items-center justify-center text-indigo-950 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-white/10 italic">
                                        {data.buttonText || "Continue"}
                                    </div>
                                    <div className="w-full h-8 bg-zinc-950/20 rounded-2xl flex items-center justify-center text-zinc-700 text-[8px] font-black uppercase tracking-widest italic opacity-30 text-center">Screen Footer</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SystemProcessView({ data }: any) {
    return (
        <div className="space-y-10 animate-in slide-in-from-right-4 duration-500 max-w-2xl mx-auto text-center">
            <div className="flex flex-col items-center gap-6">
                <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl ${data.id.includes('p2') ? 'bg-emerald-600 shadow-emerald-500/20' : 'bg-amber-600 shadow-amber-500/20'}`}>
                    {data.icon}
                </div>
                <div className="space-y-2">
                    <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">{data.title}</h3>
                    <p className="text-zinc-600 text-xs font-black uppercase tracking-widest">{data.sublabel}</p>
                </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-900 rounded-[3rem] p-12 space-y-8 shadow-2xl relative overflow-hidden">
                <p className="text-lg text-zinc-400 leading-relaxed italic border-l-4 border-zinc-800 pl-8 text-left">
                    "{data.description}"
                </p>
                <div className="flex items-center gap-3 p-4 bg-zinc-900/50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-500 italic justify-center">
                    <Activity className="w-4 h-4 animate-pulse" /> Final Automated State: No User Input Required
                </div>
            </div>
        </div>
    );
}
