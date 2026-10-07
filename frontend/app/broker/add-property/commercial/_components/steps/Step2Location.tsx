import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";

export default function Step2Location({ formData, setFormData }: any) {
  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6 md:col-span-2">
        <div className="flex items-center gap-3 border-b pb-4">
          <MapPin className="text-emerald-500 w-6 h-6" />
          <h2 className="text-xl font-bold text-slate-800">Location</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* City */}
          <div className="space-y-2">
            <Label
              htmlFor="city"
              className="text-sm font-semibold text-slate-700"
            >
              City <span className="text-red-500">*</span>
            </Label>
            <select
              id="city"
              className="flex h-11 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600"
              value={formData?.city || ""}
              onChange={(e) => updateField("city", e.target.value)}
            >
              <option value="" disabled>
                Select City
              </option>
              <option value="delhi">Delhi / NCR</option>
              <option value="mumbai">Mumbai</option>
              <option value="bangalore">Bangalore</option>
              <option value="hyderabad">Hyderabad</option>
            </select>
          </div>

          {/* Locality */}
          <div className="space-y-2">
            <Label
              htmlFor="locality"
              className="text-sm font-semibold text-slate-700"
            >
              Locality <span className="text-red-500">*</span>
            </Label>
            <select
              id="locality"
              className="flex h-11 w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600"
              value={formData?.locality || ""}
              onChange={(e) => updateField("locality", e.target.value)}
            >
              <option value="" disabled>
                Select Locality
              </option>
              <option value="connaught-place">Connaught Place</option>
              <option value="bandra">Bandra</option>
              <option value="koramangala">Koramangala</option>
            </select>
          </div>

          {/* Building / Tower Name */}
          <div className="space-y-2">
            <Label
              htmlFor="buildingName"
              className="text-sm font-semibold text-slate-700"
            >
              Building / Tower Name
            </Label>
            <Input
              id="buildingName"
              placeholder=""
              className="h-11 border-slate-200 focus:border-blue-500"
              value={formData?.buildingName || ""}
              onChange={(e) => updateField("buildingName", e.target.value)}
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label
              htmlFor="address"
              className="text-sm font-semibold text-slate-700"
            >
              Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="address"
              placeholder=""
              className="h-11 border-slate-200 focus:border-blue-500"
              value={formData?.address || ""}
              onChange={(e) => updateField("address", e.target.value)}
            />
          </div>

          {/* Landmark */}
          <div className="space-y-2">
            <Label
              htmlFor="landmark"
              className="text-sm font-semibold text-slate-700"
            >
              Landmark
            </Label>
            <Input
              id="landmark"
              placeholder=""
              className="h-11 border-slate-200 focus:border-blue-500"
              value={formData?.landmark || ""}
              onChange={(e) => updateField("landmark", e.target.value)}
            />
          </div>

          {/* Pincode */}
          <div className="space-y-2">
            <Label
              htmlFor="pincode"
              className="text-sm font-semibold text-slate-700"
            >
              Pincode <span className="text-red-500">*</span>
            </Label>
            <Input
              id="pincode"
              placeholder=""
              className="h-11 border-slate-200 focus:border-blue-500"
              value={formData?.pincode || ""}
              onChange={(e) => updateField("pincode", e.target.value)}
            />
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 relative overflow-hidden h-[200px] flex items-center justify-center">
          <img
            src="/map-placeholder.png"
            alt="Map View"
            className="w-full h-full object-cover opacity-60"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://placehold.co/800x400/e2e8f0/64748b?text=Map+View";
            }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <MapPin className="text-red-500 w-10 h-10 drop-shadow-md" />
            <button className="mt-4 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 text-sm font-bold text-slate-700 flex items-center gap-2 hover:bg-slate-50 transition-colors">
              <MapPin className="w-4 h-4 text-blue-600" />
              Select on Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
