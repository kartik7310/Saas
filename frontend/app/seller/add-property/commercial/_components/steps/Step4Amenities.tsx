import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Users,
  Wifi,
  Shield,
  Car,
  Coffee,
  Wind,
  Zap,
  Flame,
  Video,
  UploadCloud,
  Plus,
  Loader2,
  X
} from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";

export default function Step4Amenities({ formData, setFormData }: any) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const amenityImages = formData?.amenityImages || [];

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
      
      setFormData((prev: any) => ({
        ...prev,
        amenityImages: [...(prev.amenityImages || []), ...newUrls]
      }));
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
    setFormData((prev: any) => ({
      ...prev,
      amenityImages: (prev.amenityImages || []).filter((img: string) => img !== url)
    }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData((prev: any) => {
      const amenities = prev.amenities || [];
      if (amenities.includes(amenity)) {
        return {
          ...prev,
          amenities: amenities.filter((a: string) => a !== amenity),
        };
      }
      return { ...prev, amenities: [...amenities, amenity] };
    });
  };

  const hasAmenity = (amenity: string) => {
    return (formData?.amenities || []).includes(amenity);
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
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3 border-b pb-4 mb-6">
        <div className="p-2 bg-emerald-100 rounded text-emerald-600">
          <Users className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Amenities</h2>
      </div>

      <div className="mb-8">
        <h3 className="text-sm font-bold text-slate-800 mb-4">Upload Amenity Images</h3>

        <div className="flex flex-wrap gap-4 items-center border border-slate-200 rounded-xl p-4 bg-slate-50">
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
            className="flex-1 min-w-full sm:min-w-[300px] flex flex-col items-center justify-center border-2 border-dashed border-blue-200 bg-white rounded-2xl p-6 hover:bg-blue-50 transition-colors cursor-pointer group"
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
              <div key={index} className="h-20 w-32 relative rounded-xl overflow-hidden border border-slate-100 bg-white flex-shrink-0 group/img">
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
              className="h-20 w-32 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white text-blue-600 font-bold text-xs hover:bg-slate-50 flex-shrink-0"
            >
              <Plus className="h-4 w-4 mb-1" />
              Add More
            </button>
          </div>
        </div>
      </div>

      <h3 className="text-sm font-bold text-slate-800 mb-4">Select Amenities</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {amenitiesList.map((amenity) => (
          <label
            key={amenity.id}
            className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-all ${
              hasAmenity(amenity.id)
                ? "border-blue-500 bg-blue-50 text-blue-800 shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <div className="relative flex items-center justify-center">
              <Checkbox
                id={amenity.id}
                checked={hasAmenity(amenity.id)}
                onCheckedChange={() => toggleAmenity(amenity.id)}
                className={`h-5 w-5 rounded border-2 ${hasAmenity(amenity.id) ? "border-blue-600 bg-blue-600" : "border-slate-300"}`}
              />
            </div>
            <amenity.icon
              className={`w-5 h-5 ${hasAmenity(amenity.id) ? "text-blue-600" : "text-slate-400"}`}
            />
            <span className="text-sm font-medium">{amenity.id}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
