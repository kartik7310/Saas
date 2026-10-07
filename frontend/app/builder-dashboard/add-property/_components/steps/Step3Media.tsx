import { useState, useRef } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

const propertyTypes = ["Apartment", "Villa", "Builder Floor"];
const bhkOptions = ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "4 BHK+"];
const commercialCategories = ["Office", "Shop"];
const officeTypes = ["Bare Shell", "Warm Shell", "Fully Furnished", "Co-working"];
const shopTypes = ["Retail Shop", "Showroom", "Food Outlet"];
const mediaTabs = ["Photos", "Video Tour", "Floor Plan", "360 View"];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full relative transition-colors cursor-pointer shrink-0 ${checked ? "bg-green-500" : "bg-gray-300"}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow-sm ${checked ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

function ChipGroup({ options, selected, onSelect }: { options: string[]; selected: string; onSelect: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5 md:gap-2">
      {options.map((opt) => {
        const active = selected === opt;
        return (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            className={`px-2 py-1 rounded-md border text-[10px] md:text-xs transition-all cursor-pointer ${active ? "border-blue-600 bg-blue-50 text-blue-600 font-semibold" : "border-gray-300 bg-white text-gray-700 font-normal hover:bg-gray-50"
              }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

export default function Step3Media({ formData, updateNestedField, errors = {}, isCommercial }: any) {
  const [activeMediaTab, setActiveMediaTab] = useState("Photos");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const photos = formData?.media?.photos || [];
  const floorPlans = formData?.media?.floorPlans || [];
  const videos = formData?.media?.videos || [];
  const virtualTour = formData?.media?.virtualTour || "";
  const uploadedVideo = formData?.media?.uploadedVideo || null;

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    const uploadFormData = new FormData();
    Array.from(files).forEach((file) => { uploadFormData.append("files", file); });
    try {
      const data = await api("/properties/upload", { method: "POST", body: uploadFormData });
      const newUrls = data.files.map((f: any) => f.url);
      if (activeMediaTab === "Photos") updateNestedField("media.photos", [...photos, ...newUrls]);
      else if (activeMediaTab === "Floor Plan") updateNestedField("media.floorPlans", [...floorPlans, ...newUrls]);
      toast.success(`${activeMediaTab} uploaded successfully`);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload files");
    } finally { setIsUploading(false); }
  };

  const handleVideoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.size > 20 * 1024 * 1024) {
      toast.error("Video must be under 20MB");
      return;
    }
    setIsUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append("files", file);
    try {
      const data = await api("/properties/upload", { method: "POST", body: uploadFormData });
      updateNestedField("media.uploadedVideo", data.files[0]); // { url, fileId }
      toast.success("Video uploaded successfully!");
    } catch (error) {
      console.error("Video upload error:", error);
      toast.error("Failed to upload video");
    } finally { setIsUploading(false); }
  };

  const removeMedia = (path: string, urlToRemove: string | null = null) => {
    if (path === "media.uploadedVideo") { updateNestedField(path, null); return; }
    const current = path === "media.photos" ? photos : floorPlans;
    updateNestedField(path, current.filter((url: string) => url !== urlToRemove));
  };

  const enableVC = formData?.liveMeeting?.vcEnabled ?? true;
  const setEnableVC = (v: boolean) => updateNestedField("liveMeeting.vcEnabled", v);

  const selectedPropertyType = formData?.residential?.propertyType || "Apartment";
  const setSelectedPropertyType = (v: string) => updateNestedField("residential.propertyType", v);

  const selectedBHK = formData?.residential?.bhkType 
    ? (formData.residential.bhkType === "4+" ? "4 BHK+" : `${formData.residential.bhkType} BHK`) 
    : "2 BHK";
  const setSelectedBHK = (v: string) => updateNestedField("residential.bhkType", v.replace(" BHK", ""));

  const selectedCategory = formData?.commercial?.propertyCategory || "Office";
  const setSelectedCategory = (v: string) => {
    updateNestedField("commercial.propertyCategory", v);
    updateNestedField("commercial.officeType", "");
    updateNestedField("commercial.shopType", "");
  };

  const selectedCommType = selectedCategory === "Office" 
    ? (formData?.commercial?.officeType || "") 
    : (formData?.commercial?.shopType || "");
  
  const setSelectedCommType = (v: string) => {
    if (selectedCategory === "Office") updateNestedField("commercial.officeType", v);
    else updateNestedField("commercial.shopType", v);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-4 items-start">

      {/* ═══════════════ LEFT MAIN COLUMN ═══════════════ */}
      <div className="flex flex-col gap-3 md:gap-4 order-2 lg:order-1">

        {/* Upload Project Media */}
        <div className="bg-white rounded-xl p-4 md:p-5 border border-slate-100 shadow-sm">
          <h2 className="text-sm md:text-base font-bold text-slate-900 mb-4 flex items-center justify-between">
            Upload Project Media
            {errors.photos && <span className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">{errors.photos}</span>}
          </h2>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-4 border-b border-slate-100 pb-3">
            {mediaTabs.map((tab) => (
              <button key={tab} onClick={() => setActiveMediaTab(tab)} className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs md:text-sm transition-all cursor-pointer
                ${activeMediaTab === tab ? "border-blue-600 bg-blue-50 text-blue-600 font-semibold" : "border-slate-200 bg-white text-slate-500 font-normal hover:bg-slate-50"}
              `}>
                {tab === "Photos" && (
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                )}
                {tab === "Video Tour" && (
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <rect x="2" y="7" width="15" height="10" rx="2" />
                    <polygon points="17 9 22 6 22 18 17 15" />
                  </svg>
                )}
                {tab === "Floor Plan" && (
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z" />
                  </svg>
                )}
                {tab === "360 View" && (
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20M12 2a15.3 15.3 0 010 20" />
                  </svg>
                )}
                {tab}
              </button>
            ))}
          </div>

          {/* Upload Area: Drop Zone + Photo Grid */}
          <div className="flex flex-col md:flex-row gap-4">
            {(activeMediaTab === "Photos" || activeMediaTab === "Floor Plan") ? (
              <>
                {/* Drop Zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    w-full md:w-[170px] flex-shrink-0 border-2 border-dashed border-blue-200 rounded-xl bg-blue-50/30
                    flex flex-col items-center justify-center gap-2 cursor-pointer p-6 transition-all hover:bg-blue-50
                    ${isUploading ? "opacity-60" : "opacity-100"}
                  `}
                >
                  <input
                    type="file" multiple ref={fileInputRef} className="hidden"
                    accept="image/*" onChange={(e) => handleFileUpload(e.target.files)}
                  />
                  {isUploading ? (
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg width="30" height="30" fill="none" viewBox="0 0 24 24" stroke="#3b82f6" strokeWidth={1.5}>
                      <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  )}
                  <div className="text-center">
                    <p className="text-xs font-semibold text-slate-700 m-0">
                      {isUploading ? "Uploading..." : `Add ${activeMediaTab}`}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold">
                      or <span className="text-blue-600">Browse</span>
                    </p>
                  </div>
                </div>

                {/* Photo Grid */}
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(activeMediaTab === "Photos" ? photos : floorPlans).map((url: string, i: number) => (
                    <div key={i} className="relative aspect-[4/3] group shadow-sm rounded-lg overflow-hidden border border-slate-100">
                      <img src={url} alt={`property ${i + 1}`} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      <button
                        onClick={(e) => { e.stopPropagation(); removeMedia(activeMediaTab === "Photos" ? "media.photos" : "media.floorPlans", url); }}
                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-white/90 backdrop-blur-sm border border-slate-100 rounded-full text-red-500 flex items-center justify-center cursor-pointer shadow-sm hover:bg-red-50"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-[4/3] border-1.5 border-dashed border-slate-200 bg-slate-50/50 rounded-lg flex flex-col items-center justify-center gap-1 text-blue-600 hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-2xl font-light">+</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Add More</span>
                  </button>
                </div>
              </>
            ) : activeMediaTab === "Video Tour" ? (
              /* ── Video Tour: file upload ABOVE the link paste ── */
              <div className="flex-1 space-y-4">

                {/* ── Section 1: File Upload (max 20 MB) ── */}
                <div className="rounded-xl border-2 border-dashed border-violet-200 bg-violet-50/30 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-bold text-slate-800">Upload Property Video</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Max file size: <span className="font-black text-violet-600">20 MB</span> &nbsp;·&nbsp; MP4, MOV, AVI etc.</p>
                    </div>
                    {uploadedVideo && (
                      <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        UPLOADED
                      </span>
                    )}
                  </div>

                  {!uploadedVideo ? (
                    /* Drop Zone */
                    <div
                      onClick={() => videoInputRef.current?.click()}
                      className={`relative w-full h-32 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer transition-all
                        ${isUploading
                          ? "border-violet-300 bg-violet-50 opacity-70 cursor-wait"
                          : "border-violet-200 bg-white hover:border-violet-400 hover:bg-violet-50/60"}
                      `}
                    >
                      <input
                        type="file"
                        accept="video/*"
                        ref={videoInputRef}
                        className="hidden"
                        onChange={(e) => handleVideoUpload(e.target.files)}
                      />
                      {isUploading ? (
                        <>
                          <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
                          <p className="text-xs font-semibold text-violet-600">Uploading video...</p>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
                            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#7c3aed" strokeWidth={2}>
                              <path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                            </svg>
                          </div>
                          <p className="text-xs font-semibold text-slate-700">Click to upload video</p>
                          <p className="text-[10px] text-slate-400">or drag & drop here</p>
                        </>
                      )}
                    </div>
                  ) : (
                    /* Preview Player */
                    <div className="relative rounded-xl overflow-hidden border border-violet-200 bg-black aspect-video shadow-lg">
                      <video
                        src={uploadedVideo.url}
                        className="w-full h-full"
                        controls
                      />
                      <button
                        onClick={() => removeMedia("media.uploadedVideo")}
                        title="Remove video"
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500/90 backdrop-blur-sm text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors cursor-pointer z-10 text-base font-bold"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>

                {/* ── Divider ── */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-slate-50 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Or paste a link
                    </span>
                  </div>
                </div>

                {/* ── Section 2: YouTube / Stream Link ── */}
                <div className="p-5 rounded-xl border border-slate-200 bg-white">
                  <p className="text-xs font-bold text-slate-600 mb-3 flex items-center gap-1.5">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="#ef4444">
                      <path d="M23.5 6.2a2.9 2.9 0 00-2-2c-1.8-.5-9-.5-9-.5s-7.2 0-9 .5a2.9 2.9 0 00-2 2A30 30 0 000 12a30 30 0 00.5 5.8 2.9 2.9 0 002 2c1.8.5 9 .5 9 .5s7.2 0 9-.5a2.9 2.9 0 002-2A30 30 0 0024 12a30 30 0 00-.5-5.8zM9.6 15.6V8.4l6.4 3.6-6.4 3.6z"/>
                    </svg>
                    YouTube / Video Link
                  </p>
                  <input
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:bg-white outline-none shadow-sm transition-all"
                    value={videos[0] || ""}
                    onChange={(e) => updateNestedField("media.videos", [e.target.value])}
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 p-6 border-1.5 border-dashed border-slate-200 rounded-xl bg-slate-50/30 text-center">
                <p className="text-sm text-slate-500 mb-3">Paste {activeMediaTab} Link</p>
                <input
                  placeholder="https://..."
                  className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none shadow-sm"
                  value={virtualTour}
                  onChange={(e) => updateNestedField("media.virtualTour", e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Basic Details + Location Details — adaptive grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

          {/* Basic Details */}
          <div className="bg-white rounded-xl p-4 md:p-5 border border-slate-100 shadow-sm transition-all hover:shadow-md">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 border-b border-slate-50 pb-2">
              {isCommercial ? "COMMERCIAL DETAILS" : "BASIC DETAILS"}
            </h2>
            <div className="space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider w-full lg:w-20 shrink-0">Project Name</label>
                <input
                  value={formData?.location?.projectName || ""}
                  onChange={(e) => updateNestedField("location.projectName", e.target.value)}
                  placeholder="e.g. Link2 Heights"
                  className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 outline-none focus:border-blue-500 transition-all font-medium"
                />
              </div>

              {isCommercial ? (
                <>
                  <div className="flex flex-col lg:flex-row lg:items-start gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider w-full lg:w-20 shrink-0 pt-2 text-wrap">Category</label>
                    <div className="flex-1">
                      <ChipGroup options={commercialCategories} selected={selectedCategory} onSelect={setSelectedCategory} />
                    </div>
                  </div>
                  <div className="flex flex-col lg:flex-row lg:items-start gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider w-full lg:w-20 shrink-0 pt-2">{selectedCategory} Type</label>
                    <div className="flex-1">
                      <ChipGroup 
                        options={selectedCategory === "Office" ? officeTypes : shopTypes} 
                        selected={selectedCommType} 
                        onSelect={setSelectedCommType} 
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col lg:flex-row lg:items-start gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider w-full lg:w-20 shrink-0 pt-2 text-wrap">Property Type</label>
                    <div className="flex-1">
                      <ChipGroup options={propertyTypes} selected={selectedPropertyType} onSelect={setSelectedPropertyType} />
                    </div>
                  </div>
                  <div className="flex flex-col lg:flex-row lg:items-start gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider w-full lg:w-20 shrink-0 pt-2">BHK</label>
                    <div className="flex-1">
                      <ChipGroup options={bhkOptions} selected={selectedBHK} onSelect={setSelectedBHK} />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Location Details */}
          <div className="bg-white rounded-xl p-4 md:p-5 border border-slate-100 shadow-sm transition-all hover:shadow-md">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 border-b border-slate-50 pb-2">LOCATION DETAILS</h2>
            <div className="space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider w-full lg:w-20 shrink-0">City</label>
                <div className="flex-1 h-9 px-3 flex items-center bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium overflow-hidden whitespace-nowrap overflow-ellipsis">
                  {formData?.location?.city || "Not Specified"}
                </div>
              </div>
              <div className="flex flex-col lg:flex-row lg:items-center gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider w-full lg:w-20 shrink-0">Locality</label>
                <div className="flex-1 h-9 px-3 flex items-center bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium overflow-hidden whitespace-nowrap overflow-ellipsis">
                  {formData?.location?.locality || "Not Specified"}
                </div>
              </div>
              <div className="flex flex-col lg:flex-row lg:items-center gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider w-full lg:w-20 shrink-0">Landmark</label>
                <div className="flex-1 h-9 px-3 flex items-center bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 font-medium overflow-hidden whitespace-nowrap overflow-ellipsis">
                  {formData?.location?.landmark || "Not Specified"}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ═══════════════ RIGHT SIDEBAR — order-1 on mobile to show first if important, OR order-last ═══════════════ */}
      <div className="flex flex-col gap-4 order-1 lg:order-2">

        {/* Live Meeting Setup */}
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">Live Meeting Setup</span>
          </div>

          {/* Enable VC */}
          <div className="flex items-center justify-between bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3 transition-all">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#2563eb" strokeWidth={2}>
                  <path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                </svg>
              </div>
              <span className="text-xs font-bold text-slate-700">Enable VC</span>
            </div>
            <Toggle checked={enableVC} onChange={setEnableVC} />
          </div>
        </div>

      </div>
    </div>
  );
}
