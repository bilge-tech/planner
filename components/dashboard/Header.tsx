"use client";

import React, { useState, useRef, useEffect } from "react";
import { format, isToday, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from "date-fns";
import { tr } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

interface HeaderProps {
  currentDate: Date;
  onSelectDate: (date: Date) => void;
}

export default function Header({ currentDate, onSelectDate }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [calendarViewDate, setCalendarViewDate] = useState(currentDate);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const formattedDate = format(currentDate, "d MMMM yyyy, EEEE", { locale: tr });
  const isViewingToday = isToday(currentDate);

  const monthStart = startOfMonth(calendarViewDate);
  const monthEnd = endOfMonth(calendarViewDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayIndex = (monthStart.getDay() + 6) % 7; // Monday = 0

  const handlePickDate = (day: Date) => {
    onSelectDate(day);
    setIsOpen(false);
  };

  const handleResetToToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const today = new Date();
    onSelectDate(today);
    setCalendarViewDate(today);
  };

  return (
    <header className="relative w-full py-4 sm:py-6 md:py-8 flex flex-col items-center justify-center text-center">
      {/* Main Interactive Date Header */}
      <div className="relative inline-block" ref={popoverRef}>
        <button
          onClick={() => {
            setCalendarViewDate(currentDate);
            setIsOpen(!isOpen);
          }}
          className="group flex flex-col items-center cursor-pointer transition-all duration-300 focus:outline-none"
          title="Tarih seçmek için tıklayın"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <h1 className="font-serif-title text-xl sm:text-3xl md:text-4xl lg:text-5xl font-normal tracking-tight text-[#243336] group-hover:text-[#3D868E] transition-colors duration-200">
              {formattedDate}
            </h1>
            <span className="p-1 sm:p-1.5 rounded-full bg-[#EDF7F8] text-[#558D93] border border-[#D4EAEB] group-hover:bg-[#E0F2F4] group-hover:text-[#256066] transition-all">
              <CalendarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </span>
          </div>
        </button>

        {/* Return to Today pill if not today */}
        {!isViewingToday && (
          <div className="mt-2">
            <button
              onClick={handleResetToToday}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] rounded-full bg-[#FFFFFF] border border-[#D0E6E8] text-[#3E6F74] hover:bg-[#EDF7F8] shadow-2xs transition-all"
            >
              <RotateCcw className="w-3 h-3 text-[#4A9CA3]" />
              <span>Bugüne Dön</span>
            </button>
          </div>
        )}

        {/* Minimalist Aesthetic Date Picker Popover */}
        {isOpen && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-50 w-68 sm:w-76 p-4 bg-[#FFFFFF]/95 backdrop-blur-md rounded-2xl border border-[#CCE3E6] shadow-xl text-left animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E8F2F4]">
              <span className="font-serif-title text-base font-medium text-[#243336]">
                {format(calendarViewDate, "MMMM yyyy", { locale: tr })}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCalendarViewDate((prev) => subMonths(prev, 1));
                  }}
                  className="p-1 rounded-lg text-[#557F83] hover:bg-[#EDF7F8]"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCalendarViewDate((prev) => addMonths(prev, 1));
                  }}
                  className="p-1 rounded-lg text-[#557F83] hover:bg-[#EDF7F8]"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 text-center text-[10px] font-medium text-[#7D9EA1] mb-1">
              <span>Pt</span>
              <span>Sa</span>
              <span>Ça</span>
              <span>Pe</span>
              <span>Cu</span>
              <span>Ct</span>
              <span>Pz</span>
            </div>

            <div className="grid grid-cols-7 gap-0.5 text-center text-xs">
              {Array.from({ length: startDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="h-7" />
              ))}
              {daysInMonth.map((day) => {
                const isSelected = isSameDay(day, currentDate);
                const isCurrentDay = isToday(day);
                const isCurrentMonth = isSameMonth(day, calendarViewDate);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => handlePickDate(day)}
                    className={`h-7 w-7 mx-auto flex items-center justify-center rounded-full text-[11px] transition-all relative ${
                      isSelected
                        ? "bg-[#2A5E64] text-white font-medium shadow-xs"
                        : isCurrentDay
                        ? "bg-[#E6F5F6] text-[#25666D] font-semibold border border-[#99CED3]"
                        : isCurrentMonth
                        ? "text-[#324B4E] hover:bg-[#EDF7F8]"
                        : "text-[#B0C8CA]"
                    }`}
                  >
                    {format(day, "d")}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 mt-2 border-t border-[#E8F2F4] flex items-center justify-between">
              <button
                type="button"
                onClick={() => handlePickDate(new Date())}
                className="text-[11px] font-medium text-[#357B82]"
              >
                Bugün
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[11px] text-[#7A989B]"
              >
                Kapat
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
