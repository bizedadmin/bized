import { en } from "./locales/en";
import { fr } from "./locales/fr";
import { es } from "./locales/es";
import { pt } from "./locales/pt";

export const translations = {
    en,
    fr,
    es,
    pt
} as const;

export type Language = keyof typeof translations;
