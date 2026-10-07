"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Building2, Store, MapPin, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

const LocationMap = dynamic(() => import("../Map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-slate-100 flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
    </div>
  )
});

export default function Step1BasicAndLocation({ formData, updateNestedField, errors = {} }: any) {

  const categories = [
    { id: "Office", icon: Building2 },
    { id: "Shop", icon: Store },
  ];

  return (
    <div className="space-y-10">

      {/* ================= BASIC INFORMATION ================= */}

      <div>
        <div className="border-b pb-4 mb-6">
          <h2 className="text-xl font-bold text-slate-800">Basic Information</h2>
          <p className="text-sm text-slate-500">
            Enter the primary details of your property
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">

          {/* Property Type */}

          <div className={`rounded-xl border bg-white p-4 md:p-6 shadow-sm ${errors.propertyPurpose ? "border-red-500 ring-1 ring-red-500" : "border-slate-200"}`}>
            <h3 className={`font-semibold mb-4 text-sm md:text-base ${errors.propertyPurpose ? "text-red-600" : "text-slate-800"}`}>Property Purpose</h3>

            <div className="flex flex-col sm:flex-row gap-3">
              {["Sell Property", "Rent / Lease"].map((type) => (
                <button
                  key={type}
                  onClick={() => updateNestedField("commercial.propertyPurpose", type)}
                  className={`flex-1 rounded-lg border py-3 text-sm font-medium transition
                  ${formData?.commercial?.propertyPurpose === type
                      ? "border-blue-500 bg-blue-50 text-blue-700 font-bold"
                      : "border-slate-200 hover:bg-slate-50"
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
            {errors.propertyPurpose && <p className="mt-2 text-[10px] font-black text-red-500 uppercase">{errors.propertyPurpose}</p>}
          </div>

          {/* I Am */}

          {/* <div className={`rounded-xl border bg-white p-4 md:p-6 shadow-sm ${errors.userType ? "border-red-500 ring-1 ring-red-500" : "border-slate-200"}`}>
            <h3 className={`font-semibold mb-4 text-sm md:text-base ${errors.userType ? "text-red-600" : "text-slate-800"}`}>I Am</h3>

            <div className="flex flex-col sm:flex-row gap-3">
              {["Owner", "Broker", "Builder"].map((role) => (
                <button
                  key={role}
                  onClick={() => updateNestedField("commercial.userType", role)}
                  className={`flex-1 rounded-lg border py-3 text-sm font-medium transition
                  ${formData?.commercial?.userType === role
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 font-bold"
                      : "border-slate-200 hover:bg-slate-50"
                    }`}
                >
                  {role}
                </button>
              ))}
            </div>
            {errors.userType && <p className="mt-2 text-[10px] font-black text-red-500 uppercase">{errors.userType}</p>}
          </div> */}

          {/* Property Category */}

          <div className={`md:col-span-2 rounded-xl border bg-white p-4 md:p-6 shadow-sm ${errors.propertyCategory ? "border-red-500 ring-1 ring-red-500" : "border-slate-200"}`}>
            <h3 className={`font-semibold mb-4 text-sm md:text-base ${errors.propertyCategory ? "text-red-600" : "text-slate-800"}`}>
              Property Category
            </h3>

            {/* 2 main category buttons */}
            <div className="grid grid-cols-2 gap-4">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      updateNestedField("commercial.propertyCategory", cat.id);
                      updateNestedField("commercial.officeType", "");
                      updateNestedField("commercial.shopType", "");
                    }}
                    className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-5 text-sm font-semibold transition
                    ${formData?.commercial?.propertyCategory === cat.id
                        ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm font-bold scale-105"
                        : "border-slate-200 hover:bg-slate-50"
                      }`}
                  >
                    <Icon className="w-6 h-6" />
                    {cat.id}
                  </button>
                );
              })}
            </div>

            {formData?.commercial?.propertyCategory === "Office" && (
              <div className="space-y-3 mt-5">
                <p className="text-sm font-semibold text-slate-700">Office Type</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {["Bare Shell", "Warm Shell", "Fully Furnished", "Co-working"].map((type) => (
                    <button
                      key={type}
                      onClick={() => updateNestedField("commercial.officeType", type)}
                      className={`rounded-xl border py-3 px-2 text-sm font-medium transition ${
                        formData?.commercial?.officeType === type
                          ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm font-bold"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {formData?.commercial?.propertyCategory === "Shop" && (
              <div className="space-y-3 mt-5">
                <p className="text-sm font-semibold text-slate-700">Shop Type</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {["Retail Shop", "Showroom", "Food Outlet"].map((type) => (
                    <button
                      key={type}
                      onClick={() => updateNestedField("commercial.shopType", type)}
                      className={`rounded-xl border py-3 px-2 text-sm font-medium transition ${
                        formData?.commercial?.shopType === type
                          ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm font-bold"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {errors.propertyCategory && <p className="mt-3 text-[10px] font-black text-red-500 uppercase">{errors.propertyCategory}</p>}
          </div>

        </div>
      </div>

      {/* ================= LOCATION ================= */}

      <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-6 shadow-sm">

        <div className="grid lg:grid-cols-3 gap-6">

          {/* FORM FIELDS */}

          <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">

            <div className="space-y-2">
              <Label className={errors.city ? "text-red-500 font-bold" : ""}>City *</Label>
              <Input
                placeholder="Enter City"
                className={errors.city ? "border-red-500" : ""}
                value={formData?.location?.city || ""}
                onChange={(e) => updateNestedField("location.city", e.target.value)}
              />
              {errors.city && <p className="text-[10px] font-black text-red-500 uppercase">{errors.city}</p>}
            </div>

            <div className="space-y-2">
              <Label className={errors.locality ? "text-red-500 font-bold" : ""}>Locality *</Label>
              <Input
                placeholder="Enter Locality"
                className={errors.locality ? "border-red-500" : ""}
                value={formData?.location?.locality || ""}
                onChange={(e) => updateNestedField("location.locality", e.target.value)}
              />
              {errors.locality && <p className="text-[10px] font-black text-red-500 uppercase">{errors.locality}</p>}
            </div>

            <div className="space-y-2">
              <Label className={errors.projectName ? "text-red-500 font-bold" : ""}>Building / Tower Name *</Label>
              <Input
                className={errors.projectName ? "border-red-500" : ""}
                value={formData?.location?.projectName || ""}
                onChange={(e) => updateNestedField("location.projectName", e.target.value)}
              />
              {errors.projectName && <p className="text-[10px] font-black text-red-500 uppercase">{errors.projectName}</p>}
            </div>

            <div className="space-y-2">
              <Label className={errors.address ? "text-red-500 font-bold" : ""}>Address *</Label>
              <Input
                className={errors.address ? "border-red-500" : ""}
                value={formData?.location?.address || ""}
                onChange={(e) => updateNestedField("location.address", e.target.value)}
              />
              {errors.address && <p className="text-[10px] font-black text-red-500 uppercase">{errors.address}</p>}
            </div>

            <div className="space-y-2">
              <Label>Landmark</Label>
              <Input
                value={formData?.location?.landmark || ""}
                onChange={(e) => updateNestedField("location.landmark", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className={errors.pincode ? "text-red-500 font-bold" : ""}>Pincode *</Label>
              <Input
                className={errors.pincode ? "border-red-500" : ""}
                value={formData?.location?.pincode || ""}
                onChange={(e) => updateNestedField("location.pincode", e.target.value)}
              />
              {errors.pincode && <p className="text-[10px] font-black text-red-500 uppercase">{errors.pincode}</p>}
            </div>

          </div>

          {/* MAP */}

          <div className="h-[260px] rounded-xl border overflow-hidden">
            <LocationMap
              setLocation={(coords: any) => updateNestedField("location.coordinates", coords)}
            />
          </div>

        </div>

      </div>

    </div>
  );
}