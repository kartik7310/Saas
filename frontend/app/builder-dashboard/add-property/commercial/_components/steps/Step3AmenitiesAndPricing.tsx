import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Zap, Users, Wind, Car, Shield, Video, Flame, Wifi, Coffee, User, Wrench, Droplets, Trash2, Landmark, Utensils, BatteryCharging, Accessibility, DoorOpen, AlertTriangle, IndianRupee, UploadCloud, Plus, X, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";

export default function Step3AmenitiesAndPricing({
  formData,
  updateNestedField,
  errors = {}
}: any) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const amenityImages = formData?.commercial?.amenityImages || [];

  const [customAmenity, setCustomAmenity] = useState("");

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

  const isShop = formData?.commercial?.propertyCategory === "Shop";
  const amenitiesList = isShop ? [
    { id: "Power Backup", icon: Zap },
    { id: "CCTV", icon: Video },
    { id: "Security", icon: Shield },
    { id: "Lift", icon: Users },
    { id: "Fire Safety", icon: Flame },
    { id: "Visitor Parking", icon: Car },
    { id: "Internet / WiFi", icon: Wifi },
    { id: "Air Conditioning", icon: Wind },
    { id: "Other", icon: Wrench },
  ] : [
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

  const selectAllAmenities = () => {
    const amenities = formData?.commercial?.amenities || [];
    const ids = amenitiesList.map(a => a.id);
    const allSelected = ids.every(id => amenities.includes(id));
    let updated;
    if (allSelected) {
      updated = amenities.filter((a: string) => !ids.includes(a));
    } else {
      updated = Array.from(new Set([...amenities, ...ids]));
    }
    updateNestedField("commercial.amenities", updated);
  };

  const addCustomAmenity = () => {
    if (!customAmenity.trim()) return;
    const amenities = formData?.commercial?.amenities || [];
    if (!amenities.includes(customAmenity.trim())) {
      updateNestedField("commercial.amenities", [...amenities, customAmenity.trim()]);
    }
    setCustomAmenity("");
  };

  const removeCustomAmenity = (amenity: string) => {
    const amenities = formData?.commercial?.amenities || [];
    updateNestedField("commercial.amenities", amenities.filter((a: string) => a !== amenity));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    const uploadToast = toast.loading("Uploading amenity images...");
    try {
      const uploadFormData = new FormData();
      Array.from(files).forEach((file) => { uploadFormData.append("files", file); });
      const data = await api("/properties/upload", { method: "POST", body: uploadFormData });
      const newUrls = data.files.map((f: any) => f.url);
      updateNestedField("commercial.amenityImages", [...amenityImages, ...newUrls]);
      toast.success("Amenity images uploaded successfully", { id: uploadToast });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload amenity images", { id: uploadToast });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (url: string) => {
    updateNestedField("commercial.amenityImages", amenityImages.filter((img: string) => img !== url));
  };

  const hasAmenity = (amenity: string) => {
    return (formData?.commercial?.amenities || []).includes(amenity);
  };

  const isForSale = formData?.commercial?.propertyPurpose === "Sell Property" || formData?.purpose === "SELL";

  const rent = parseFloat(formData?.pricing?.expectedRent || 0);
  const maintenance = parseFloat(formData?.pricing?.maintenance || 0);
  const deposit = parseFloat(formData?.pricing?.securityDeposit || 0);
  const salePrice = parseFloat(formData?.pricing?.totalPrice || formData?.pricing?.expectedPrice || 0);

  const formattedTotalPrice = salePrice.toLocaleString("en-IN");
  const formattedTotalRent = (rent + (isNaN(maintenance) ? 0 : maintenance)).toLocaleString("en-IN");

  const propertyCategory = formData?.commercial?.propertyCategory || "";
  const officeType = formData?.commercial?.officeType || "";
  const showAmenities = officeType !== "Bare Shell" || propertyCategory === "Shop";

  return (
    <div className="space-y-10">
      {/* --- Amenities Section --- */}
      {showAmenities && (
        <div>
          <div className="mb-6 border-b pb-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Users className="text-emerald-500 w-5 h-5" />Amenities</h2>
            <p className="text-sm text-slate-500 mt-1">Select the amenities available in your commercial space</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-6 shadow-sm mb-8">
            <h2 className="text-lg font-bold text-slate-800 mb-6 font-bold">Upload Amenity Images</h2>
            <div className="flex flex-wrap gap-4 items-center">
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple accept="image/*" className="hidden" />
              <div onClick={() => fileInputRef.current?.click()} className="flex-1 min-w-full sm:min-w-[300px] flex flex-col items-center justify-center border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-2xl p-6 hover:bg-blue-50/50 transition-colors cursor-pointer group">
                {isUploading ? <Loader2 className="h-7 w-7 text-blue-600 animate-spin mb-2" /> : <UploadCloud className="h-7 w-7 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />}
                <p className="text-sm font-bold text-blue-700">{isUploading ? "Uploading..." : "Drag & Drop Amenity Images"}</p>
                <p className="text-[11px] text-blue-500">or Browse Files</p>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 flex-1">
                {amenityImages.map((url: string, index: number) => (
                  <div key={index} className="h-20 w-32 relative rounded-xl overflow-hidden border border-slate-100 bg-slate-50 flex-shrink-0 group/img">
                    <img src={url} alt="Amenity" className="w-full h-full object-cover" />
                    <button onClick={() => removeImage(url)} className="absolute top-1 right-1 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center scale-0 group-hover/img:scale-100 transition-transform"><X className="h-3 w-3" /></button>
                  </div>
                ))}
                <button onClick={() => fileInputRef.current?.click()} className="h-20 w-32 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-blue-600 font-bold text-xs hover:bg-slate-100 flex-shrink-0"><Plus className="h-4 w-4 mb-1" />Add More</button>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={selectAllAmenities}
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                {(amenitiesList.map(a => a.id).every(id => (formData?.commercial?.amenities || []).includes(id))) ? "Deselect All" : "Select All"}
              </button>
            </div>
            <div className="flex gap-2 mb-6">
              <Input placeholder="Add custom amenity" value={customAmenity} onChange={(e) => setCustomAmenity(e.target.value)} className="h-10 text-sm" onKeyPress={(e) => e.key === 'Enter' && addCustomAmenity()} />
              <button onClick={addCustomAmenity} className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold"><Plus className="h-5 w-5" /></button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {amenitiesList.map((amenity) => (
                <label key={amenity.id} className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition-all ${hasAmenity(amenity.id) ? "border-blue-500 bg-blue-50 text-blue-800 shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"}`}>
                  <div className="relative flex items-center justify-center"><Checkbox id={amenity.id} checked={hasAmenity(amenity.id)} onCheckedChange={() => toggleAmenity(amenity.id)} className={`h-4 w-4 rounded border-2 ${hasAmenity(amenity.id) ? "border-blue-600 bg-blue-600" : "border-slate-300"}`} /></div>
                  <amenity.icon className={`w-4 h-4 ${hasAmenity(amenity.id) ? "text-blue-600" : "text-slate-400"}`} />
                  <span className="text-xs font-bold leading-tight">{amenity.id}</span>
                </label>
              ))}
              {formData?.commercial?.amenities?.filter((a: string) => !amenitiesList.some(al => al.id === a)).map((amenity: string) => (
                <div key={amenity} className="flex items-center gap-2 rounded-lg border p-3 border-blue-500 bg-blue-50 text-blue-800 shadow-sm relative group font-bold">
                  <Users className="w-4 h-4 text-blue-600 font-bold" />
                  <span className="text-xs font-bold leading-tight truncate pr-4">{amenity}</span>
                  <button onClick={() => removeCustomAmenity(amenity)} className="absolute top-1 right-1 h-4 w-4 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity font-bold"><X className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- Pricing Section --- */}
      <div>
        <div className="mb-6 border-b pb-4"><h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 font-bold"><IndianRupee className="text-blue-500 w-5 h-5 font-bold" />Pricing Details</h2><p className="text-sm text-slate-500 mt-1 font-bold">Setting the price for {isForSale ? "Sale" : "Rent"}</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-6 shadow-sm font-bold">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-bold">
            {isForSale ? (
              <>
                <div className="space-y-2"><Label htmlFor="totalPrice" className={`text-sm font-semibold font-bold ${errors.totalPrice ? "text-red-500" : "text-slate-700"}`}>Total Expected Price (₹) *</Label><div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none font-bold"><span className="text-slate-500 font-bold">₹</span></div><Input id="totalPrice" type="number" placeholder="e.g. 5000000" className={`h-12 pl-8 font-medium font-bold md:text-lg focus:border-blue-500 ${errors.totalPrice ? "border-red-500 ring-1 ring-red-500 font-bold" : "border-slate-200"}`} value={formData?.pricing?.totalPrice || formData?.pricing?.expectedPrice || ""} onChange={(e) => updateNestedField("pricing.totalPrice", e.target.value)} /></div>{errors.totalPrice && <p className="text-[10px] font-black text-red-500 uppercase">{errors.totalPrice}</p>}</div>
                <div className="space-y-2 font-bold"><Label htmlFor="maintenanceSale" className="text-sm font-semibold text-slate-700 font-bold">Maintenance (Optional)</Label><div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none font-bold"><span className="text-slate-500 font-bold">₹</span></div><Input id="maintenanceSale" type="number" placeholder="Per month" className="h-12 pl-8 border-slate-200 focus:border-blue-500 font-bold" value={formData?.pricing?.maintenance || ""} onChange={(e) => updateNestedField("pricing.maintenance", e.target.value)} /></div></div>
                <div className="col-span-1 md:col-start-3 bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-col justify-center font-bold"><div className="text-blue-800 text-xs font-bold mb-1 uppercase tracking-wider font-bold">Total Sale Price</div><div className="flex items-baseline gap-1 font-bold"><span className="text-2xl font-black text-blue-900 font-bold">₹ {salePrice ? formattedTotalPrice : "0"}</span></div></div>
              </>
            ) : (
              <>
                <div className="space-y-2 font-bold"><Label htmlFor="monthlyRent" className={`text-sm font-semibold font-bold ${errors.expectedRent ? "text-red-500" : "text-slate-700"}`}>Monthly Rent (₹) *</Label><div className="relative font-bold"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none font-bold"><span className="text-slate-500 font-bold">₹</span></div><Input id="monthlyRent" type="number" placeholder="e.g. 80000" className={`h-12 pl-8 font-medium font-bold md:text-lg focus:border-blue-500 ${errors.expectedRent ? "border-red-500 ring-1 ring-red-500 font-bold" : "border-slate-200"}`} value={formData?.pricing?.expectedRent || ""} onChange={(e) => updateNestedField("pricing.expectedRent", e.target.value)} /></div>{errors.expectedRent && <p className="text-[10px] font-black text-red-500 uppercase font-bold">{errors.expectedRent}</p>}</div>
                <div className="space-y-2 font-bold"><Label htmlFor="securityDeposit" className="text-sm font-semibold text-slate-700 font-bold">Security Deposit (₹)</Label><div className="relative font-bold"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none font-bold"><span className="text-slate-500 font-bold">₹</span></div><Input id="securityDeposit" type="number" placeholder="e.g. 240000" className="h-12 pl-8 border-slate-200 focus:border-blue-500 font-bold" value={formData?.pricing?.securityDeposit || ""} onChange={(e) => updateNestedField("pricing.securityDeposit", e.target.value)} /></div></div>
                <div className="space-y-2 font-bold"><Label htmlFor="maintenanceRent" className="text-sm font-semibold text-slate-700 font-bold">Maintenance (₹)</Label><div className="relative font-bold"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none font-bold"><span className="text-slate-500 font-bold">₹</span></div><Input id="maintenanceRent" type="number" placeholder="Amount" className="h-12 pl-8 border-slate-200 focus:border-blue-500 font-bold" value={formData?.pricing?.maintenance || ""} onChange={(e) => updateNestedField("pricing.maintenance", e.target.value)} /></div></div>
                <div className="col-span-1 md:col-start-3 bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex flex-col justify-center font-bold"><div className="text-emerald-800 text-xs font-bold mb-1 uppercase tracking-wider font-bold">Total Monthly</div><div className="flex items-baseline gap-1 font-bold"><span className="text-2xl font-black text-emerald-900 font-bold">₹ {rent ? formattedTotalRent : "0"}</span></div></div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
