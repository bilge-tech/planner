"use client";

import React, { useRef } from "react";
import { Camera, Sparkles } from "lucide-react";
import { MemoryBoxData } from "@/types";

import { format } from "date-fns";

interface PolaroidMemoryBoxProps {
  memoryData?: MemoryBoxData;
  selectedDate: Date;
  onUpdateMemory: (data: MemoryBoxData) => void;
}

export default function PolaroidMemoryBox({
  memoryData,
  selectedDate,
  onUpdateMemory,
}: PolaroidMemoryBoxProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dateStr = format(selectedDate, "yyyy-MM-dd");

  const currentImage =
    memoryData?.imageUrl ||
    "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 800;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, w, h);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.82);
          onUpdateMemory({
            date: dateStr,
            imageUrl: compressedDataUrl,
          });
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative flex items-center justify-center py-2 sm:py-3 w-full select-none">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Decorative Washi Tape Strip with soft turquoise aqua frosted tone */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 sm:w-20 h-4 sm:h-5 bg-[#C5E4E6]/85 backdrop-blur-xs border border-[#AFDBDF] shadow-2xs rotate-[-2deg] z-20 pointer-events-none rounded-xs" />

      {/* Pure Polaroid Frame without any outer card or bottom text */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="group relative cursor-pointer bg-[#FFFFFF] p-2 sm:p-2.5 pb-5 sm:pb-6 rounded-md shadow-md hover:shadow-xl transition-all duration-300 transform -rotate-6 hover:-rotate-2 hover:scale-105 border border-[#D5E8EA] w-[160px] sm:w-[200px] md:w-[220px]"
        title="Fotoğrafı yüklemek veya değiştirmek için tıklayın"
      >
        {/* Photo Container */}
        <div className="relative aspect-square w-full bg-[#F0F6F7] rounded-xs overflow-hidden border border-[#E0EEEF] group/photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentImage}
            alt="Anı"
            className="w-full h-full object-cover transition-transform duration-500 group-hover/photo:scale-105 filter brightness-[0.98] contrast-[1.03]"
          />

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/35 opacity-0 group-hover/photo:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white gap-1">
            <Camera className="w-5 h-5 text-white" />
            <span className="text-[10px] font-medium tracking-wide">Değiştir</span>
          </div>

          {/* Corner badge */}
          <div className="absolute top-1.5 right-1.5 p-1 rounded-full bg-[#2A5E64]/40 backdrop-blur-xs text-white">
            <Sparkles className="w-2.5 h-2.5 text-[#A5E7EC]" />
          </div>
        </div>
      </div>
    </div>
  );
}
