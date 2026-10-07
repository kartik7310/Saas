import UnifiedAddPropertyForm from "@/components/AddPropertyForm/UnifiedAddPropertyForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Property | Link2Builder",
  description: "Add a new property listing to Link2Builder",
}

export default function AddPropertyPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="mx-auto max-w-[1420px]">
        {/* Header */}
        {/* <div className="mb-1 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-md border bg-white px-4 py-2 text-sm font-medium text-blue-600 shadow-sm transition-colors hover:bg-slate-50">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                ↓
              </span>
              Header <span className="text-xs">▼</span>
            </button>
            <button className="flex items-center gap-2 rounded-md border bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
              Biits <span className="text-xs">▼</span>
            </button>
          </div>
        </div> */}

        {/* Main Form Content */}
        <UnifiedAddPropertyForm />
      </div>
    </div>
  );
}