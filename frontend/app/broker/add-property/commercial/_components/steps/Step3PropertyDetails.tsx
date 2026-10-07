import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building,
  Building2,
  Layout,
  LayoutGrid,
  Plus,
  Minus,
  Users,
} from "lucide-react";

export default function Step3PropertyDetails({ formData, updateNestedField, errors = {} }: any) {
  const updateConfig = (field: string, action: "add" | "sub") => {
    const current = formData?.commercial?.configuration?.[field] || 0;
    const next = action === "add" ? current + 1 : Math.max(0, current - 1);
    updateNestedField(`commercial.configuration.${field}`, next);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Office Details */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-6 shadow-sm md:col-span-2 space-y-6">
        <div className="flex items-center gap-3 border-b pb-4">
          <Building className="text-blue-500 w-6 h-6" />
          <h2 className="text-xl font-bold text-slate-800">Office Details</h2>
        </div>

        {/* Office Type */}
        <div className="space-y-3">
          <Label className={`text-sm font-semibold ${errors.officeType ? "text-red-500" : "text-slate-700"}`}>
            Office Type <span className="text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: "Bare Shell", icon: LayoutGrid },
              { id: "Warm Shell", icon: Layout },
              { id: "Fully Furnished", icon: Building },
              { id: "Co-working", icon: Building2 },
            ].map((type) => (
              <label
                key={type.id}
                className={`flex flex-col cursor-pointer items-center justify-center gap-2 rounded-xl border p-4 text-sm font-medium transition-all ${
                  formData?.commercial?.officeType === type.id
                    ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm relative font-bold"
                    : errors.officeType ? "border-red-200 bg-red-50/30 text-slate-600" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <type.icon
                  className={`w-8 h-8 ${formData?.commercial?.officeType === type.id ? "text-blue-500" : "text-slate-400"}`}
                />
                <span className="text-center text-xs mt-1">{type.id}</span>
                {formData?.commercial?.officeType === type.id && (
                  <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-0.5">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10 3L4.5 8.5L2 6"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
                <input
                  type="radio"
                  name="officeType"
                  value={type.id}
                  className="hidden"
                  checked={formData?.commercial?.officeType === type.id}
                  onChange={() => updateNestedField("commercial.officeType", type.id)}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Carpet Area */}
          <div className="space-y-2">
            <Label
              htmlFor="carpetArea"
              className={`text-sm font-semibold ${errors.carpetArea ? "text-red-500" : "text-slate-700"}`}
            >
              Carpet Area <span className="text-slate-400">(sq ft)</span> *
            </Label>
            <div className="flex bg-white border border-slate-200 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-600">
              <Input
                id="carpetArea"
                placeholder=""
                className={`h-11 border-none rounded-none focus-visible:ring-0 flex-1 ${errors.carpetArea ? "bg-red-50/30" : ""}`}
                value={formData?.commercial?.carpetArea || ""}
                onChange={(e) => updateNestedField("commercial.carpetArea", e.target.value)}
              />
              <select className="bg-slate-50 border-l border-slate-200 px-3 text-sm text-slate-600 outline-none">
                <option>sq ft</option>
                <option>sq m</option>
              </select>
            </div>
            {errors.carpetArea && <p className="text-[10px] font-black text-red-500 uppercase">{errors.carpetArea}</p>}
          </div>

          {/* Built-up Area */}
          <div className="space-y-2">
            <Label
              htmlFor="builtupArea"
              className="text-sm font-semibold text-slate-700"
            >
              Built-up Area <span className="text-slate-400">(sq ft)</span>
            </Label>
            <div className="flex bg-white border border-slate-200 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-600">
              <Input
                id="builtupArea"
                placeholder=""
                className="h-11 border-none rounded-none focus-visible:ring-0 flex-1"
                value={formData?.commercial?.builtUpArea || ""}
                onChange={(e) => updateNestedField("commercial.builtUpArea", e.target.value)}
              />
              <select className="bg-slate-50 border-l border-slate-200 px-3 text-sm text-slate-600 outline-none">
                <option>sq ft</option>
                <option>sq m</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Floor Number */}
          <div className="space-y-2">
            <Label
              htmlFor="floorNumber"
              className={`text-sm font-semibold ${errors.floorNumber ? "text-red-500" : "text-slate-700"}`}
            >
              Floor Number *
            </Label>
            <select
              id="floorNumber"
              className={`flex h-11 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 ${errors.floorNumber ? "border-red-500 focus:ring-red-600" : "border-slate-200 focus:ring-blue-600"}`}
              value={formData?.commercial?.floorNumber || ""}
              onChange={(e) => updateNestedField("commercial.floorNumber", e.target.value)}
            >
              <option value="" disabled></option>
              <option value="0">Ground</option>
              {Array.from({ length: 20 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>

          {/* Total Floors */}
          <div className="space-y-2">
            <Label
              htmlFor="totalFloors"
              className="text-sm font-semibold text-slate-700"
            >
              Total Floors
            </Label>
            <select
              id="totalFloors"
              className="flex h-11 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600"
              value={formData?.commercial?.totalFloors || ""}
              onChange={(e) => updateNestedField("commercial.totalFloors", e.target.value)}
            >
              <option value="" disabled></option>
              {Array.from({ length: 50 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>

          {/* Property Age */}
          <div className="space-y-2">
            <Label
              htmlFor="propertyAge"
              className="text-sm font-semibold text-slate-700"
            >
              Property Age
            </Label>
            <select
              id="propertyAge"
              className="flex h-11 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600"
              value={formData?.commercial?.propertyAge || "Total"}
              onChange={(e) => updateNestedField("commercial.propertyAge", e.target.value)}
            >
              <option value="Total">Total</option>
              <option value="0-1">0-1 Years</option>
              <option value="1-5">1-5 Years</option>
              <option value="5-10">5-10 Years</option>
              <option value="10+">10+ Years</option>
            </select>
          </div>
        </div>
      </div>

      {/* Right Column: Configuration & Facing */}
      <div className="space-y-6">
        {/* Office Configuration */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b pb-4">
            <Users className="text-emerald-500 w-6 h-6" />
            <h2 className="text-xl font-bold text-slate-800">
              Office Configuration
            </h2>
          </div>

          <div className="space-y-4">
            {[
              { id: "cabins", label: "Cabins", icon: "🏢" },
              { id: "workstations", label: "Workstations", icon: "💻" },
              { id: "meetingRooms", label: "Meeting Rooms", icon: "👥" },
              { id: "conferenceRooms", label: "Conference Room", icon: "🎙️" },
              { id: "receptionArea", label: "Reception Area", icon: "🛋️" },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  {item.label}
                </span>
                <div className="flex items-center gap-3 border border-slate-200 rounded-full bg-slate-50 p-1">
                  <button
                    onClick={() => updateConfig(item.id, "sub")}
                    className="w-7 h-7 flex items-center justify-center bg-white rounded-full shadow-sm text-slate-500 hover:text-blue-600"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <div className="flex items-center gap-1 w-10 justify-center">
                    <span className="text-sm opacity-60">{item.icon}</span>
                    <span className="text-sm font-bold w-4 text-center">
                      {formData?.commercial?.configuration?.[item.id] || 0}
                    </span>
                  </div>
                  <button
                    onClick={() => updateConfig(item.id, "add")}
                    className="w-7 h-7 flex items-center justify-center bg-white rounded-full shadow-sm text-slate-500 hover:text-blue-600"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Facing */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="text-blue-500 font-bold border-2 border-blue-500 rounded-full w-6 h-6 flex flex-col items-center justify-center text-[10px] leading-none pb-0.5">
              N
            </div>
            <h2 className="text-xl font-bold text-slate-800">Facing</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              "North",
              "South",
              "East",
              "West",
              "North-East",
              "North-West",
              "South-East",
              "South-West",
            ].map((dir) => (
              <button
                key={dir}
                onClick={() => updateNestedField("commercial.facing", dir)}
                className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors ${
                  formData?.commercial?.facing === dir
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {dir}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
