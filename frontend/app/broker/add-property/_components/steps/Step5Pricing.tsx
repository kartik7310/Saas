import { useState } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function Step5Pricing({ formData, updateNestedField, errors = {}, isCommercial }: any) {
   const [tenure, setTenure] = useState(10);
   const [emiEnabled, setEmiEnabled] = useState(true);

   if (isCommercial) {
      return (
         <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-6 shadow-sm">
               <h2 className="text-lg font-bold text-slate-800 mb-4">Set Commercial Pricing</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {formData.purpose === "SELL" ? (
                     <div className="space-y-2">
                        <Label>Expected Total Price *</Label>
                        <div className="relative">
                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                           <Input
                              placeholder="1,00,00,000"
                              className="pl-8 h-11"
                              value={formData.pricing.expectedPrice}
                              onChange={(e) => updateNestedField("pricing.expectedPrice", e.target.value)}
                           />
                        </div>
                     </div>
                  ) : (
                     <div className="space-y-2">
                        <Label>Expected Monthly Rent *</Label>
                        <div className="relative">
                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                           <Input
                              placeholder="50,000"
                              className="pl-8 h-11"
                              value={formData.pricing.expectedRent}
                              onChange={(e) => updateNestedField("pricing.expectedRent", e.target.value)}
                           />
                        </div>
                     </div>
                  )}

                  <div className="space-y-2">
                     <Label>Maintenance (Monthly)</Label>
                     <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                        <Input
                           placeholder="5,000"
                           className="pl-8 h-11"
                           value={formData.pricing.maintenance}
                           onChange={(e) => updateNestedField("pricing.maintenance", e.target.value)}
                        />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className="space-y-6">
         {/* Price Information */}
         <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
               Set Pricing Details
            </h2>

            <div className="border-t border-slate-100 pt-6">
               <h3 className="text-sm font-semibold text-slate-700 mb-6 font-black uppercase tracking-widest">
                  Price Information
               </h3>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Starting Price */}
                  <div className="space-y-2">
                     <Label className={errors.startingPrice ? "text-red-500 font-bold" : ""}>Starting Price *</Label>
                     <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                           ₹
                        </span>
                        <Input
                           placeholder="50,00,000"
                           className={`pl-8 h-11 font-semibold ${errors.startingPrice ? "border-red-500 ring-1 ring-red-500" : ""}`}
                           value={formData?.pricing?.startingPrice || ""}
                           onChange={(e) => updateNestedField("pricing.startingPrice", e.target.value)}
                        />
                     </div>
                     {errors.startingPrice && <p className="text-[10px] font-black text-red-500 uppercase">{errors.startingPrice}</p>}
                  </div>

                  {/* Price per sqft */}
                  <div className="space-y-2">
                     <Label>Price Per Sq.ft (Optional)</Label>
                     <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                           ₹
                        </span>
                        <Input
                           placeholder="7,500"
                           className="pl-8 h-11 font-semibold"
                           value={formData?.pricing?.pricePerSqft || ""}
                           onChange={(e) => updateNestedField("pricing.pricePerSqft", e.target.value)}
                        />
                     </div>
                  </div>

                  {/* Available Units */}
                  <div className="space-y-2">
                     <Label className={errors.availableUnits ? "text-red-500 font-bold" : ""}>Available Units *</Label>
                     <Input
                        placeholder="50"
                        className={`h-11 font-semibold ${errors.availableUnits ? "border-red-500 ring-1 ring-red-500" : ""}`}
                        value={formData?.pricing?.availableUnits || ""}
                        onChange={(e) => updateNestedField("pricing.availableUnits", e.target.value)}
                     />
                     {errors.availableUnits && <p className="text-[10px] font-black text-red-500 uppercase">{errors.availableUnits}</p>}
                  </div>

                  {/* Booking Amount */}
                  <div className="space-y-2">
                     <Label className={errors.bookingAmount ? "text-red-500 font-bold" : ""}>Booking Amount *</Label>
                     <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                           ₹
                        </span>
                        <Input
                           placeholder="1,00,000"
                           className={`pl-8 h-11 font-semibold ${errors.bookingAmount ? "border-red-500 ring-1 ring-red-500" : ""}`}
                           value={formData?.pricing?.bookingAmount || ""}
                           onChange={(e) => updateNestedField("pricing.bookingAmount", e.target.value)}
                        />
                     </div>
                     {errors.bookingAmount && <p className="text-[10px] font-black text-red-500 uppercase">{errors.bookingAmount}</p>}
                  </div>
               </div>
            </div>
         </div>

         {/* Payment Plans + EMI - Temporarily Commented Out
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-6 shadow-sm">
               <h3 className="text-sm font-semibold text-slate-700 mb-6">Payment Plans</h3>
               <button className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-100">
                  <RotateCcw className="h-4 w-4" />
                  Add Payment Plan
               </button>

               <div className="flex items-center gap-3 mt-6">
                  <div
                     onClick={() => setEmiEnabled(!emiEnabled)}
                     className={`w-11 h-6 rounded-full p-1 cursor-pointer ${emiEnabled ? "bg-blue-600" : "bg-slate-300"}`}
                  >
                     <div className={`bg-white w-4 h-4 rounded-full transition ${emiEnabled ? "translate-x-5" : ""}`} />
                  </div>
                  <Label className="text-sm font-semibold">EMI Calculator</Label>
               </div>

               <div className="mt-6 space-y-5">
                  <div>
                     <Label className="text-xs text-slate-500">Enter Loan Details</Label>
                     <div className="flex mt-2 border rounded-lg overflow-hidden">
                        <div className="px-3 flex items-center text-sm text-slate-500 bg-slate-50">Loan Amount</div>
                        <Input defaultValue="45,00,000" className="border-0 h-11 font-semibold text-right" />
                        <div className="px-3 flex items-center text-slate-400">₹</div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-6 shadow-sm flex flex-col gap-6">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div><p className="text-xs text-slate-400">Monthly EMI</p><p className="text-xl font-bold text-slate-800">₹ 39,033</p></div>
                  <div><p className="text-xs text-slate-400">Total Interest</p><p className="text-xl font-bold text-slate-800">₹ 48,67,875</p></div>
                  <div><p className="text-xs text-slate-400">Total Amount</p><p className="text-xl font-bold text-slate-800">₹ 93,67,875</p></div>
               </div>
               <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex justify-between mb-3"><p className="text-sm text-slate-600">Loan Tenure</p><span className="text-sm font-semibold text-blue-600">{tenure} Years</span></div>
                  <input type="range" min="0" max="30" value={tenure} onChange={(e) => setTenure(Number(e.target.value))} className="w-full accent-blue-600" />
               </div>
            </div>
         </div>
         */}
      </div>
   );
}