"use client";

import React, { useState } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  parseISO,
} from "date-fns";
import { tr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, X, Tag, Bell, Trash2 } from "lucide-react";
import { CalendarEvent } from "@/types";

interface CalendarViewProps {
  events: CalendarEvent[];
  selectedDate: Date;
  onAddEvent: (event: Omit<CalendarEvent, "id">) => void;
  onDeleteEvent?: (id: string) => void;
}

const PRESET_COLORS = [
  { name: "Turquoise", hex: "#489DA5" },
  { name: "Sea Glass", hex: "#68B2A0" },
  { name: "Ocean Blue", hex: "#468189" },
  { name: "Sky", hex: "#62929E" },
  { name: "Coral", hex: "#C77D74" },
];

export default function CalendarView({
  events,
  selectedDate,
  onAddEvent,
  onDeleteEvent,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activePopupData, setActivePopupData] = useState<{ day: Date; events: CalendarEvent[] } | null>(null);

  // New event form state
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventNotes, setNewEventNotes] = useState("");
  const [newEventDate, setNewEventDate] = useState(format(selectedDate, "yyyy-MM-dd"));
  const [newEventColor, setNewEventColor] = useState(PRESET_COLORS[0].hex);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayIndex = (monthStart.getDay() + 6) % 7; // Monday = 0

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const getEventsForDay = (day: Date) => {
    return events.filter((ev) => {
      try {
        const evDate = typeof ev.date === "string" ? parseISO(ev.date) : ev.date;
        return isSameDay(evDate, day);
      } catch {
        return false;
      }
    });
  };

  const handleDayClick = (day: Date) => {
    const dayEvents = getEventsForDay(day);
    if (dayEvents.length > 0) {
      setActivePopupData({ day, events: dayEvents });
    }
  };

  const handleSubmitNewEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    onAddEvent({
      title: newEventTitle.trim(),
      notes: newEventNotes.trim() || undefined,
      date: newEventDate,
      color: newEventColor,
    });

    setNewEventTitle("");
    setNewEventNotes("");
    setIsAddModalOpen(false);
  };

  const handleDeleteFromPopup = (id: string) => {
    if (onDeleteEvent) {
      onDeleteEvent(id);
    }
    if (activePopupData) {
      const remaining = activePopupData.events.filter((e) => e.id !== id);
      if (remaining.length === 0) {
        setActivePopupData(null);
      } else {
        setActivePopupData({ ...activePopupData, events: remaining });
      }
    }
  };

  // 6 spiral binding loops along the top
  const spiralCount = 6;

  return (
    <div className="relative pt-3 w-full">
      {/* Authentic Desk Calendar Spiral Rings at Top Edge */}
      <div className="absolute top-0 left-0 right-0 flex justify-evenly px-4 z-20 pointer-events-none">
        {Array.from({ length: spiralCount }).map((_, i) => (
          <div key={`spiral-${i}`} className="flex flex-col items-center">
            {/* Metallic Spiral Wire Loop */}
            <div className="w-2 sm:w-2.5 h-4 sm:h-5 rounded-full bg-gradient-to-r from-[#9EB9BC] via-[#E6F3F4] to-[#7A9EA1] border border-[#6B8E92] shadow-xs transform -rotate-12" />
            {/* Punch Hole */}
            <div className="w-1.5 h-1.5 rounded-full bg-[#344C4E]/70 -mt-1 shadow-inner" />
          </div>
        ))}
      </div>

      {/* Desk Calendar Body: Sharp crisp rectangle */}
      <div className="relative bg-[#FFFFFF] border-2 border-[#BCD8DB] shadow-md w-full pt-4 sm:pt-5 p-3 sm:p-4 text-[#243336]">
        {/* Top Header Strip inside calendar */}
        <div className="flex items-center justify-between gap-1 pb-2 mb-2 border-b-2 border-[#D6EAEC]">
          <h2 className="font-serif-title text-base sm:text-lg font-semibold text-[#1F4347] tracking-wide uppercase">
            {format(currentMonth, "MMMM yyyy", { locale: tr })}
          </h2>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => {
                setNewEventDate(format(selectedDate, "yyyy-MM-dd"));
                setIsAddModalOpen(true);
              }}
              className="p-1 text-[#3D7F86] hover:bg-[#E8F4F5] transition-colors cursor-pointer"
              title="Yeni Anımsatıcı Ekle"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center border border-[#BCD8DB] bg-[#F4FAFA]">
              <button
                onClick={handlePrevMonth}
                className="p-0.5 text-[#4D7B80] hover:bg-[#E2EFF1] cursor-pointer"
                aria-label="Önceki Ay"
              >
                <ChevronLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-0.5 text-[#4D7B80] hover:bg-[#E2EFF1] cursor-pointer"
                aria-label="Sonraki Ay"
              >
                <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Weekday Row */}
        <div className="grid grid-cols-7 text-center text-[10px] sm:text-[11px] font-semibold text-[#5B888D] mb-1.5 uppercase tracking-wider border-b border-[#EAF3F4] pb-1">
          <span>Pt</span>
          <span>Sa</span>
          <span>Ça</span>
          <span>Pe</span>
          <span>Cu</span>
          <span>Ct</span>
          <span>Pz</span>
        </div>

        {/* Days Grid - Sharp desk calendar cells */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {Array.from({ length: startDayIndex }).map((_, i) => (
            <div key={`pad-${i}`} className="h-6 sm:h-7" />
          ))}

          {daysInMonth.map((day) => {
            const isTodayDate = isToday(day);
            const isSelected = isSameDay(day, selectedDate);
            const dayEvents = getEventsForDay(day);
            const hasEvents = dayEvents.length > 0;

            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => handleDayClick(day)}
                className={`relative h-6 sm:h-7 w-full flex flex-col items-center justify-center text-[10px] sm:text-[11px] transition-all p-0 border ${
                  isSelected
                    ? "bg-[#2A5E64] text-white font-semibold border-[#2A5E64] shadow-xs"
                    : isTodayDate
                    ? "bg-[#E6F5F6] text-[#1E565C] font-bold border-[#7CC0C6]"
                    : hasEvents
                    ? "border-[#BFE0E3] bg-[#F7FCFC] text-[#1E4549] font-medium hover:bg-[#EDF7F8] cursor-pointer"
                    : "border-transparent text-[#3A5659] hover:bg-[#F2F8F9] cursor-default"
                }`}
              >
                <span className="leading-none">{format(day, "d")}</span>

                {/* Dot for reminders */}
                {hasEvents && (
                  <span
                    className="w-1.5 h-1.5 rounded-full mt-0.5"
                    style={{
                      backgroundColor: isSelected
                        ? "#A5E7EC"
                        : dayEvents[0]?.color || "#3F8890",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reminder Popup Modal */}
      {activePopupData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setActivePopupData(null)}
        >
          <div
            className="bg-[#FFFFFF] border-2 border-[#94C6CB] p-4 sm:p-5 w-full max-w-xs shadow-2xl text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#DCEFF1] mb-3">
              <div className="flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-[#3F8890]" />
                <h3 className="font-serif-title text-base sm:text-lg font-medium text-[#243336]">
                  {format(activePopupData.day, "d MMMM yyyy", { locale: tr })}
                </h3>
              </div>
              <button
                onClick={() => setActivePopupData(null)}
                className="p-1 text-[#7B9A9D] hover:text-[#243336] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5 mb-3">
              {activePopupData.events.map((ev) => (
                <div
                  key={ev.id}
                  className="p-2 border border-[#D5E8EA] bg-[#F7FCFC] text-xs text-[#243336] flex items-start justify-between gap-2"
                >
                  <div className="flex items-start gap-2">
                    <span
                      className="w-2 h-2 rounded-full mt-1 shrink-0"
                      style={{ backgroundColor: ev.color || "#489DA5" }}
                    />
                    <div>
                      <p className="font-medium text-[#243336] text-xs">{ev.title}</p>
                      {ev.notes && (
                        <p className="text-[11px] text-[#638487] mt-0.5 leading-snug">
                          {ev.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {onDeleteEvent && (
                    <button
                      onClick={() => handleDeleteFromPopup(ev.id)}
                      className="text-[#96B4B7] hover:text-[#D9534F] p-0.5 cursor-pointer shrink-0"
                      title="Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#E8F2F4] flex justify-end">
              <button
                type="button"
                onClick={() => setActivePopupData(null)}
                className="px-3 py-1 text-xs font-medium bg-[#2A5E64] text-white hover:bg-[#1F464A] transition-colors cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-xs">
          <div className="bg-[#FFFFFF] border-2 border-[#94C6CB] p-4 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8F2F4] mb-3">
              <div className="flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-[#3F8890]" />
                <h3 className="font-serif-title text-base font-medium text-[#243336]">
                  Yeni Anımsatıcı
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-[#7B9A9D] hover:text-[#243336]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewEvent} className="space-y-2.5 text-xs">
              <div>
                <label className="block text-[#476C70] font-medium mb-1">Başlık</label>
                <input
                  type="text"
                  required
                  placeholder="Etkinlik..."
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#B8D7DA] bg-[#F7FCFC] text-[#243336] text-xs focus:outline-none focus:border-[#489DA5]"
                />
              </div>

              <div>
                <label className="block text-[#476C70] font-medium mb-1">Tarih</label>
                <input
                  type="date"
                  required
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#B8D7DA] bg-[#F7FCFC] text-[#243336] text-xs focus:outline-none focus:border-[#489DA5]"
                />
              </div>

              <div>
                <label className="block text-[#476C70] font-medium mb-1">Not (Opsiyonel)</label>
                <textarea
                  rows={2}
                  value={newEventNotes}
                  onChange={(e) => setNewEventNotes(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#B8D7DA] bg-[#F7FCFC] text-[#243336] text-xs focus:outline-none focus:border-[#489DA5] resize-none"
                />
              </div>

              <div>
                <label className="block text-[#476C70] font-medium mb-1">Renk</label>
                <div className="flex items-center gap-1.5">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => setNewEventColor(color.hex)}
                      className={`w-4 h-4 rounded-full transition-transform ${
                        newEventColor === color.hex ? "scale-125 ring-2 ring-offset-1 ring-[#2A5E64]" : ""
                      }`}
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E8F2F4]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-2.5 py-1 text-xs text-[#5D8185]"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 text-xs bg-[#2A5E64] text-white"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
