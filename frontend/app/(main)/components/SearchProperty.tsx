"use client";
import { useState, useEffect } from "react";
import { Search, ChevronDown, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { propertyTypes, budgetsBuy, budgetsRent } from "../../mock-data/mockData2";
import { indiaLocations } from "@/lib/india-locations";
import { fetchPincodeDetails } from "@/lib/pincode";

export default function SearchProperty() {
  const router = useRouter();

  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [locality, setLocality] = useState("");
  const [pincode, setPincode] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [purpose, setPurpose] = useState("Buy");
  const [budget, setBudget] = useState("");

  const [cities, setCities] = useState<string[]>([]);
  const [localities, setLocalities] = useState<string[]>([]);
  const [isLoadingPincode, setIsLoadingPincode] = useState(false);

  // Pincode API logic for Search
  useEffect(() => {
    if (pincode.length === 6 && /^\d+$/.test(pincode)) {
      const fetchDetails = async () => {
        setIsLoadingPincode(true);
        try {
          const data = await fetchPincodeDetails(pincode);
          if (data && data.PostOffice) {
            const first = data.PostOffice[0];
            
            // Set State
            setSelectedState(first.State);
            
            // Set City (Block)
            const cityValue = first.Block && first.Block !== "Not Available" ? first.Block : first.District;
            setSelectedCity(cityValue);

            // Set Localities for dropdown
            const names = Array.from(new Set(data.PostOffice.map((po: any) => po.Name))).sort() as string[];
            setLocalities(names);
            setLocality(""); // Reset locality when pincode changes
          } else {
            setLocalities([]);
          }
        } catch (err) {
          console.error("Error fetching pincode details in search:", err);
          setLocalities([]);
        } finally {
          setIsLoadingPincode(false);
        }
      };
      fetchDetails();
    } else {
      setLocalities([]);
    }
  }, [pincode]);

  // Cascading logic: Update cities when state changes
  useEffect(() => {
    if (selectedState) {
      const stateObj = indiaLocations.states.find(s => s.state === selectedState);
      setCities(stateObj ? stateObj.districts : []);
    } else {
      setCities([]);
      setSelectedCity("");
    }
  }, [selectedState]);

  const handleSearch = () => {
    let minPrice = "";
    let maxPrice = "";

    // For Buy
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
    // For Rent
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

    let pType = propertyType;
    let lType = "";

    if (propertyType === "Apartment") {
      pType = "APARTMENT";
      lType = "RESIDENTIAL";
    } else if (propertyType === "Villa") {
      pType = "VILLA";
      lType = "RESIDENTIAL";
    } else if (propertyType === "Plot") {
      pType = "PLOT";
      lType = "RESIDENTIAL";
    } else if (["Commercial", "Office Space", "Shop"].includes(propertyType)) {
      lType = "COMMERCIAL";
      pType = ""; // Reset pType since these are handled by listingType in basic search
    }

    const params = new URLSearchParams();
    if (selectedState) params.append("state", selectedState);
    if (selectedCity) params.append("city", selectedCity);
    if (locality) params.append("locality", locality);
    if (pincode) params.append("pincode", pincode);
    if (purpose) params.append("purpose", purpose === "Rent" ? "RENT" : "SELL");
    if (lType) params.append("listingType", lType);
    if (pType) params.append("propertyType", pType);
    if (minPrice) params.append("minPrice", minPrice);
    if (maxPrice) params.append("maxPrice", maxPrice);

    router.push(`/properties?${params.toString()}`);
  };

  return (
    <section className="w-full px-4 md:px-12 py-8 md:py-12 bg-white">
      <div
        className="relative w-full rounded-xl md:rounded-2xl overflow-hidden p-5 md:p-8 lg:p-10 transition-all duration-500 hover:shadow-2xl"
        style={{ backgroundColor: "#6B6BF5" }}
      >
        {/* Background building image */}
        <div
          className="absolute inset-0 bg-cover bg-right opacity-30 mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1772475385289-17fbb414ed74?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDN8TThqVmJMYlRSd3N8fGVufDB8fHx8fA%3D%3D')",
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          <h2 className="text-white text-2xl md:text-4xl font-black text-center mb-8 drop-shadow-lg tracking-tight">
            Search Your Property
          </h2>

          <div className="bg-white/10 backdrop-blur-2xl rounded-2xl p-5 md:p-6 border border-white/20 shadow-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
              
              {/* Purpose (Buy/Rent) */}
              <div className="space-y-2">
                <label className="text-white/90 text-[10px] font-black mb-1.5 block tracking-[0.2em] uppercase ml-1">
                  I Want To
                </label>
                <div className="relative group">
                  <select
                    value={purpose}
                    onChange={(e) => {
                      setPurpose(e.target.value);
                      setBudget(""); // Reset budget on purpose change
                    }}
                    className="w-full bg-white/95 text-gray-800 text-[11px] font-bold px-3 py-2.5 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-4 focus:ring-white/30 transition-all shadow-lg hover:bg-white"
                  >
                    <option value="Buy">Buy</option>
                    <option value="Rent">Rent</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-purple-600 transition-colors" />
                </div>
              </div>

              {/* Pincode Search */}
              <div className="space-y-2">
                <label className="text-white/90 text-[10px] font-black mb-1.5 block tracking-[0.2em] uppercase ml-1">
                  Pincode
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="Enter 6-digit Pincode"
                    className="w-full bg-white/95 text-gray-800 text-[11px] font-bold px-3 py-2.5 rounded-lg focus:outline-none focus:ring-4 focus:ring-white/30 transition-all shadow-lg hover:bg-white placeholder:text-gray-400"
                  />
                  {isLoadingPincode && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-purple-600" />}
                </div>
              </div>

              {/* State */}
              <div className="space-y-2">
                <label className="text-white/90 text-[10px] font-black mb-1.5 block tracking-[0.2em] uppercase ml-1">
                  State
                </label>
                <div className="relative group">
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full bg-white/95 text-gray-800 text-[11px] font-bold px-3 py-2.5 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-4 focus:ring-white/30 transition-all shadow-lg hover:bg-white"
                  >
                    <option value="">Select State</option>
                    {indiaLocations.states.map((s) => (
                      <option key={s.state} value={s.state}>{s.state}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-purple-600 transition-colors" />
                </div>
              </div>

              {/* City / Town */}
              <div className="space-y-2">
                <label className="text-white/90 text-[10px] font-black mb-1.5 block tracking-[0.2em] uppercase ml-1">
                  City / Town
                </label>
                <div className="relative group">
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full bg-white/95 text-gray-800 text-[11px] font-bold px-3 py-2.5 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-4 focus:ring-white/30 transition-all shadow-lg hover:bg-white"
                  >
                    <option value="">Select City</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                    {/* Fallback for API-provided city if not in static list */}
                    {selectedCity && !cities.includes(selectedCity) && (
                      <option value={selectedCity}>{selectedCity}</option>
                    )}
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-purple-600 transition-colors" />
                </div>
              </div>

              {/* Locality */}
              <div className="space-y-2">
                <label className="text-white/90 text-[10px] font-black mb-1.5 block tracking-[0.2em] uppercase ml-1">
                  Locality
                </label>
                <div className="relative group">
                  <select
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="w-full bg-white/95 text-gray-800 text-[11px] font-bold px-3 py-2.5 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-4 focus:ring-white/30 transition-all shadow-lg hover:bg-white disabled:opacity-50"
                    disabled={localities.length === 0 && !pincode}
                  >
                    <option value="">{localities.length > 0 ? "Select Locality" : "Enter Pincode first"}</option>
                    {localities.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-purple-600 transition-colors" />
                </div>
              </div>

              {/* Property Type */}
              <div className="space-y-2">
                <label className="text-white/90 text-[10px] font-black mb-1.5 block tracking-[0.2em] uppercase ml-1">
                  Property Type
                </label>
                <div className="relative group">
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full bg-white/95 text-gray-800 text-[11px] font-bold px-3 py-2.5 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-4 focus:ring-white/30 transition-all shadow-lg hover:bg-white"
                  >
                    <option value="">Select Type</option>
                    {propertyTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-purple-600 transition-colors" />
                </div>
              </div>

              {/* Budget */}
              <div className="space-y-2">
                <label className="text-white/90 text-[10px] font-black mb-1.5 block tracking-[0.2em] uppercase ml-1">
                  Price Budget
                </label>
                <div className="relative group">
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full bg-white/95 text-gray-800 text-[11px] font-bold px-3 py-2.5 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-4 focus:ring-white/30 transition-all shadow-lg hover:bg-white"
                  >
                    <option value="">Select Budget</option>
                    {(purpose === "Rent" ? budgetsRent : budgetsBuy).map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-purple-600 transition-colors" />
                </div>
              </div>

              {/* Search Button */}
              <div className="lg:col-span-4 mt-4">
                <button
                  onClick={handleSearch}
                  className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white font-black text-[12px] uppercase tracking-[0.2em] px-6 py-4 rounded-lg transition-all w-full shadow-2xl active:scale-95 group border border-white/10"
                >
                  <Search size={20} className="group-hover:scale-125 transition-transform" />
                  Find My Dream Home
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}