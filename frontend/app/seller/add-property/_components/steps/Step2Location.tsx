"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Search, Loader2, AlertCircle } from "lucide-react";
import { indiaLocations } from "@/lib/india-locations";
import { fetchPincodeDetails } from "@/lib/pincode";

export default function Step2Location({ formData, updateNestedField, errors = {}, isEdit }: any) {
  const states = indiaLocations.states;
  const [districts, setDistricts] = useState<string[]>([]);
  const [localities, setLocalities] = useState<string[]>([]);
  const [isLoadingPincode, setIsLoadingPincode] = useState(false);
  const [pincodeError, setPincodeError] = useState("");
  const [showManualLocality, setShowManualLocality] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Cascading logic: State -> Districts
  useEffect(() => {
    if (formData?.location?.state) {
      const stateObj = states.find(s => s.state === formData.location.state);
      setDistricts(stateObj ? stateObj.districts : []);
    } else {
      setDistricts([]);
    }
  }, [formData?.location?.state, states]);

  // Pincode Trigger logic
  useEffect(() => {
    const pincode = formData?.location?.pincode;
    if (pincode && pincode.length === 6 && /^\d+$/.test(pincode)) {
      // If we're editing and not initialized, don't auto-fetch to avoid overwriting existing data
      if (isEdit && !isInitialized) {
        setIsInitialized(true);
        // We still fetch to populate localities dropdown but don't auto-update state/district
        handlePincodeFetch(pincode, true); 
      } else {
        handlePincodeFetch(pincode);
      }
    } else {
      setPincodeError("");
      if (pincode && pincode.length > 0 && (pincode.length !== 6 || !/^\d+$/.test(pincode))) {
        if (pincode.length === 6) setPincodeError("Invalid pincode format");
      }
    }
  }, [formData?.location?.pincode]);

  // One-time sync for manual mode on load or localities fetch
  useEffect(() => {
    if (localities.length > 0 && formData?.location?.locality) {
      if (!localities.includes(formData.location.locality)) {
        setShowManualLocality(true);
      }
    }
  }, [localities]); // Only run when localities list is updated

  const handlePincodeFetch = async (pincode: string, skipAutoFill = false) => {
    setIsLoadingPincode(true);
    setPincodeError("");
    try {
      const details = await fetchPincodeDetails(pincode);
      if (details && details.PostOffice && details.PostOffice.length > 0) {
        const first = details.PostOffice[0];
        
        // Auto-select State/District/City only if not skipping
        if (!skipAutoFill) {
          const matchedState = states.find(s => s.state.toLowerCase() === first.State.toLowerCase());
          if (matchedState) {
            updateNestedField("location.state", matchedState.state);
            
            const matchedDistrict = matchedState.districts.find(d => d.toLowerCase() === first.District.toLowerCase());
            if (matchedDistrict) {
              updateNestedField("location.district", matchedDistrict);
            }
          }

          if (first.Block && first.Block !== "Not Available") {
            updateNestedField("location.city", first.Block);
          } else {
            updateNestedField("location.city", first.District);
          }
        }

        // Localities list
        const names = Array.from(new Set(details.PostOffice.map(po => po.Name))).sort();
        setLocalities(names);
        
        // Only reset locality if we're not in manual mode and it's not in the new list
        if (!showManualLocality && !names.includes(formData?.location?.locality)) {
          updateNestedField("location.locality", "");
        }
      } else {
        setPincodeError("Pincode not found");
        setLocalities([]);
      }
    } catch (err) {
      setPincodeError("Error fetching pincode");
      setLocalities([]);
    } finally {
      setIsLoadingPincode(false);
    }
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedStateName = e.target.value;
    updateNestedField("location.state", selectedStateName);
    updateNestedField("location.district", "");
    updateNestedField("location.city", "");
    updateNestedField("location.locality", "");
    setLocalities([]);
    setShowManualLocality(false);
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDistrictName = e.target.value;
    updateNestedField("location.district", selectedDistrictName);
    if (!formData?.location?.city) {
      updateNestedField("location.city", selectedDistrictName);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-6 shadow-sm">
      <div className="mb-8 border-b pb-4">
        <h2 className="text-xl font-bold text-slate-800">Location Details</h2>
        <p className="text-sm text-slate-500">Specify exactly where your property is situated</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Project Name */}
        <div className="col-span-full space-y-2">
          <Label htmlFor="projectName" className={`text-sm font-semibold ${errors.projectName ? "text-red-500" : "text-slate-700"}`}>
            Project / Complex Name <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input 
              id="projectName" 
              placeholder="Enter project name" 
              className={`h-11 pl-10 border-slate-200 focus:border-blue-500 ${errors.projectName ? "border-red-500" : ""}`}
              value={formData?.location?.projectName || ""}
              onChange={(e) => updateNestedField("location.projectName", e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
          {errors.projectName && <p className="text-xs font-semibold text-red-500">{errors.projectName}</p>}
        </div>

        {/* Pincode */}
        <div className="space-y-2">
          <Label htmlFor="pincode" className={`text-sm font-semibold ${errors.pincode || pincodeError ? "text-red-500" : "text-slate-700"}`}>Pincode <span className="text-red-500">*</span></Label>
          <div className="relative">
            <Input 
              id="pincode" 
              placeholder="6 Digit Pincode" 
              maxLength={6}
              className={`h-11 border-slate-200 ${errors.pincode || pincodeError ? "border-red-500" : ""}`}
              value={formData?.location?.pincode || ""}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                updateNestedField("location.pincode", val);
              }}
            />
            {isLoadingPincode && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-blue-500" />}
          </div>
          {pincodeError && <p className="text-[10px] font-bold text-red-500 flex items-center gap-1"><AlertCircle size={10} /> {pincodeError}</p>}
          {errors.pincode && <p className="text-xs font-semibold text-red-500">{errors.pincode}</p>}
        </div>

        {/* State Selection */}
        <div className="space-y-2">
          <Label htmlFor="state" className={`text-sm font-semibold ${errors.state ? "text-red-500" : "text-slate-700"}`}>State <span className="text-red-500">*</span></Label>
          <select
            id="state"
            className={`w-full h-11 px-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-sm ${errors.state ? "border-red-500" : "border-slate-200"}`}
            value={formData?.location?.state || ""}
            onChange={handleStateChange}
          >
            <option value="">Select State</option>
            {states.map((s: any) => (
              <option key={s.state} value={s.state}>{s.state}</option>
            ))}
          </select>
          {errors.state && <p className="text-xs font-semibold text-red-500">{errors.state}</p>}
        </div>

        {/* District Selection */}
        <div className="space-y-2">
          <Label htmlFor="district" className={`text-sm font-semibold ${errors.district ? "text-red-500" : "text-slate-700"}`}>District <span className="text-red-500">*</span></Label>
          <select
            id="district"
            className={`w-full h-11 px-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-sm disabled:bg-slate-50 ${errors.district ? "border-red-500" : "border-slate-200"}`}
            value={formData?.location?.district || ""}
            onChange={handleDistrictChange}
            disabled={!formData?.location?.state}
          >
            <option value="">Select District</option>
            {districts.map((d: string) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          {errors.district && <p className="text-xs font-semibold text-red-500">{errors.district}</p>}
        </div>

        {/* Locality Dropdown / Input */}
        <div className="space-y-2">
          <Label htmlFor="locality" className={`text-sm font-semibold ${errors.locality ? "text-red-500" : "text-slate-700"}`}>Locality <span className="text-red-500">*</span></Label>
          {localities.length > 0 ? (
            <select
              id="locality"
              className={`w-full h-11 px-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-sm ${errors.locality ? "border-red-500" : "border-slate-200"}`}
              value={showManualLocality ? "other" : (formData?.location?.locality || "")}
              onChange={(e) => {
                if (e.target.value === "other") {
                  setShowManualLocality(true);
                  updateNestedField("location.locality", "");
                } else {
                  setShowManualLocality(false);
                  updateNestedField("location.locality", e.target.value);
                }
              }}
            >
              <option value="">Select Locality</option>
              {localities.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
              <option value="other">Other (Manual Input)</option>
            </select>
          ) : (
            <Input 
              id="locality" 
              placeholder="Search or Enter Locality" 
              className={`h-11 border-slate-200 ${errors.locality ? "border-red-500" : ""}`}
              value={formData?.location?.locality || ""}
              onChange={(e) => updateNestedField("location.locality", e.target.value)}
            />
          )}
          {errors.locality && <p className="text-xs font-semibold text-red-500">{errors.locality}</p>}
        </div>

        {/* Manual Locality Input if 'other' is selected */}
        {showManualLocality && (
           <div className="col-span-full space-y-2">
            <Label htmlFor="manualLocality" className="text-sm font-semibold text-slate-700">Enter Locality Name</Label>
            <Input 
              id="manualLocality" 
              placeholder="Type your locality name" 
              className="h-11 border-slate-200"
              value={formData?.location?.locality || ""}
              onChange={(e) => updateNestedField("location.locality", e.target.value)}
              autoFocus
            />
          </div>
        )}

        {/* Address */}
        <div className="col-span-full space-y-2">
          <Label htmlFor="address" className={`text-sm font-semibold ${errors.address ? "text-red-500" : "text-slate-700"}`}>Detailed Address</Label>
          <Input 
            id="address" 
            placeholder="House No, Building Name, Street" 
            className={`h-11 border-slate-200 ${errors.address ? "border-red-500" : ""}`}
            value={formData?.location?.address || ""}
            onChange={(e) => updateNestedField("location.address", e.target.value)}
          />
          {errors.address && <p className="text-xs font-semibold text-red-500">{errors.address}</p>}
        </div>

        {/* Google Map Pin */}
        <div className="col-span-full space-y-2">
          <Label htmlFor="mapPin" className={`text-sm font-semibold ${errors.googleMapLink ? "text-red-500" : "text-slate-700"}`}>Google Map Link / Pin</Label>
          <div className="relative">
            <Input 
              id="mapPin" 
              placeholder="Paste Google Maps URL or Coordinates" 
              className={`h-11 pr-10 border-slate-200 ${errors.googleMapLink ? "border-red-500" : ""}`}
              value={formData?.location?.googleMapLink || ""}
              onChange={(e) => updateNestedField("location.googleMapLink", e.target.value)}
            />
            <MapPin className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-500" />
          </div>
          {errors.googleMapLink && <p className="text-xs font-semibold text-red-500">{errors.googleMapLink}</p>}
        </div>

        {/* Landmark */}
        <div className="col-span-full space-y-2">
          <Label htmlFor="landmark" className={`text-sm font-semibold ${errors.landmark ? "text-red-500" : "text-slate-700"}`}>Landmark</Label>
          <Input 
            id="landmark" 
            placeholder="e.g. Near HDFC Bank, Opposite Central Park" 
            className={`h-11 border-slate-200 ${errors.landmark ? "border-red-500" : ""}`}
            value={formData?.location?.landmark || ""}
            onChange={(e) => updateNestedField("location.landmark", e.target.value)}
          />
          {errors.landmark && <p className="text-xs font-semibold text-red-500">{errors.landmark}</p>}
        </div>
      </div>
    </div>
  );
}
