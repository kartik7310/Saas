import { Label } from "@/components/ui/label";
import { Building2, Store } from "lucide-react";

export default function Step1BasicInfo({ formData, setFormData }: any) {
  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="grid gap-6 md:grid-cols-3 items-start">
      {/* Property Type */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800">Property Type</h3>
        <div className="space-y-3">
          {["Sell Property", "Rent / Lease"].map((type) => (
            <label
              key={type}
              className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                formData?.propertyType === type
                  ? "border-blue-200 bg-blue-50 text-blue-800"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                    formData?.propertyType === type
                      ? "border-blue-600"
                      : "border-slate-400"
                  }`}
                >
                  {formData?.propertyType === type && (
                    <div className="h-2 w-2 rounded-full bg-blue-600" />
                  )}
                </div>
                {type}
              </div>
              {formData?.propertyType === type && (
                <div className="h-5 w-5 rounded bg-emerald-500 flex items-center justify-center">
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
            </label>
          ))}
        </div>
      </div>

      {/* I Am */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800">I Am</h3>
        <div className="flex gap-3">
          {["Owner", "Broker", "Builder"].map((role) => (
            <label
              key={role}
              className={`flex-1 flex cursor-pointer items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium transition-all ${
                formData?.iAm === role
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div
                className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                  formData?.iAm === role
                    ? "border-emerald-600"
                    : "border-slate-400"
                }`}
              >
                {formData?.iAm === role && (
                  <div className="h-2 w-2 rounded-full bg-emerald-600" />
                )}
              </div>
              {role}
            </label>
          ))}
        </div>
      </div>

      {/* Property Category */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 md:row-span-2">
        <h3 className="text-sm font-bold text-slate-800">Property Category</h3>
        <div className="space-y-3">
          {[
            { id: "Office", icon: Building2 },
            { id: "Shop", icon: Store },
          ].map((cat) => (
            <label
              key={cat.id}
              className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                formData?.propertyCategory === cat.id
                  ? "border-blue-200 bg-blue-50 text-blue-800"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded text-blue-600">
                  <cat.icon className="w-5 h-5" />
                </div>
                {cat.id}
              </div>
              <input
                type="radio"
                name="propertyCategory"
                className="hidden"
                checked={formData?.propertyCategory === cat.id}
                onChange={() => {
                  updateField("propertyCategory", cat.id);
                  updateField("officeType", "");
                  updateField("shopType", "");
                }}
              />
              {formData?.propertyCategory === cat.id && (
                <div className="h-5 w-5 rounded bg-emerald-500 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </label>
          ))}
        </div>

        {/* Office Type */}
        {formData?.propertyCategory === "Office" && (
          <div className="space-y-2 pt-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Office Type</p>
            <div className="space-y-2">
              {["Bare Shell", "Warm Shell", "Fully Furnished", "Co-working"].map((type) => (
                <button
                  key={type}
                  onClick={() => updateField("officeType", type)}
                  className={`w-full text-left rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                    formData?.officeType === type
                      ? "border-blue-400 bg-blue-50 text-blue-700"
                      : "border-slate-200 hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Shop Type */}
        {formData?.propertyCategory === "Shop" && (
          <div className="space-y-2 pt-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Shop Type</p>
            <div className="space-y-2">
              {["Retail Shop", "Showroom", "Food Outlet"].map((type) => (
                <button
                  key={type}
                  onClick={() => updateField("shopType", type)}
                  className={`w-full text-left rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                    formData?.shopType === type
                      ? "border-blue-400 bg-blue-50 text-blue-700"
                      : "border-slate-200 hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
