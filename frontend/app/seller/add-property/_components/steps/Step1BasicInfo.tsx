import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Step1BasicInfo({ formData, updateNestedField, errors }: any) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-6 shadow-sm">
      <div className="mb-8 border-b pb-4">
        <h2 className="text-xl font-bold text-slate-800">Basic Information</h2>
        <p className="text-sm text-slate-500">Enter the primary details of your property</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Property Title */}
        <div className="space-y-2">
          <Label htmlFor="propertyTitle" className={`text-sm font-semibold ${errors.propertyTitle ? "text-red-500" : "text-slate-700"}`}>
            Property Title <span className="text-red-500">*</span>
          </Label>
          <Input 
            id="propertyTitle" 
            placeholder="e.g. DLF Magnolias" 
            className={`h-11 ${errors.propertyTitle ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-slate-200 focus:border-blue-500 focus:ring-blue-500"}`}
            value={formData?.residential?.propertyTitle || ""}
            onChange={(e) => updateNestedField("residential.propertyTitle", e.target.value)}
          />
          {errors.propertyTitle && (
            <p className="text-xs font-semibold text-red-500 animate-in fade-in slide-in-from-top-1">{errors.propertyTitle}</p>
          )}
        </div>

        {/* Builder / Developer */}
        <div className="space-y-2">
          <Label htmlFor="builder" className="text-sm font-semibold text-slate-700">
            Builder / Developer <span className="text-red-500">*</span>
          </Label>
          <Input 
            id="builder" 
            placeholder="Enter Builder / Developer Name" 
            className={`h-11 ${errors.builderName ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-slate-200 focus:border-blue-500 focus:ring-blue-500"}`}
            value={formData?.residential?.builderName || ""}
            onChange={(e) => updateNestedField("residential.builderName", e.target.value)}
          />
          {errors.builderName && <p className="text-xs font-semibold text-red-500">{errors.builderName}</p>}
        </div>

        <div className="col-span-full space-y-3">
          <Label className={`text-sm font-semibold ${errors.propertyType ? "text-red-500" : "text-slate-700"}`}>Property Type</Label>
          <div className="flex flex-wrap gap-3">
            {["Apartment", "Villa", "Builder Floor", "Plot", "Penthouse"].map((type) => (
              <label
                key={type}
                className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-6 py-2.5 text-sm font-medium transition-all ${
                  formData?.residential?.propertyType === type
                    ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                    : errors.propertyType ? "border-red-200 bg-red-50/30 text-slate-600" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <input 
                  type="radio" 
                  name="propertyType" 
                  value={type} 
                  className="hidden" 
                  checked={formData?.residential?.propertyType === type}
                  onChange={() => updateNestedField("residential.propertyType", type)}
                />
                {type}
              </label>
            ))}
          </div>
          {errors.propertyType && <p className="text-xs font-semibold text-red-500">{errors.propertyType}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bhkType" className={`text-sm font-semibold ${errors.bhkType ? "text-red-500" : "text-slate-700"}`}>BHK Type</Label>
          <select
            id="bhkType"
            className={`flex h-11 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 ${errors.bhkType ? "border-red-500 focus:ring-red-600" : "border-slate-200 focus:ring-blue-600"}`}
            value={formData?.residential?.bhkType || ""}
            onChange={(e) => updateNestedField("residential.bhkType", e.target.value)}
          >
            <option value="" disabled>Select BHK</option>
            <option value="1BHK">1 BHK</option>
            <option value="2BHK">2 BHK</option>
            <option value="3BHK">3 BHK</option>
            <option value="4BHK">4 BHK</option>
            <option value="4BHK+">4+ BHK</option>
          </select>
          {errors.bhkType && <p className="text-xs font-semibold text-red-500">{errors.bhkType}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="carpetArea" className={`text-sm font-semibold ${errors.carpetArea ? "text-red-500" : "text-slate-700"}`}>Carpet Area</Label>
          <div className="relative">
            <Input 
              id="carpetArea" 
              placeholder="0" 
              className={`h-11 pr-16 ${errors.carpetArea ? "border-red-500" : "border-slate-200"}`}
              value={formData?.residential?.carpetArea || ""}
              onChange={(e) => updateNestedField("residential.carpetArea", e.target.value)}
            />
            <span className="absolute inset-y-0 right-4 flex items-center text-sm font-medium text-slate-400">
              sq.ft.
            </span>
          </div>
          {errors.carpetArea && <p className="text-xs font-semibold text-red-500">{errors.carpetArea}</p>}
        </div>

        <div className="col-span-full space-y-3">
          <Label className={`text-sm font-semibold ${errors.possessionStatus ? "text-red-500" : "text-slate-700"}`}>Possession Status</Label>
          <div className="flex flex-wrap gap-3">
            {["Ready to Move", "Under Construction", "New Launch"].map((status) => (
              <label
                key={status}
                className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-6 py-2.5 text-sm font-medium transition-all ${
                  formData?.residential?.possessionStatus === status
                    ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                    : errors.possessionStatus ? "border-red-200 bg-red-50/30 text-slate-600" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <input 
                  type="radio" 
                  name="possessionStatus" 
                  value={status} 
                  className="hidden" 
                  checked={formData?.residential?.possessionStatus === status}
                  onChange={() => updateNestedField("residential.possessionStatus", status)}
                />
                {status === "Ready to Move" && <span className="h-2 w-2 rounded-full bg-green-500" />}
                {status === "Under Construction" && <span className="h-2 w-2 rounded-full bg-orange-500" />}
                {status}
              </label>
            ))}
          </div>
          {errors.possessionStatus && <p className="text-xs font-semibold text-red-500">{errors.possessionStatus}</p>}
        </div>
      </div>
    </div>
  );
}
