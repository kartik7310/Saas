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
        <h2 className="text-2xl font-bold text-slate-800 -mt-4">Add New Property</h2>
        <UnifiedAddPropertyForm />
      </div>
    </div>
  );
}