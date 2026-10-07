"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search, ChevronDown, RotateCcw } from "lucide-react";
import { budgetsBuy, budgetsRent, bedrooms } from "@/app/mock-data/mockData2";
import { api } from "@/lib/api";

const STATUS_OPTIONS = [
    { value: "", label: "Any Status" },
    { value: "READY_TO_MOVE", label: "Ready to Move" },
    { value: "NEW_LAUNCH", label: "New Launch" },
    { value: "UNDER_CONSTRUCTION", label: "Under Construction" },
];

const POSTER_OPTIONS = [
    { value: "", label: "Any Poster" },
    { value: "SELLER", label: "Seller" },
    { value: "BUILDER", label: "Builder" },
    { value: "BROKER", label: "Partner" },
];

export default function PropertyFilters({ onFilter }: any) {
    const searchParams = useSearchParams();

    const [purpose, setPurpose] = useState(searchParams.get("purpose") === "RENT" ? "Rent" : "Buy");
    const [selectedCity, setSelectedCity] = useState(searchParams.get("city") || searchParams.get("district") || "");
    const [locality, setLocality] = useState(searchParams.get("locality") || "");
    const [bhk, setBhk] = useState(searchParams.get("bhk") || "");
    const [budget, setBudget] = useState("");
    const [possessionStatus, setPossessionStatus] = useState(searchParams.get("possessionStatus") || "");
    const [posterRole, setPosterRole] = useState(searchParams.get("role") || "");

    const [cities, setCities] = useState<string[]>([]);
    const [localities, setLocalities] = useState<string[]>([]);

    // Fetch listed cities on mount
    useEffect(() => {
        const fetchCities = async () => {
            try {
                const res = await api("/properties/city-counts");
                if (Array.isArray(res)) {
                    const cityNames = res.map((item: any) => item.district).sort();
                    setCities(cityNames);
                }
            } catch (err) {
                console.error("Error fetching cities:", err);
            }
        };
        fetchCities();
    }, []);

    // Fetch localities when city changes
    useEffect(() => {
        const fetchLocalities = async () => {
            if (!selectedCity) {
                setLocalities([]);
                setLocality("");
                return;
            }
            try {
                const q = new URLSearchParams({ city: selectedCity });
                const res = await api(`/properties/localities?${q.toString()}`);
                if (Array.isArray(res)) setLocalities(res);
            } catch (err) {
                console.error("Error fetching localities:", err);
            }
        };
        fetchLocalities();
    }, [selectedCity]);

    // Initialize budget from URL
    useEffect(() => {
        const min = searchParams.get("minPrice");
        const max = searchParams.get("maxPrice");

        if (!min && !max) {
            setBudget("");
            return;
        }

        if (max === "5000000" && !min) setBudget("Under 50 Lakhs");
        else if (min === "5000000" && max === "10000000") setBudget("50 Lakhs to 1 Cr");
        else if (min === "10000000" && max === "15000000") setBudget("1 Cr to 1.5 Cr");
        else if (min === "15000000" && max === "20000000") setBudget("1.5 Cr to 2 Cr");
        else if (min === "20000000" && max === "30000000") setBudget("2 Cr to 3 Cr");
        else if (min === "30000000" && max === "40000000") setBudget("3 Cr to 4 Cr");
        else if (min === "40000000" && max === "100000000") setBudget("4 - 10 Cr");
        else if (min === "100000000" && max === "500000000") setBudget("10 - 50 Cr");
        else if (min === "500000000" && max === "1000000000") setBudget("50 - 100 Cr");
        else if (min === "1000000000" && !max) setBudget("100 Cr Above");
        else if (max === "10000" && !min) setBudget("Under 10 Thousand");
        else if (min === "10000" && max === "20000") setBudget("10k - 20k");
        else if (min === "20000" && max === "30000") setBudget("20k - 30k");
        else if (min === "30000" && max === "40000") setBudget("30k - 40k");
        else if (min === "40000" && max === "50000") setBudget("40k - 50k");
        else if (min === "50000" && max === "60000") setBudget("50k - 60k");
        else if (min === "60000" && max === "100000") setBudget("60k - 1 Lakh");
        else if (min === "100000" && max === "300000") setBudget("1 Lakh - 3 Lakhs");
        else if (min === "300000" && max === "500000") setBudget("3 Lakhs - 5 Lakhs");
        else if (min === "500000" && max === "1000000") setBudget("5 Lakhs - 10 Lakhs");
        else if (min === "1000000" && max === "2000000") setBudget("10 Lakhs - 20 Lakhs");
        else if (min === "2000000" && !max) setBudget("Above 20 Lakhs");
    }, [searchParams]);

    const handleApply = () => {
        let minPrice = "";
        let maxPrice = "";

        if (budget === "Under 50 Lakhs") maxPrice = "5000000";
        else if (budget === "50 Lakhs to 1 Cr") { minPrice = "5000000"; maxPrice = "10000000"; }
        else if (budget === "1 Cr to 1.5 Cr") { minPrice = "10000000"; maxPrice = "15000000"; }
        else if (budget === "1.5 Cr to 2 Cr") { minPrice = "15000000"; maxPrice = "20000000"; }
        else if (budget === "2 Cr to 3 Cr") { minPrice = "20000000"; maxPrice = "30000000"; }
        else if (budget === "3 Cr to 4 Cr") { minPrice = "30000000"; maxPrice = "40000000"; }
        else if (budget === "4 - 10 Cr") { minPrice = "40000000"; maxPrice = "100000000"; }
        else if (budget === "10 - 50 Cr") { minPrice = "100000000"; maxPrice = "500000000"; }
        else if (budget === "50 - 100 Cr") { minPrice = "500000000"; maxPrice = "1000000000"; }
        else if (budget === "100 Cr Above") { minPrice = "1000000000"; }
        else if (budget === "Under 10 Thousand") maxPrice = "10000";
        else if (budget === "10k - 20k") { minPrice = "10000"; maxPrice = "20000"; }
        else if (budget === "20k - 30k") { minPrice = "20000"; maxPrice = "30000"; }
        else if (budget === "30k - 40k") { minPrice = "30000"; maxPrice = "40000"; }
        else if (budget === "40k - 50k") { minPrice = "40000"; maxPrice = "50000"; }
        else if (budget === "50k - 60k") { minPrice = "50000"; maxPrice = "60000"; }
        else if (budget === "60k - 1 Lakh") { minPrice = "60000"; maxPrice = "100000"; }
        else if (budget === "1 Lakh - 3 Lakhs") { minPrice = "100000"; maxPrice = "300000"; }
        else if (budget === "3 Lakhs - 5 Lakhs") { minPrice = "300000"; maxPrice = "500000"; }
        else if (budget === "5 Lakhs - 10 Lakhs") { minPrice = "500000"; maxPrice = "1000000"; }
        else if (budget === "10 Lakhs - 20 Lakhs") { minPrice = "1000000"; maxPrice = "2000000"; }
        else if (budget === "Above 20 Lakhs") { minPrice = "2000000"; }

        // Map frontend BHK labels to backend enum values
        const bhkMap: Record<string, string> = {
            "1 BHK": "1BHK",
            "2 BHK": "2BHK",
            "3 BHK": "3BHK",
            "4 BHK": "4BHK",
            "4+ BHK": "4BHK+",
            "NA": "NA",
            "Applicable": "Applicable"
        };

        onFilter({
            purpose: purpose === "Rent" ? "RENT" : "SELL",
            city: selectedCity,
            locality: locality,
            bhk: bhkMap[bhk] || bhk,
            minPrice,
            maxPrice,
            possessionStatus,
            role: posterRole
        });
    };

    const handleReset = () => {
        setPurpose("Buy");
        setSelectedCity("");
        setLocality("");
        setBhk("");
        setBudget("");
        setPossessionStatus("");
        setPosterRole("");
        onFilter({});
    };

    const SF = ({ label, value, onChange, disabled = false, children }: any) => (
        <div className="w-full lg:flex-1">
            <label className="text-gray-500 text-[9px] font-black mb-1 block tracking-wider uppercase ml-0.5 truncate">
                {label}
            </label>
            <div className="relative group">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    className={`w-full bg-gray-50 border border-gray-200 text-gray-800 text-[10px] font-bold px-2 pr-5 py-2 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all hover:bg-white truncate ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                        }`}
                >
                    {children}
                </select>
                <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
        </div>
    );

    return (
        <div className="w-full bg-white px-4 py-4 md:py-3 rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:flex lg:flex-row items-end gap-3 lg:gap-1.5 w-full">
                <SF label="I Want To" value={purpose} onChange={(v: string) => { setPurpose(v); setBudget(""); }}>
                    <option value="Buy">Buy</option>
                    <option value="Rent">Rent</option>
                </SF>

                <SF label="City" value={selectedCity} onChange={setSelectedCity}>
                    <option value="">All Cities</option>
                    {cities.map((city) => (
                        <option key={city} value={city}>{city}</option>
                    ))}
                </SF>

                <SF label="Locality" value={locality} onChange={setLocality} disabled={!selectedCity}>
                    <option value="">{!selectedCity ? "Select City" : "All Localities"}</option>
                    {localities.map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                    ))}
                </SF>

                <SF label="BHK" value={bhk} onChange={setBhk}>
                    <option value="">Any BHK</option>
                    {bedrooms.map((b) => (
                        <option key={b} value={b}>{b}</option>
                    ))}
                </SF>

                <SF label="Budget" value={budget} onChange={setBudget}>
                    <option value="">Any Budget</option>
                    {(purpose === "Rent" ? budgetsRent : budgetsBuy).map((b) => (
                        <option key={b} value={b}>{b}</option>
                    ))}
                </SF>

                <SF label="Status" value={possessionStatus} onChange={setPossessionStatus}>
                    {STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </SF>

                <SF label="Posted By" value={posterRole} onChange={setPosterRole}>
                    {POSTER_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </SF>

                <div className="col-span-2 sm:col-span-1 lg:shrink-0 flex gap-1 w-full lg:w-auto">
                    <div className="flex flex-col">
                        <label className="text-transparent text-[9px] font-bold mb-1 block select-none">.</label>
                        <button
                            onClick={handleApply}
                            className="flex items-center justify-center gap-1.5 bg-gray-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-widest px-4 py-2 h-[38px] lg:h-[34px] w-full lg:w-auto rounded-lg transition-all shadow-md active:scale-95 group border border-white/10 whitespace-nowrap"
                        >
                            <Search size={12} className="group-hover:scale-110 transition-transform" />
                            Apply
                        </button>
                    </div>
                    <div className="flex flex-col">
                        <label className="text-transparent text-[9px] font-bold mb-1 block select-none">.</label>
                        <button
                            onClick={handleReset}
                            className="flex items-center justify-center gap-1.5 bg-white border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-100 font-bold text-[10px] uppercase tracking-widest px-3 py-2 h-[38px] lg:h-[34px] w-full lg:w-auto rounded-lg transition-all whitespace-nowrap"
                        >
                            <RotateCcw size={12} />
                            Reset
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}