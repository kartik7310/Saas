// "use client";
// import React, { useState } from "react";
// import { Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Zap, Globe, Loader2 } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { useAuth } from "@/lib/AuthContext";
// import { api } from "@/lib/api";
// import { toast } from "sonner";

// declare global {
//   interface Window {
//     Razorpay: any;
//   }
// }

// const SubscriptionCard = () => {
//   const { user } = useAuth();
//   const [isProcessing, setIsProcessing] = useState(false);

//   const loadRazorpayScript = () => {
//     return new Promise((resolve) => {
//       const script = document.createElement("script");
//       script.src = "https://checkout.razorpay.com/v1/checkout.js";
//       script.onload = () => resolve(true);
//       script.onerror = () => resolve(false);
//       document.body.appendChild(script);
//     });
//   };

//   const handleUpgrade = async () => {
//     try {
//       if (!user) {
//         toast.error("Please login to upgrade your membership");
//         return;
//       }

//       setIsProcessing(true);

//       // 1. Load Razorpay Script
//       const isLoaded = await loadRazorpayScript();
//       if (!isLoaded) {
//         toast.error("Failed to load Razorpay SDK. Check your internet connection.");
//         return;
//       }

//       // 2. Create Subscription on Backend
//       const { subscriptionId } = await api("/subscriptions/create", {
//         method: "POST",
//       });

//       // 3. Open Razorpay Checkout
//       const options = {
//         key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
//         subscription_id: subscriptionId,
//         name: "LinkToBuilder",
//         description: "Premium SaaS Membership",
//         image: "/logo.png",
//         handler: function (response: any) {
//           toast.success("Payment Successful! Your membership is being activated.");
//           setTimeout(() => {
//             window.location.reload();
//           }, 3000);
//         },
//         prefill: {
//           name: user.name,
//           email: user.email,
//           contact: user.phone || "",
//         },
//         recurring: 1,
//         theme: {
//           color: "#4f46e5",
//         },
//         modal: {
//           ondismiss: function() {
//             setIsProcessing(false);
//           },
//           handle_back: true,
//           confirm_close: true
//         }
//       };

//       const rzp = new window.Razorpay(options);
//       rzp.open();

//     } catch (error: any) {
//       console.error("Subscription Error:", error);
//       toast.error(error.message || "Something went wrong. Please try again.");
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   return (
//     <div className="mt-12 group">
//       <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 border border-slate-800 shadow-2xl transition-all duration-500 hover:shadow-indigo-500/10">
//         {/* Background Decorative Elements */}
//         <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px] group-hover:bg-indigo-600/30 transition-colors duration-700" />
//         <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] group-hover:bg-blue-600/20 transition-colors duration-700" />

//         <div className="relative p-6 md:p-12 flex flex-col lg:flex-row items-center lg:items-center justify-between gap-8 lg:gap-12">
//           {/* Content side */}
//           <div className="flex-1 space-y-6">
//             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
//               <Sparkles className="w-4 h-4 text-indigo-400" />
//               <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Membership Upgrade</span>
//             </div>

//             <div className="space-y-3">
//               <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-[1] sm:leading-[0.9]">
//                 Unlock the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">Premium</span> Experience
//               </h2>
//               <p className="text-slate-400 text-lg font-medium max-w-xl">
//                 Scale your property business with advanced tools, priority rankings, and exclusive meeting features designed for power users.
//               </p>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {[
//                 { icon: Zap, text: "Unlimited Video Meetings", color: "text-amber-400" },
//                 { icon: ShieldCheck, text: "Priority Support 24/7", color: "text-emerald-400" },
//                 { icon: Globe, text: "Global Property Visibility", color: "text-blue-400" },
//                 { icon: CheckCircle2, text: "Verified Badge Status", color: "text-indigo-400" },
//               ].map((item, i) => (
//                 <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-2xl p-4 hover:bg-white/10 transition-colors group/item">
//                   <div className={`p-2 rounded-xl bg-slate-800 border border-slate-700 group-hover/item:scale-110 transition-transform`}>
//                     <item.icon className={`w-4 h-4 ${item.color}`} />
//                   </div>
//                   <span className="text-sm font-bold text-slate-200">{item.text}</span>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* CTA Side */}
//           <div className="w-full lg:w-auto shrink-0 flex justify-center">
//             <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-sm flex flex-col items-center text-center space-y-6 w-full max-w-[360px]">
//               <div className="space-y-1">
//                 <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Starting from</p>
//                 <div className="flex items-baseline gap-1">
//                   <span className="text-4xl font-black text-white tracking-tighter">₹199</span>
//                   <span className="text-slate-500 font-bold text-sm">/month</span>
//                 </div>
//               </div>

//               <div className="w-full space-y-3">
//                 <Button
//                   onClick={handleUpgrade}
//                   disabled={isProcessing}
//                   className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group/btn"
//                 >
//                   {isProcessing ? (
//                     <>
//                       <Loader2 className="w-5 h-5 animate-spin" />
//                       Processing...
//                     </>
//                   ) : (
//                     <>
//                       Upgrade Membership
//                       <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
//                     </>
//                   )}
//                 </Button>
//                 <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Secured by Razorpay</p>
//               </div>

//               <div className="pt-6 border-t border-white/5 w-full">
//                 <div className="flex justify-center -space-x-2">
//                   {[1, 2, 3, 4].map((i) => (
//                     <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden">
//                       <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="user" className="w-full h-full object-cover" />
//                     </div>
//                   ))}
//                   <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-indigo-600 flex items-center justify-center text-[8px] font-black text-white">
//                     +2k
//                   </div>
//                 </div>
//                 <p className="text-slate-400 text-[9px] font-bold mt-3 uppercase tracking-widest">Joined by 2,000+ Professionals</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SubscriptionCard;
