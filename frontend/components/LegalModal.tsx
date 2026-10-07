"use client";
import { X } from "lucide-react";

interface Section {
  id: number;
  heading: string;
  content?: string;
  list?: string[];
  note?: string;
  subsections?: {
    heading: string;
    list: string[];
  }[];
}

interface LegalData {
  title: string;
  sections: Section[];
}

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: LegalData;
}

export default function LegalModal({ isOpen, onClose, data }: LegalModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}} />
      <div 
        className="relative bg-white w-full max-w-3xl max-h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <img 
              src="/images/linktwobuilderlogo.jpeg" 
              alt="Link2Builder" 
              className="h-10 md:h-12 w-auto object-contain"
            />
            <div className="h-8 w-px bg-gray-200 hidden sm:block" />
            <h2 className="text-xl font-bold text-gray-900 hidden sm:block">
              {data.title}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-8 custom-scrollbar">
          <div className="sm:hidden">
             <h2 className="text-2xl font-black text-gray-900 mb-2">
                {data.title}
             </h2>
             <div className="h-1 w-20 bg-purple-600 rounded-full mb-6" />
          </div>

          {data.sections.map((section) => (
            <div key={section.id} className="space-y-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                <span className="text-purple-600">#</span>
                {section.heading}
              </h3>
              
              {section.content && (
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                  {section.content}
                </p>
              )}

              {section.list && (
                <ul className="space-y-2 list-none">
                  {section.list.map((item, i) => (
                    <li key={i} className="flex gap-3 text-gray-600 text-sm md:text-base">
                      <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple-400 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {section.subsections && section.subsections.map((sub, idx) => (
                <div key={idx} className="pl-6 space-y-2 mt-4">
                  <h4 className="font-bold text-gray-800 text-sm md:text-base">{sub.heading}</h4>
                  <ul className="space-y-1 list-none">
                    {sub.list.map((item, i) => (
                      <li key={i} className="flex gap-3 text-gray-500 text-sm md:text-base">
                        <div className="mt-2 h-1 w-1 rounded-full bg-gray-300 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {section.note && (
                <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded-r-xl mt-4">
                  <p className="text-sm font-semibold text-purple-900 italic">
                    {section.note}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-2.5 rounded-full shadow-lg shadow-purple-200 transition-all hover:scale-105 active:scale-95"
          >
            Got it
          </button>
        </div>
      </div>

      {/* Backdrop click close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
}
