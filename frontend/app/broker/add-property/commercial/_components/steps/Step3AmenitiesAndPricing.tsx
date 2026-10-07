import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Zap, Users, Wind, Car, Shield, Video, Flame, Wifi, Coffee, User, Wrench, Droplets, Trash2, Landmark, Utensils, BatteryCharging, Accessibility, DoorOpen, AlertTriangle, IndianRupee } from "lucide-react";
export default function Step3AmenitiesAndPricing({
  formData,
  updateNestedField,
  errors = {}
}: any) {
  const toggleAmenity = (amenity: string) => {
    const amenities = formData?.commercial?.amenities || [];
    let updated;
    if (amenities.includes(amenity)) {
      updated = amenities.filter((a: string) => a !== amenity);
    } else {
      updated = [...amenities, amenity];
    }
    updateNestedField("commercial.amenities", updated);
  };

  const hasAmenity = (amenity: string) => {
    return (formData?.commercial?.amenities || []).includes(amenity);
  };

  const amenitiesList = [
    { id: "Power Backup", icon: Zap },
    { id: "Lift", icon: Users },
    { id: "Central AC", icon: Wind },
    { id: "Visitor Parking", icon: Car },
    { id: "Access Control", icon: Shield },
    { id: "CCTV", icon: Video },
    { id: "Fire Safety", icon: Flame },
    { id: "High Speed Internet", icon: Wifi },
    { id: "Security", icon: Shield },
    { id: "Cafeteria", icon: Coffee },

    { id: "Conference Room", icon: Users },
    { id: "Reception Area", icon: User },
    { id: "Maintenance Staff", icon: Wrench },
    { id: "Pantry", icon: Coffee },
    { id: "24x7 Water Supply", icon: Droplets },
    { id: "Waste Disposal", icon: Trash2 },
    { id: "ATM", icon: Landmark },
    { id: "Food Court", icon: Utensils },
    { id: "EV Charging", icon: BatteryCharging },
    { id: "Wheelchair Access", icon: Accessibility },
    { id: "Emergency Exit", icon: DoorOpen },
    { id: "Smoke Detectors", icon: AlertTriangle },
    { id: "Other", icon: Wrench },
  ];

  const isForSale = formData?.commercial?.forSaleRent === "For Sale";

  // Calculate generic totals for display based on mode
  const rent = parseFloat(formData?.pricing?.expectedRent || 0);
  const maintenance = parseFloat(formData?.pricing?.maintenance || 0);
  const deposit = parseFloat(formData?.pricing?.securityDeposit || 0);
  const salePrice = parseFloat(formData?.pricing?.totalPrice || 0);

  const formattedTotalRent = (
    rent + (isNaN(maintenance) ? 0 : maintenance)
  ).toLocaleString("en-IN");
  const formattedTotalPrice = salePrice.toLocaleString("en-IN");

  return (
    <div className="space-y-10">
      {/* --- Amenities Section --- */}
      <div>
        <div className="mb-6 border-b pb-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="text-emerald-500 w-5 h-5" />
            Amenities
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Select the amenities available in your commercial space
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-6 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {amenitiesList.map((amenity) => (
              <label
                key={amenity.id}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition-all ${hasAmenity(amenity.id)
                  ? "border-blue-500 bg-blue-50 text-blue-800 shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
              >
                <div className="relative flex items-center justify-center">
                  <Checkbox
                    id={amenity.id}
                    checked={hasAmenity(amenity.id)}
                    onCheckedChange={() => toggleAmenity(amenity.id)}
                    className={`h-4 w-4 rounded border-2 ${hasAmenity(amenity.id) ? "border-blue-600 bg-blue-600" : "border-slate-300"}`}
                  />
                </div>
                <amenity.icon
                  className={`w-4 h-4 ${hasAmenity(amenity.id) ? "text-blue-600" : "text-slate-400"}`}
                />
                <span className="text-xs font-bold leading-tight">
                  {amenity.id}
                </span>
              </label>
            ))}
            {/* Other Amenities */}
            {hasAmenity("Other") && (
              <div className="col-span-full mt-2">
                <Label
                  htmlFor="otherAmenities"
                  className="text-sm font-semibold text-slate-700"
                >
                  Other Amenities
                </Label>
                <Input
                  id="otherAmenities"
                  type="text"
                  placeholder="e.g. Gym, Swimming Pool, etc."
                  className="h-10 border-slate-200 mt-2 font-sm md:text-md focus:border-blue-500"
                  value={formData?.commercial?.amenitiesDescription || ""}
                  onChange={(e) =>
                    updateNestedField("commercial.amenitiesDescription", e.target.value)
                  }
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- Pricing Section --- */}
      <div>
        <div className="mb-6 border-b pb-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <IndianRupee className="text-blue-500 w-5 h-5" />
            Pricing Details
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Set the price or rent for your property
          </p>
        </div>

        <div className="flex bg-slate-100 rounded-lg p-1 w-full max-w-sm mb-6">
          {["For Sale", "For Rent"].map((mode) => (
            <button
              key={mode}
              onClick={() => updateNestedField("commercial.forSaleRent", mode)}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${formData?.commercial?.forSaleRent === mode
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                }`}
            >
              {mode}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isForSale ? (
              <>
                <div className="space-y-2">
                  <Label
                    htmlFor="totalPrice"
                    className={`text-sm font-semibold ${errors.totalPrice ? "text-red-500" : "text-slate-700"}`}
                  >
                    Total Expected Price (₹) *
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-slate-500 font-bold">₹</span>
                    </div>
                    <Input
                      id="totalPrice"
                      type="number"
                      placeholder="e.g. 5000000"
                      className={`h-12 pl-8 font-medium md:text-lg focus:border-blue-500 ${errors.totalPrice ? "border-red-500 ring-1 ring-red-500" : "border-slate-200"}`}
                      value={formData?.pricing?.totalPrice || ""}
                      onChange={(e) =>
                        updateNestedField("pricing.totalPrice", e.target.value)
                      }
                    />
                  </div>
                  {errors.totalPrice && <p className="text-[10px] font-black text-red-500 uppercase">{errors.totalPrice}</p>}
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
                      className="h-12 pl-8 border-slate-200 focus:border-blue-500"
                      value={formData?.pricing?.maintenance || ""}
                      onChange={(e) =>
                        updateNestedField("pricing.maintenance", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Total Summary Box (Sale) */}
                <div className="col-span-1 md:col-start-3 bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-col justify-center">
                  <div className="text-blue-800 text-xs font-bold mb-1 uppercase tracking-wider">
                    Total Sale Price
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-blue-900">
                      ₹ {formData?.pricing?.totalPrice ? formattedTotalPrice : "0"}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label
                    htmlFor="monthlyRent"
                    className={`text-sm font-semibold ${errors.expectedRent ? "text-red-500" : "text-slate-700"}`}
                  >
                    Monthly Rent (₹) *
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-slate-500 font-bold">₹</span>
                    </div>
                    <Input
                      id="monthlyRent"
                      type="number"
                      placeholder="e.g. 80000"
                      className={`h-12 pl-8 font-medium md:text-lg focus:border-blue-500 ${errors.expectedRent ? "border-red-500 ring-1 ring-red-500" : "border-slate-200"}`}
                      value={formData?.pricing?.expectedRent || ""}
                      onChange={(e) =>
                        updateNestedField("pricing.expectedRent", e.target.value)
                      }
                    />
                  </div>
                  {errors.expectedRent && <p className="text-[10px] font-black text-red-500 uppercase">{errors.expectedRent}</p>}
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
                      className="h-12 pl-8 border-slate-200 focus:border-blue-500"
                      value={formData?.pricing?.securityDeposit || ""}
                      onChange={(e) =>
                        updateNestedField("pricing.securityDeposit", e.target.value)
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
                      placeholder="Amount"
                      className="h-12 pl-8 border-slate-200 focus:border-blue-500"
                      value={formData?.pricing?.maintenance || ""}
                      onChange={(e) =>
                        updateNestedField("pricing.maintenance", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Total Summary Box (Rent) */}
                <div className="col-span-1 md:col-start-3 bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex flex-col justify-center">
                  <div className="text-emerald-800 text-xs font-bold mb-1 uppercase tracking-wider">
                    Total Monthly
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-emerald-900">
                      ₹ {formData?.pricing?.expectedRent ? formattedTotalRent : "0"}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
