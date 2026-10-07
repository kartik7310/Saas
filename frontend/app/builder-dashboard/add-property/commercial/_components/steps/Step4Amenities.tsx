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
} from "lucide-react";

export default function Step4Amenities({ formData, setFormData }: any) {
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
