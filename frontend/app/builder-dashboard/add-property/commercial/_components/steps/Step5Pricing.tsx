import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IndianRupee } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function Step5Pricing({ formData, setFormData }: any) {
  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const isForSale = formData?.forSaleRent === "For Sale";

  // Calculate generic totals for display based on mode
  const rent = parseFloat(formData?.monthlyRent || 0);
  const maintenance = parseFloat(formData?.maintenance || 0);
  const deposit = parseFloat(formData?.securityDeposit || 0);
  const salePrice = parseFloat(formData?.totalPrice || 0);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2 space-y-8 lg:w-2/3 mx-auto">
        <div className="flex items-center gap-3 border-b pb-4 mb-2">
          <div className="p-2 bg-blue-100 rounded text-blue-600">
            <IndianRupee className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Pricing Details</h2>
        </div>

        {/* For Sale / For Rent Toggle */}
        <div className="flex bg-slate-100 rounded-lg p-1 w-full max-w-sm mx-auto">
          {["For Sale", "For Rent"].map((mode) => (
            <button
              key={mode}
              onClick={() => updateField("forSaleRent", mode)}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
                formData?.forSaleRent === mode
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {isForSale ? (
            <>
              <div className="space-y-2">
                <Label
                  htmlFor="totalPrice"
                  className="text-sm font-semibold text-slate-700"
                >
                  Total Expected Price (₹)
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 font-bold">₹</span>
                  </div>
                  <Input
                    id="totalPrice"
                    type="number"
                    placeholder="e.g. 5000000"
                    className="h-12 pl-8 border-slate-200 font-medium text-lg"
                    value={formData?.totalPrice || ""}
                    onChange={(e) => updateField("totalPrice", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="maintenanceSale"
                  className="text-sm font-semibold text-slate-700"
                >
                  Maintenance (Optional)
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 font-bold">₹</span>
                  </div>
                  <Input
                    id="maintenanceSale"
                    type="number"
                    placeholder="Per month"
                    className="h-12 pl-8 border-slate-200"
                    value={formData?.maintenance || ""}
                    onChange={(e) => updateField("maintenance", e.target.value)}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label
                  htmlFor="monthlyRent"
                  className="text-sm font-semibold text-slate-700"
                >
                  Monthly Rent (₹)
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 font-bold">₹</span>
                  </div>
                  <Input
                    id="monthlyRent"
                    type="number"
                    placeholder="e.g. 80000"
                    className="h-12 pl-8 border-slate-200 font-medium text-lg focus:border-blue-500"
                    value={formData?.monthlyRent || ""}
                    onChange={(e) => updateField("monthlyRent", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="securityDeposit"
                  className="text-sm font-semibold text-slate-700"
                >
                  Security Deposit (₹)
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 font-bold">₹</span>
                  </div>
                  <Input
                    id="securityDeposit"
                    type="number"
                    placeholder="e.g. 240000"
                    className="h-12 pl-8 border-slate-200"
                    value={formData?.securityDeposit || ""}
                    onChange={(e) =>
                      updateField("securityDeposit", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="maintenanceRent"
                  className="text-sm font-semibold text-slate-700"
                >
                  Maintenance (₹)
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 font-bold">₹</span>
                  </div>
                  <Input
                    id="maintenanceRent"
                    type="number"
                    placeholder="Included or Extra?"
                    className="h-12 pl-8 border-slate-200"
                    value={formData?.maintenance || ""}
                    onChange={(e) => updateField("maintenance", e.target.value)}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Total Summary Box */}
        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-slate-700 text-sm font-medium">
            Total {isForSale ? "Price" : "Monthly Outflow"}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800">
              {isForSale
                ? formData?.totalPrice
                  ? formatPrice(salePrice)
                  : "₹ 0"
                : formData?.monthlyRent
                  ? formatPrice(rent + maintenance)
                  : "₹ 0"}
            </span>
            {!isForSale && (
              <span className="text-sm font-bold text-slate-500">/ Month</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
