import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Car,
  CheckCircle2,
  Coffee,
  Flame,
  Layout,
  LayoutGrid,
  Plus,
  Search,
  Shield,
  Trash2,
  Users,
  Video,
  Wind,
  X,
  Zap,
  Wifi,
  Monitor,
  Building,
  Building2,
  Table,
  User,
  Droplets,
  Landmark,
  Utensils,
  BatteryCharging,
  Accessibility,
  DoorOpen,
  AlertTriangle,
  UploadCloud,
  Loader2
} from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";

export default function Step4Amenities({ formData, updateNestedField, isCommercial }: any) {
  const [customAmenity, setCustomAmenity] = useState("");
  const [customConfig, setCustomConfig] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedAmenities = (isCommercial ? formData.commercial.amenities : formData.residential.amenities) || [];
  const amenityImages = (isCommercial ? formData.commercial.amenityImages : formData.residential.amenityImages) || [];

  const isShop = formData.commercial?.propertyCategory === "Shop";
  const defaultConfigItems = [
    { id: "cabins", label: "Cabins", icon: Building },
    { id: "workstations", label: "Workstations", icon: LayoutGrid },
    { id: "meetingRooms", label: "Meeting Rooms", icon: Users },
    { id: "conferenceRooms", label: "Conference Rooms", icon: Layout },
    { id: "receptionArea", label: "Reception Area", icon: Table },
  ];
  
  const defaultShopConfigItems = [
    { id: "washroom", label: "Washroom", icon: Users },
    { id: "pantry", label: "Pantry", icon: Coffee },
    { id: "parking", label: "Parking", icon: Car },
    { id: "cornerShop", label: "Corner Shop", icon: LayoutGrid },
  ];

  const defaultItems = isShop ? defaultShopConfigItems : defaultConfigItems;
  const otherItems = isShop ? defaultConfigItems : defaultShopConfigItems;

  const officeAmenities = [
    "Power Backup", "Lift", "Central AC", "Visitor Parking", "Access Control", "CCTV", "Fire Safety",
    "High Speed Internet", "Security", "Cafeteria", "Conference Room", "Reception Area",
    "Maintenance Staff", "Pantry", "24x7 Water Supply", "Waste Disposal", "ATM", "Food Court",
    "EV Charging", "Wheelchair Access", "Emergency Exit", "Smoke Detectors", "Other"
  ];

  const shopAmenities = [
    "Power Backup", "CCTV", "Security", "Lift", "Fire Safety", "Visitor Parking", "Internet / WiFi", "Air Conditioning", "Other"
  ];

  const residentialAmenitiesList = [
    "Swimming Pool", "Gymnasium", "Park", "Reserved Parking", "Security", "Club House", 
    "Power Backup", "Lift", "Rain Water Harvesting", "Water Storage", "Maintenance Staff",
    "Waste Disposal", "Internet/Wi-Fi Connectivity", "DTH Television Facility", "Laundry Service"
  ];

  const amenitiesList = isCommercial ? (isShop ? shopAmenities : officeAmenities) : residentialAmenitiesList;

  const toggleAmenity = (amenity: string) => {
    let updated;
    if (selectedAmenities.includes(amenity)) {
      updated = selectedAmenities.filter((a: string) => a !== amenity);
    } else {
      updated = [...selectedAmenities, amenity];
    }
    const path = isCommercial ? "commercial.amenities" : "residential.amenities";
    updateNestedField(path, updated);
  };

  const selectAllAmenities = () => {
    const allSelected = amenitiesList.every(a => selectedAmenities.includes(a));
    let updated;
    if (allSelected) {
      updated = selectedAmenities.filter((a: string) => !amenitiesList.includes(a));
    } else {
      updated = Array.from(new Set([...selectedAmenities, ...amenitiesList]));
    }
    const path = isCommercial ? "commercial.amenities" : "residential.amenities";
    updateNestedField(path, updated);
  };

  const addCustomAmenity = () => {
    if (!customAmenity.trim()) return;
    if (!selectedAmenities.includes(customAmenity.trim())) {
      const path = isCommercial ? "commercial.amenities" : "residential.amenities";
      updateNestedField(path, [...selectedAmenities, customAmenity.trim()]);
    }
    setCustomAmenity("");
  };

  const removeExtraConfig = (id: string) => {
    const configKey = isShop ? "commercial.shopConfiguration" : "commercial.officeConfiguration";
    const currentConfig = isShop ? { ...formData.commercial.shopConfiguration } : { ...formData.commercial.officeConfiguration };
    delete currentConfig[id];
    updateNestedField(configKey, currentConfig);
  };

  const addCustomConfig = () => {
    if (!customConfig.trim()) return;
    const id = customConfig.trim().toLowerCase().replace(/\s+/g, "_");
    const configKey = isShop ? `commercial.shopConfiguration.${id}` : `commercial.officeConfiguration.${id}`;
    updateNestedField(configKey, 0);
    setCustomConfig("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    const uploadToast = toast.loading("Uploading images...");
    try {
      const uploadFormData = new FormData();
      Array.from(files).forEach((file) => { uploadFormData.append("files", file); });
      const data = await api("/properties/upload", { method: "POST", body: uploadFormData });
      const newUrls = data.files.map((f: any) => f.url);
      const path = isCommercial ? "commercial.amenityImages" : "residential.amenityImages";
      updateNestedField(path, [...amenityImages, ...newUrls]);
      toast.success("Images uploaded successfully", { id: uploadToast });
    } catch (error) {
       toast.error("Failed to upload images", { id: uploadToast });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (url: string) => {
    const path = isCommercial ? "commercial.amenityImages" : "residential.amenityImages";
    updateNestedField(path, amenityImages.filter((img: string) => img !== url));
  };

  const currentConfig = isShop 
    ? (formData.commercial?.shopConfiguration || {})
    : (formData.commercial?.officeConfiguration || {});
  const configKeys = Object.keys(currentConfig);
  const extraConfigItems = configKeys
    .filter(key => !defaultItems.some((item: any) => item.id === key))
    .map(key => ({
      id: key,
      label: key.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      icon: Plus
    }));

  const officeType = formData.commercial?.officeType || "";
  const showConfig = isCommercial && (officeType === "Fully Furnished" || officeType === "Co-working" || isShop);
  const configTitle = isShop ? "Shop Configuration" : "Office Configuration";

  return (
    <div className="space-y-6">
      {/* Media Source Area */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Amenity Media</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple accept="image/*" className="hidden" />
          <div onClick={() => !isUploading && fileInputRef.current?.click()} className="flex-1 min-w-[200px] flex flex-col items-center justify-center border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-2xl p-6 hover:bg-blue-50/50 transition-colors cursor-pointer group">
            {isUploading ? <Loader2 className="h-7 w-7 text-blue-600 animate-spin mb-2" /> : <UploadCloud className="h-7 w-7 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />}
            <p className="text-sm font-bold text-blue-700">{isUploading ? "Uploading..." : "Click to Upload"}</p>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 flex-1">
            {amenityImages.map((url: string, index: number) => (
              <div key={index} className="h-20 w-32 relative rounded-xl overflow-hidden border border-slate-100 flex-shrink-0 group/img">
                <img src={url} alt="Amenity" className="w-full h-full object-cover" />
                <button onClick={() => removeImage(url)} className="absolute top-1 right-1 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center scale-0 group-hover/img:scale-100 transition-transform"><X className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Amenities Selection & Summary Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Selection Area */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-4 md:p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800">Amenities Provided *</h2>
            <button 
              onClick={selectAllAmenities}
              className="text-[11px] font-bold text-blue-600 flex items-center gap-1 hover:underline"
            >
              <CheckCircle2 className="h-3 w-3" /> 
              {amenitiesList.every(a => selectedAmenities.includes(a)) ? "Deselect All" : "Select All"}
            </button>
          </div>

          <div className="flex gap-2 mb-6">
            <Input placeholder="Add custom amenity" value={customAmenity} onChange={(e) => setCustomAmenity(e.target.value)} className="h-10 text-sm" onKeyPress={(e) => e.key === 'Enter' && addCustomAmenity()} />
            <button onClick={addCustomAmenity} className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"><Plus className="h-5 w-5" /></button>
          </div>

          <div className="overflow-y-auto max-h-[280px] custom-scrollbar pr-2">
            <div className="grid grid-cols-2 gap-y-3 gap-x-6">
              {amenitiesList.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox 
                    id={amenity} 
                    checked={selectedAmenities.includes(amenity)} 
                    onCheckedChange={() => toggleAmenity(amenity)} 
                    className="h-4 w-4 rounded border-slate-300" 
                  />
                  <Label htmlFor={amenity} className="text-sm cursor-pointer transition-colors text-slate-600 font-bold">{amenity}</Label>
                </div>
              ))}
              
              {selectedAmenities.filter((a: string) => !amenitiesList.includes(a)).map((amenity: string) => (
                <div key={amenity} className="flex items-center space-x-2 group cursor-pointer" onClick={() => toggleAmenity(amenity)}>
                  <Checkbox id={amenity} checked={true} onCheckedChange={() => toggleAmenity(amenity)} className="h-4 w-4 rounded border-slate-300" />
                  <Label htmlFor={amenity} className="text-sm cursor-pointer transition-colors text-blue-700 font-bold flex items-center gap-1">
                    {amenity}
                    <button onClick={(e) => { e.stopPropagation(); toggleAmenity(amenity); }} className="opacity-0 group-hover:opacity-100 text-red-500 transition-opacity"><X className="h-3 w-3" /></button>
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Area / Office Configuration */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-6 shadow-sm flex flex-col">
          {showConfig ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-blue-600" /> {configTitle}
                </h2>
              </div>

              <div className="flex gap-2 mb-6">
                <Input
                  placeholder={`Add config item`}
                  value={customConfig}
                  onChange={(e) => setCustomConfig(e.target.value)}
                  className="h-10 text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && addCustomConfig()}
                />
                <button onClick={addCustomConfig} className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"><Plus className="h-5 w-5" /></button>
              </div>

              <div className="space-y-4 flex-1 overflow-y-auto max-h-[280px] custom-scrollbar pr-2">
                {[...defaultItems, ...extraConfigItems].map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center"><item.icon className="h-4 w-4 text-blue-600" /></div>
                      <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2 relative h-8">
                      {isShop ? (
                        <div className="flex bg-slate-100 rounded-lg p-0.5 gap-0.5 border border-slate-200">
                          {[1, 0].map((val) => (
                            <button
                              key={val}
                              onClick={() => updateNestedField(`commercial.shopConfiguration.${item.id}`, val)}
                              className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                                (currentConfig?.[item.id] === val)
                                  ? "bg-white text-emerald-600 shadow-sm"
                                  : "text-slate-400 hover:text-slate-600"
                              }`}
                            >
                              {val === 1 ? (item.id === "parking" ? "Available" : "Yes") : (item.id === "parking" ? "Not Avail" : "No")}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <Input
                          type="number"
                          min="0"
                          className="h-8 w-16 text-center text-sm font-bold border-slate-200 focus-visible:ring-1"
                          value={currentConfig?.[item.id] || 0}
                          onChange={(e) => updateNestedField(`commercial.officeConfiguration.${item.id}`, parseInt(e.target.value) || 0)}
                        />
                      )}
                      {(extraConfigItems.some(ex => ex.id === item.id) || (isShop && defaultShopConfigItems.some(d => d.id === item.id))) && (
                        <button onClick={() => removeExtraConfig(item.id)} className={`absolute ${isShop ? '-right-7' : '-right-8'} h-7 w-7 bg-red-50 text-red-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity`}><X className="h-3 w-3" /></button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                Selected Amenities ({selectedAmenities.length})
              </h3>

              <div className="space-y-3 flex-1 overflow-y-auto max-h-[250px] pr-2 custom-scrollbar">
                {selectedAmenities.map((amenity: any) => (
                  <div key={amenity} className="flex items-center justify-between group animate-in fade-in slide-in-from-left-2">
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded bg-blue-100 flex items-center justify-center"><CheckCircle2 className="h-3 w-3 text-blue-600" /></div>
                      <span className="text-xs font-bold text-slate-700">{amenity}</span>
                    </div>
                    {!amenitiesList.includes(amenity) && (
                       <button onClick={() => toggleAmenity(amenity)} className="h-6 w-6 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-3 w-3" /></button>
                    )}
                  </div>
                ))}
              </div>

            </>
          )}
        </div>
      </div>
    </div>
  );
}
