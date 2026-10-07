import { useState, useRef } from "react";
import { UploadCloud, Plus, Search, CheckCircle2, Loader2, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { api } from "@/lib/api";

const allAmenities = [
  "Green Space", "Gym", "Swimming Pool", "Kids Play Area", "Lift", "Club House",
  "Garden", "Security Guard", "Parking Lot", "Rain Water Harvesting", "Sports Facilities",
  "Community Hall", "24 Hrs Backup Electricity", "Senior Citizen Area", "Car Wash Area"
];

export default function Step4Amenities({ formData, updateNestedField }: any) {
  const selectedAmenities = formData?.residential?.amenities || [];
  const amenityImages = formData?.residential?.amenityImages || [];
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleAmenity = (amenity: string) => {
    const updated = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter((a: any) => a !== amenity)
      : [...selectedAmenities, amenity];
    updateNestedField("residential.amenities", updated);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadToast = toast.loading("Uploading amenity images...");

    try {
      const uploadFormData = new FormData();
      Array.from(files).forEach((file) => {
        uploadFormData.append("files", file);
      });
      const data = await api("/properties/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const newUrls = data.files.map((f: any) => f.url);
      
      updateNestedField("residential.amenityImages", [...amenityImages, ...newUrls]);
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
    updateNestedField("residential.amenityImages", amenityImages.filter((img: string) => img !== url));
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Upload Amenity Images */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Upload Amenity Images</h2>

        <div className="flex flex-wrap gap-4 items-center">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            multiple 
            accept="image/*" 
            className="hidden" 
          />
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 min-w-full sm:min-w-[300px] flex flex-col items-center justify-center border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-2xl p-6 hover:bg-blue-50/50 transition-colors cursor-pointer group"
          >
            {isUploading ? (
              <Loader2 className="h-7 w-7 text-blue-600 animate-spin mb-2" />
            ) : (
              <UploadCloud className="h-7 w-7 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
            )}
            <p className="text-sm font-bold text-blue-700">
              {isUploading ? "Uploading..." : "Drag & Drop Amenity Images"}
            </p>
            <p className="text-[11px] text-blue-500">or Browse Files</p>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 flex-1">
            {amenityImages.map((url: string, index: number) => (
              <div key={index} className="h-20 w-32 relative rounded-xl overflow-hidden border border-slate-100 bg-slate-50 flex-shrink-0 group/img">
                <img
                  src={url}
                  alt="Amenity"
                  className="w-full h-full object-cover"
                />
                <button 
                  onClick={() => removeImage(url)}
                  className="absolute top-1 right-1 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center scale-0 group-hover/img:scale-100 transition-transform"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="h-20 w-32 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-blue-600 font-bold text-xs hover:bg-slate-100 flex-shrink-0"
            >
              <Plus className="h-4 w-4 mb-1" />
              Add More
            </button>
          </div>
        </div>
      </div>

      {/* Amenities Selection & Summary Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Selection Area */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-4 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800">Amenities Provided *</h2>
            <button className="text-[11px] font-bold text-blue-600 flex items-center gap-1 hover:underline">
              <Search className="h-3 w-3" /> All setters ?
            </button>
          </div>

          <div className="relative mb-6">
            <Input
              placeholder="Filter by keyword"
              className="h-10 pl-4 border-slate-100 bg-slate-50/50 focus:bg-white transition-all text-sm"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-2">
            {allAmenities.map((amenity) => (
              <div key={amenity} className="flex items-center space-x-2 group cursor-pointer" onClick={() => toggleAmenity(amenity)}>
                <input
                  type="checkbox"
                  id={amenity}
                  checked={selectedAmenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <Label
                  htmlFor={amenity}
                  className={`text-sm cursor-pointer transition-colors ${selectedAmenities.includes(amenity) ? 'text-blue-700 font-bold' : 'text-slate-500 font-medium group-hover:text-slate-700'}`}
                >
                  {amenity}
                </Label>
              </div>
            ))}
          </div>

          <div className="mt-2 pt-3 border-t border-slate-100">
            <textarea
              rows={2}
              placeholder="Description of Amenities..."
              className="w-full rounded-xl border border-slate-100 bg-slate-50/50 p-2 text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              value={formData?.residential?.amenitiesDescription || ""}
              onChange={(e) => updateNestedField("residential.amenitiesDescription", e.target.value)}
            />
          </div>
        </div>

        {/* Summary Area */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/30 p-4 md:p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
            Amenities Provided
          </h3>

          <div className="space-y-3">
            {selectedAmenities.map((amenity: any) => (
              <div key={amenity} className="flex items-center justify-between animate-in fade-in slide-in-from-left-2">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded bg-blue-100 flex items-center justify-center">
                    <CheckCircle2 className="h-3 w-3 text-blue-600" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">{amenity}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between p-3 rounded-xl border border-dashed border-slate-200 bg-white">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Description of Amenities...</span>
              <Plus className="h-3 w-3 text-slate-300" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
