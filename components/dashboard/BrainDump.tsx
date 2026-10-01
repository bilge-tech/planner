"use client";

import React, { useRef } from "react";

interface BrainDumpProps {
  value: string;
  onChange: (value: string) => void;
  selectedDateStr?: string;
}

export default function BrainDump({
  value,
  onChange,
}: BrainDumpProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleContainerClick = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div
      onClick={handleContainerClick}
      className="relative w-full rounded-2xl p-4 sm:p-5 bg-[#EAF3EB] border border-[#CADBCB] shadow-xs cursor-text transition-all duration-300 hover:border-[#B4CEB7] hover:shadow-sm overflow-hidden min-h-[160px] sm:min-h-[180px] flex flex-col justify-between"
      style={{
        backgroundColor: "#EAF3EB",
        borderColor: "#CADBCB",
      }}
    >
      {/* Pure text input area in front */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Düşüncelerini, anlık notlarını buraya serbestçe yazabilirsin..."
        className="w-full h-full min-h-[120px] sm:min-h-[140px] bg-transparent outline-none resize-none text-[#253D2F] placeholder-[#7F9C87] text-xs sm:text-sm leading-relaxed font-sans selection:bg-[#C2DFC6] selection:text-[#183321] relative z-10"
        spellCheck={false}
      />

      {/* Arka planda büyük ve son derece estetik Brain Dump yazısı */}
      <div className="absolute right-3 sm:right-5 -bottom-1 sm:bottom-0 select-none pointer-events-none z-0">
        <span className="font-serif-title italic text-4xl sm:text-5xl md:text-6xl text-[#527763]/25 tracking-wide select-none leading-none block">
          Brain Dump
        </span>
      </div>
    </div>
  );
}
