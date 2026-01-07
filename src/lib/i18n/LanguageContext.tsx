
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, Language } from "./translations";

type TranslationKey = string;

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [language, setLanguageState] = useState<Language>("en");

    // Load language from localStorage if available
    useEffect(() => {
        const savedLang = localStorage.getItem("bized-language") as Language;
        if (savedLang && translations[savedLang]) {
            setLanguageState(savedLang);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem("bized-language", lang);
        document.documentElement.lang = lang;
    };

    const t = (path: string): string => {
        const keys = path.split(".");
        let result: any = translations[language];

        for (const key of keys) {
            if (result && result[key]) {
                result = result[key];
            } else {
                return path; // Fallback to key if not found
            }
        }

        return typeof result === "string" ? result : path;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
};
