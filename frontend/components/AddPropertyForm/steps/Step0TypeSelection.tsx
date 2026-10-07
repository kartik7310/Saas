import { Label } from "@/components/ui/label";

export default function Step0TypeSelection({ formData, updateNestedField }: any) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-6 shadow-sm">
      <div className="mb-8 border-b pb-4">
        <h2 className="text-xl font-bold text-slate-800">Property Purpose & Type</h2>
        <p className="text-sm text-slate-500">How do you want to list your property?</p>
      </div>

      <div className="grid gap-8">
        {/* Purpose: Sell vs Rent */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold text-slate-700">I want to...</Label>
          <div className="flex gap-4">
            {["SELL", "RENT"].map((purpose) => (
              <label
                key={purpose}
                className={`flex-1 flex cursor-pointer items-center justify-center gap-3 rounded-xl border p-4 text-sm font-bold transition-all ${
                  formData.purpose === purpose
                    ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="purpose"
                  value={purpose}
                  className="hidden"
                  checked={formData.purpose === purpose}
                  onChange={() => updateNestedField("purpose", purpose)}
                />
                {purpose === "SELL" ? "Sell Property" : "Rent / Lease"}
              </label>
            ))}
          </div>
        </div>

        {/* Listing Type: Residential vs Commercial */}
        <div className="space-y-4">
          <Label className="text-sm font-semibold text-slate-700">Property Category</Label>
          <div className="flex gap-4">
            {["RESIDENTIAL", "COMMERCIAL"].map((type) => (
              <label
                key={type}
                className={`flex-1 flex cursor-pointer items-center justify-center gap-3 rounded-xl border p-4 text-sm font-bold transition-all ${
                  formData.listingType === type
                    ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="listingType"
                  value={type}
                  className="hidden"
                  checked={formData.listingType === type}
                  onChange={() => updateNestedField("listingType", type)}
                />
                {type === "RESIDENTIAL" ? "Residential" : "Commercial"}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
