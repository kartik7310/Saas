// "use client";
// import Link from "next/link";
// import { useEffect, useState } from "react";
// import { api } from "@/lib/api";

// const districtImages: Record<string, string> = {
//   Mumbai: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=80&q=80&auto=format&fit=crop",
//   Delhi: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=80&q=80&auto=format&fit=crop",
//   Bangalore: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=80&q=80&auto=format&fit=crop",
//   Chennai: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=80&q=80&auto=format&fit=crop",
//   Kolkata: "https://images.unsplash.com/photo-1558431382-27e303142255?w=80&q=80&auto=format&fit=crop",
//   Ahmedabad: "https://images.unsplash.com/photo-1568454537842-d933259bb258?w=80&q=80&auto=format&fit=crop",
//   Jaipur: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=80&q=80&auto=format&fit=crop",
//   Goa: "https://images.unsplash.com/photo-1587922546307-776227941871?w=80&q=80&auto=format&fit=crop",
// };

// const DEFAULT_IMG = "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=80&q=80&auto=format&fit=crop";

// export default function CitiesSection() {
//   const [activeDistricts, setActiveDistricts] = useState<{ district: string, count: number }[]>([]);

//   useEffect(() => {
//     async function fetchCounts() {
//       try {
//         const data = await api("/properties/city-counts");
//         if (Array.isArray(data)) {
//           const validDistricts = data.filter((item: any) => item.count > 0 && !!item.district);
//           setActiveDistricts(validDistricts);
//         }
//       } catch (err) {
//         console.error("Failed to fetch district counts:", err);
//       }
//     }
//     fetchCounts();
//   }, []);

//   if (activeDistricts.length === 0) return null;

//   const count = activeDistricts.length;
//   let gridLayoutClass = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
//   let maxWClass = "max-w-full";

//   if (count === 1) {
//     gridLayoutClass = "grid-cols-1";
//     maxWClass = "max-w-sm mx-auto";
//   } else if (count === 2) {
//     gridLayoutClass = "grid-cols-1 sm:grid-cols-2";
//     maxWClass = "max-w-2xl mx-auto";
//   } else if (count === 3) {
//     gridLayoutClass = "grid-cols-1 sm:grid-cols-3";
//     maxWClass = "max-w-5xl mx-auto";
//   }

//   return (
//     <section className="px-6 md:px-16 py-16 bg-white border-b border-gray-100">
//       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-6">
//         <div>
//           <h2 className="text-2xl md:text-3xl font-black text-gray-900">
//             Find Properties in These Districts
//           </h2>
//           <p className="text-gray-400 text-sm mt-1">
//             Explore top real estate destinations across India.
//           </p>
//         </div>
//         <Link
//           href="/properties"
//           className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-full text-sm transition-colors text-center w-full sm:w-auto shadow-md"
//         >
//           See All Properties
//         </Link>
//       </div>

//       <div className={`grid gap-4 ${gridLayoutClass} ${maxWClass}`}>
//         {activeDistricts.map(({ district, count }) => (
//           <Link
//             key={district}
//             href={`/properties?district=${encodeURIComponent(district)}`}
//             className="flex items-center gap-3 bg-gray-50 hover:bg-purple-50 border border-gray-100 hover:border-purple-200 rounded-2xl p-4 transition-all group shadow-sm hover:shadow"
//           >
//             <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
//               <img
//                 src={districtImages[district] || DEFAULT_IMG}
//                 alt={district}
//                 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
//               />
//             </div>
//             <div className="truncate">
//               <p className="font-bold text-gray-800 text-sm truncate">{district}</p>
//               <p className="text-purple-500 text-xs font-medium">
//                 {count} {count === 1 ? "Property" : "Properties"}
//               </p>
//             </div>
//           </Link>
//         ))}
//       </div>
//     </section>
//   );
// }
