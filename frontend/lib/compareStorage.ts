// frontend/lib/compareStorage.ts
import { toast } from "sonner";

const COMPARE_KEY = "compare_properties";
const MAX_COMPARE = 3;

export function getCompareList(): string[] {
    if (typeof window === "undefined") return [];
    try {
        const data = localStorage.getItem(COMPARE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

export function addToCompare(id: string): string[] {
    const list = getCompareList();
    if (list.includes(id)) return list;
    
    if (list.length >= MAX_COMPARE) {
        toast.error(`You can compare up to ${MAX_COMPARE} properties`);
        return list;
    }
    
    const newList = [...list, id];
    localStorage.setItem(COMPARE_KEY, JSON.stringify(newList));
    window.dispatchEvent(new CustomEvent("compareUpdated", { detail: newList }));
    toast.success("Added to comparison list");
    return newList;
}

export function removeFromCompare(id: string): string[] {
    const list = getCompareList();
    const newList = list.filter((item) => item !== id);
    localStorage.setItem(COMPARE_KEY, JSON.stringify(newList));
    window.dispatchEvent(new CustomEvent("compareUpdated", { detail: newList }));
    return newList;
}

export function toggleCompare(id: string): string[] {
    const list = getCompareList();
    if (list.includes(id)) {
        return removeFromCompare(id);
    } else {
        return addToCompare(id);
    }
}

export function clearCompare(): void {
    localStorage.removeItem(COMPARE_KEY);
    window.dispatchEvent(new CustomEvent("compareUpdated", { detail: [] }));
}
