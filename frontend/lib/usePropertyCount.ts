import { useState, useEffect } from "react";
import { api } from "@/lib/api";

/**
 * Fetches the total count of properties from the platform stats endpoint.
 */
export function usePropertyCount() {
    const [count, setCount] = useState<number | null>(null);

    useEffect(() => {
        async function fetchCount() {
            try {
                const res = await api("/properties/stats");
                if (res && typeof res.totalConstruction === "number") {
                    setCount(res.totalConstruction);
                }
            } catch (err) {
                console.error("Failed to fetch property count:", err);
            }
        }
        fetchCount();
    }, []);

    const formatted = count !== null
        ? count >= 1000
            ? `${(count / 1000).toFixed(1)}K+`
            : `${count}+`
        : null;

    return { count, formatted };
}
