"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Building2, Store, MapPin, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { indiaLocations } from "@/lib/india-locations";

const LocationMap = dynamic(() => import("../Map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-slate-100 flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
    </div>
  )
});

export default function Step1BasicAndLocation({ formData, updateNestedField, errors = {} }: any) {
  const states = indiaLocations.states;
  const [districts, setDistricts] = useState<string[]>([]);

  useEffect(() => {
    if (formData?.location?.state) {
      const stateObj = states.find(s => s.state === formData.location.state);
      setDistricts(stateObj ? stateObj.districts : []);
    } else {
      setDistricts([]);
    }
  }, [formData?.location?.state, states]);

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedStateName = e.target.value;
    updateNestedField("location.state", selectedStateName);
    updateNestedField("location.district", "");
    updateNestedField("location.city", "");
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDistrictName = e.target.value;
    updateNestedField("location.district", selectedDistrictName);
    updateNestedField("location.city", selectedDistrictName);
  };

  const categories = [
    { id: "Office", icon: Building2 },
    { id: "Shop", icon: Store },
  ];

  return (
    <div className="space-y-10">
      <div>
        <div className="border-b pb-4 mb-6">
          <h2 className="text-xl font-bold text-slate-800">Basic Information</h2>
          <p className="text-sm text-slate-500">Enter the primary details of your property</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className={`rounded-xl border bg-white p-4 md:p-6 shadow-sm ${errors.propertyPurpose ? "border-red-500 ring-1 ring-red-500" : "border-slate-200"}`}>
            <h3 className={`font-semibold mb-4 text-sm md:text-base ${errors.propertyPurpose ? "text-red-600" : "text-slate-800"}`}>Property Purpose</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              {["Sell Property", "Rent / Lease"].map((type) => (
                <button
                  key={type}
                  onClick={() => updateNestedField("commercial.propertyPurpose", type)}
                  className={`flex-1 rounded-lg border py-3 text-sm font-medium transition ${formData?.commercial?.propertyPurpose === type ? "border-blue-500 bg-blue-50 text-blue-700 font-bold" : "border-slate-200 hover:bg-slate-50"}`}
                >
                  {type}
                </button>
              ))}
            </div>
            {errors.propertyPurpose && <p className="mt-2 text-[10px] font-black text-red-500 uppercase">{errors.propertyPurpose}</p>}
          </div>

          <div className={`md:col-span-2 rounded-xl border bg-white p-4 md:p-6 shadow-sm ${errors.propertyCategory ? "border-red-500 ring-1 ring-red-500" : "border-slate-200"}`}>
            <h3 className={`font-semibold mb-4 text-sm md:text-base ${errors.propertyCategory ? "text-red-600" : "text-slate-800"}`}>Property Category</h3>
            <div className="grid grid-cols-2 gap-4">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => updateNestedField("commercial.propertyCategory", cat.id)}
                    className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${formData?.commercial?.propertyCategory === cat.id ? "border-blue-500 bg-blue-50/50 text-blue-700" : "border-slate-100 bg-slate-50/30 hover:bg-slate-50 text-slate-500"}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-bold text-sm md:text-base">{cat.id}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-6 shadow-sm">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">State</Label>
              <select
                className="w-full h-11 px-3 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-sm"
                value={formData?.location?.state || ""}
                onChange={handleStateChange}
              >
                <option value="">Select State</option>
                {states.map((s: any) => (
                  <option key={s.state} value={s.state}>{s.state}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">District</Label>
              <select
                className="w-full h-11 px-3 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-sm"
                value={formData?.location?.district || ""}
                onChange={handleDistrictChange}
                disabled={!formData?.location?.state}
              >
                <option value="">Select District</option>
                {districts.map((d: string) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label className={errors.city ? "text-red-500 font-bold" : "text-sm font-semibold"}>City / Town *</Label>
              <Input
                placeholder="Enter City"
                className={errors.city ? "border-red-500" : ""}
                value={formData?.location?.city || ""}
                onChange={(e) => updateNestedField("location.city", e.target.value)}
              />
              {errors.city && <p className="text-[10px] font-black text-red-500 uppercase">{errors.city}</p>}
            </div>

            <div className="space-y-2">
              <Label className={errors.locality ? "text-red-500 font-bold" : "text-sm font-semibold"}>Locality *</Label>
              <Input
                placeholder="Enter Locality"
                className={errors.locality ? "border-red-500" : ""}
                value={formData?.location?.locality || ""}
                onChange={(e) => updateNestedField("location.locality", e.target.value)}
              />
              {errors.locality && <p className="text-[10px] font-black text-red-500 uppercase">{errors.locality}</p>}
            </div>

            <div className="space-y-2">
              <Label className={errors.projectName ? "text-red-500 font-bold" : "text-sm font-semibold"}>Building / Complex Name *</Label>
              <Input
                className={errors.projectName ? "border-red-500" : ""}
                value={formData?.location?.projectName || ""}
                onChange={(e) => updateNestedField("location.projectName", e.target.value)}
              />
              {errors.projectName && <p className="text-[10px] font-black text-red-500 uppercase">{errors.projectName}</p>}
            </div>

            <div className="space-y-2">
              <Label className={errors.address ? "text-red-500 font-bold" : "text-sm font-semibold"}>Address *</Label>
              <Input
                className={errors.address ? "border-red-500" : ""}
                value={formData?.location?.address || ""}
                onChange={(e) => updateNestedField("location.address", e.target.value)}
              />
              {errors.address && <p className="text-[10px] font-black text-red-500 uppercase">{errors.address}</p>}
            </div>
          </div>

          <div className="h-[260px] rounded-xl border overflow-hidden">
            <LocationMap setLocation={(coords: any) => updateNestedField("location.coordinates", coords)} />
          </div>
        </div>
      </div>
    </div>
  );
}