// import { MapPin, Phone, Mail, User, Info, CheckCircle2, Search, FileText, ChevronDown } from "lucide-react";

// export default function Sidebar({ currentStep, formData }: any) {
//   return (
//     <div className="space-y-3">
//       {/* Live Meeting Setup (Section 1 in Screenshot) */}
//       <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="text-sm font-black text-slate-800">Live Meeting Setup</h3>
//           <div className="h-5 w-10 bg-emerald-500 rounded-full flex items-center px-1">
//             <div className="h-3 w-3 bg-white rounded-full ml-auto" />
//           </div>
//         </div>

//         <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-100 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="h-8 w-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center">
//               <FileText className="h-4 w-4 text-emerald-600" />
//             </div>
//             <span className="text-xs font-bold text-slate-700">Enable VC</span>
//           </div>
//           <div className="h-5 w-10 bg-emerald-500 rounded-full flex items-center px-1">
//             <div className="h-3 w-3 bg-white rounded-full ml-auto" />
//           </div>
//         </div>

//         <div className="space-y-4">
//           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
//             <FileText className="h-3 w-3" />
//             Available Slots
//           </p>
//           <div className="flex gap-2">
//             {["Today", "Tomorrow", "Custom"].map((slot, i) => (
//               <button key={slot} className={`flex-1 h-9 rounded-lg text-[10px] font-black uppercase border transition-all ${i === 0 ? 'bg-white border-slate-200 text-slate-700 shadow-sm' : 'bg-transparent border-slate-100 text-slate-400'}`}>
//                 {slot}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Sales Manager Section (Section 2 in Screenshot) */}
//       <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
//         <div className="flex items-center gap-2 mb-4">
//           <FileText className="h-3 w-3 text-slate-400" />
//           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-tight">Sales Manager</p>
//         </div>

//         <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white group cursor-pointer hover:border-blue-200 transition-colors">
//           <div className="flex items-center gap-3">
//             <img
//               src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=80&h=80"
//               alt="Manager"
//               className="h-8 w-8 rounded-lg object-cover border-2 border-white shadow-sm"
//             />
//             <span className="text-sm font-black text-slate-800">Amit Sharma</span>
//           </div>
//           <ChevronDown className="h-3 w-3 text-slate-400" />
//         </div>
//       </div>

//       {/* Action Buttons (Section 3 in Screenshot) */}
//       <div className="space-y-3">
//         <button className="w-full h-12 rounded-xl bg-blue-600 text-white font-black text-xs hover:bg-blue-700 shadow-md shadow-blue-100 transition-all flex items-center justify-center gap-2">
//           <Search className="h-4 w-4" />
//           Book Live VC
//         </button>
//         <button className="w-full h-12 rounded-xl border border-slate-200 bg-white text-slate-700 font-black text-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
//           <FileText className="h-4 w-4 text-slate-400" />
//           Schedule Site Visit
//         </button>
//       </div>

//       {/* Hidden Map for Step 3 - Optional/Keep if needed but hidden for now to match screenshot exactly */}
//       {/* 
//       <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
//         <h3 className="mb-4 text-sm font-black text-slate-800">Location Map</h3>
//         <div className="relative mb-4 aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
//            ... map ...
//         </div>
//       </div>
//       */}
//     </div>
//   );
// }
