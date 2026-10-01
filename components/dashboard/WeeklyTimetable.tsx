"use client";

import React, { useState, useMemo } from "react";
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
} from "date-fns";
import {
  Clock,
  MapPin,
  FileText,
  Trash2,
  X,
  Calendar as CalendarIcon,
  Check,
  Edit2,
  Plus,
} from "lucide-react";
import { TimetableItem } from "@/types";

interface WeeklyTimetableProps {
  selectedDate: Date;
  timetableItems: TimetableItem[];
  onAddTimetableItem: (item: Omit<TimetableItem, "id">) => void;
  onUpdateTimetableItem: (item: TimetableItem) => void;
  onDeleteTimetableItem: (id: string) => void;
}

const ALL_HOURS = Array.from({ length: 17 }, (_, i) => i + 7); // 07:00 to 23:00

const COLOR_PRESETS = [
  { name: "Gül Kurusu", value: "#E8C5C8", border: "#C98E94" },
  { name: "Buz Mavisi", value: "#CBDCEB", border: "#8BA7BF" },
  { name: "Adaçayı Yeşili", value: "#C5D5C5", border: "#8EA88E" },
  { name: "Sıcak Amber", value: "#E8C98F", border: "#BF9956" },
  { name: "Lavanta", value: "#D9CEE8", border: "#9F8EBA" },
  { name: "Şeftali", value: "#F2D4C2", border: "#C79D84" },
];

const DAY_FULL_NAMES = [
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
  "Pazar",
];

export default function WeeklyTimetable({
  selectedDate,
  timetableItems,
  onAddTimetableItem,
  onUpdateTimetableItem,
  onDeleteTimetableItem,
}: WeeklyTimetableProps) {
  // Modal State for adding new item or editing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TimetableItem | null>(null);
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<TimetableItem | null>(null);

  // Form inputs
  const [title, setTitle] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState<number>(1); // 1 = Monday
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("11:00");
  const [isRecurring, setIsRecurring] = useState<boolean>(true);
  const [color, setColor] = useState(COLOR_PRESETS[0].value);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  // Week start (Monday) and 7 days array based on selectedDate
  const weekStart = useMemo(() => {
    return startOfWeek(selectedDate, { weekStartsOn: 1 });
  }, [selectedDate]);

  const weekStartStr = useMemo(() => {
    return format(weekStart, "yyyy-MM-dd");
  }, [weekStart]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  // Filter items for the active week
  const visibleItems = useMemo(() => {
    return timetableItems.filter((item) => {
      // Permanent (isRecurring = true) items are shown every week
      if (item.isRecurring) return true;

      // Single-week events: tied to this week's start date (or no weekStartDate specified)
      if (item.weekStartDate) {
        return item.weekStartDate === weekStartStr;
      }
      return true;
    });
  }, [timetableItems, weekStartStr]);

  // Dynamic Hour Range: Only show between earliest and latest events of the week!
  const displayedHours = useMemo(() => {
    if (visibleItems.length === 0) {
      // Default daytime range if no events exist
      return Array.from({ length: 10 }, (_, i) => i + 9); // 09:00 to 18:00
    }

    let minH = 23;
    let maxH = 7;

    visibleItems.forEach((item) => {
      const startH = parseInt(item.startTime.split(":")[0], 10);
      const [endHStr, endMStr] = item.endTime.split(":");
      const endH = parseInt(endHStr, 10) + (parseInt(endMStr, 10) > 0 ? 1 : 0);

      if (startH < minH) minH = startH;
      if (endH > maxH) maxH = endH;
    });

    // Constrain within 7 to 23, with a minimum span of 3 hours for comfortable layout
    minH = Math.max(7, minH);
    maxH = Math.min(23, Math.max(minH + 3, maxH));

    return Array.from({ length: maxH - minH + 1 }, (_, i) => i + minH);
  }, [visibleItems]);

  const minHour = displayedHours[0] || 9;

  // Handlers for Add / Edit Modal
  const handleOpenAddModal = (presetDay?: number, presetHour?: number) => {
    setEditingItem(null);
    setTitle("");
    setLocation("");
    setDescription("");
    setIsRecurring(true);
    setColor(COLOR_PRESETS[0].value);

    if (presetDay) setDayOfWeek(presetDay);
    if (presetHour) {
      const sH = String(presetHour).padStart(2, "0") + ":00";
      const eH = String(Math.min(23, presetHour + 1)).padStart(2, "0") + ":00";
      setStartTime(sH);
      setEndTime(eH);
    } else {
      setStartTime("09:00");
      setEndTime("11:00");
    }
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: TimetableItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setDayOfWeek(item.dayOfWeek);
    setStartTime(item.startTime);
    setEndTime(item.endTime);
    setIsRecurring(item.isRecurring);
    setColor(item.color || COLOR_PRESETS[0].value);
    setLocation(item.location || "");
    setDescription(item.description || "");
    setSelectedItemForDetail(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingItem) {
      onUpdateTimetableItem({
        ...editingItem,
        title: title.trim(),
        dayOfWeek,
        startTime,
        endTime,
        isRecurring,
        color,
        location: location.trim() || undefined,
        description: description.trim() || undefined,
        weekStartDate: isRecurring ? undefined : editingItem.weekStartDate || weekStartStr,
      });
    } else {
      onAddTimetableItem({
        title: title.trim(),
        dayOfWeek,
        startTime,
        endTime,
        isRecurring,
        color,
        location: location.trim() || undefined,
        description: description.trim() || undefined,
        weekStartDate: isRecurring ? undefined : weekStartStr,
      });
    }

    // Reset form
    setTitle("");
    setLocation("");
    setDescription("");
    setEditingItem(null);
    setIsModalOpen(false);
  };

  return (
    <div className="w-full flex flex-col space-y-2.5">
      {/* SECTION HEADER: Only "Haftalık Program" title */}
      <div className="pb-2 border-b-2 border-[#BEDCE0]">
        <h2 className="font-serif-title text-xl sm:text-2xl font-medium text-[#1E4549] tracking-tight">
          Haftalık Program
        </h2>
      </div>

      {/* TIMETABLE CONTAINER */}
      <div className="bg-white rounded-2xl border border-[#D7E9EB] shadow-xs overflow-hidden">
        {/* Horizontal scroll wrapper for mobile & tablet */}
        <div className="overflow-x-auto">
          <div className="min-w-[760px] md:min-w-[840px]">
            {/* Table Header: Full Day Names without numbers; weekends smaller */}
            <div className="grid grid-cols-[52px_repeat(5,minmax(95px,1.2fr))_repeat(2,minmax(65px,0.75fr))] border-b border-[#D7E9EB] bg-[#F7FAFA] sticky top-0 z-20 shadow-[0_1px_3px_rgba(30,70,75,0.04)]">
              {/* Corner Hour Box - Completely blank */}
              <div className="p-2 border-r border-[#E2EEF0] bg-[#F7FAFA]" />

              {/* 7 Days Headers: only full day names, no numbers */}
              {weekDays.map((dayDate, idx) => {
                const dayNum = idx + 1;
                const isToday = isSameDay(dayDate, new Date());
                const isSelected = isSameDay(dayDate, selectedDate);
                const isWeekend = dayNum >= 6;

                return (
                  <div
                    key={dayNum}
                    className={`py-2 px-1 text-center border-r last:border-r-0 border-[#E2EEF0] transition-colors flex items-center justify-center ${
                      isToday
                        ? "bg-[#E6F3F4] text-[#1E4549] font-semibold"
                        : isSelected
                        ? "bg-[#EFF7F8] text-[#1E4549] font-medium"
                        : isWeekend
                        ? "bg-[#FAFCFC] text-[#6E8D91]"
                        : "bg-[#F7FAFA] text-[#3D6468]"
                    }`}
                  >
                    <span className="text-[11px] sm:text-xs font-semibold tracking-tight truncate">
                      {DAY_FULL_NAMES[idx]}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Time Grid Body - Only between earliest and latest event hours */}
            <div className="relative overflow-y-auto">
              <div
                className="grid grid-cols-[52px_repeat(5,minmax(95px,1.2fr))_repeat(2,minmax(65px,0.75fr))] relative"
                style={{
                  gridTemplateRows: `repeat(${displayedHours.length}, minmax(32px, auto))`,
                }}
              >
                {/* 1) Left Hour Labels: Aligned directly with the horizontal divider line */}
                {displayedHours.map((hour, rIdx) => (
                  <div
                    key={`hour-label-${hour}`}
                    style={{
                      gridRowStart: rIdx + 1,
                      gridColumnStart: 1,
                    }}
                    className="border-r border-b border-[#EDF5F6] bg-[#FAFCFC] relative select-none"
                  >
                    {/* Aligned directly on top of the divider line (not centered between lines) */}
                    <span className="absolute top-0 right-1.5 -translate-y-1/2 text-[10px] sm:text-[11px] font-medium text-[#7D9EA1] bg-[#FAFCFC] px-0.5 leading-none">
                      {String(hour).padStart(2, "0")}:00
                    </span>
                  </div>
                ))}

                {/* 2) Interactive Empty Background Cells (thin if empty) */}
                {displayedHours.map((hour, rIdx) => {
                  return Array.from({ length: 7 }, (_, dIdx) => {
                    const dayNum = dIdx + 1;
                    return (
                      <div
                        key={`cell-${hour}-${dayNum}`}
                        onClick={() => handleOpenAddModal(dayNum, hour)}
                        style={{
                          gridRowStart: rIdx + 1,
                          gridColumnStart: dayNum + 1,
                        }}
                        className="border-b border-r last:border-r-0 border-[#EDF5F6] hover:bg-[#F2F9FA]/70 transition-colors cursor-pointer group/cell relative min-h-[32px]"
                        title={`${DAY_FULL_NAMES[dIdx]} ${String(hour).padStart(2, "0")}:00 - Tıkla ve ekle`}
                      >
                        {/* Subtle add icon indicator on slot hover */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cell:opacity-40 pointer-events-none transition-opacity">
                          <Plus className="w-3.5 h-3.5 text-[#37757C]" />
                        </div>
                      </div>
                    );
                  });
                })}

                {/* 3) Rendered Event Cards */}
                {visibleItems.map((item) => {
                  const [startH] = item.startTime.split(":").map(Number);
                  const [endH, endM] = item.endTime.split(":").map(Number);

                  const rowStart = Math.max(1, startH - minHour + 1);
                  const durationHours = Math.max(1, (endH - startH) + (endM > 0 ? 1 : 0));
                  const rowSpan = Math.min(durationHours, displayedHours.length - rowStart + 1);
                  const colIndex = item.dayOfWeek + 1;

                  const preset = COLOR_PRESETS.find((p) => p.value === item.color);
                  const borderColor = preset ? preset.border : "#37757C";

                  return (
                    <div
                      key={item.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItemForDetail(item);
                      }}
                      style={{
                        gridRow: `${rowStart} / span ${rowSpan}`,
                        gridColumn: `${colIndex}`,
                        backgroundColor: item.color || "#E8C5C8",
                        borderLeftColor: borderColor,
                      }}
                      className="z-10 m-0.5 rounded-lg border-l-3 p-1.5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-center overflow-hidden group/card hover:scale-[1.008]"
                    >
                      {/* SADECE BAŞLIK (Pin ve yıldız yok, saat yazısı yok) */}
                      <span className="text-[11px] sm:text-xs font-semibold text-[#183538] leading-snug line-clamp-2">
                        {item.title}
                      </span>

                      {/* Yer kalırsa açıklama / not, uzarsa ... ile kesilir */}
                      {(item.description || item.location) && (
                        <span className="text-[10px] text-[#345356] leading-tight line-clamp-1 mt-0.5 opacity-90 truncate">
                          {item.description || item.location}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: YENİ DERS / ETKİNLİK EKLE & DÜZENLE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-xl border border-[#D7E9EB] flex flex-col gap-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E8F2F2]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#E6F3F4] text-[#37757C] flex items-center justify-center">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <h3 className="font-serif-title text-xl font-medium text-[#1E4549]">
                  {editingItem ? "Programı Düzenle" : "Haftalık Programa Ekle"}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingItem(null);
                }}
                className="p-1 rounded-full text-[#7B9CA0] hover:text-[#24464A] hover:bg-[#EEF7F8] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              {/* Tür Seçimi: Sabit Ders vs Haftalık Özel */}
              <div>
                <label className="block text-xs font-semibold text-[#486B6F] mb-1.5">
                  Program Türü
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRecurring(true)}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isRecurring
                        ? "bg-[#E6F3F4] border-[#37757C] text-[#1E4549] shadow-xs"
                        : "bg-white border-[#D7E9EB] text-[#69888C] hover:bg-[#F7FAFA]"
                    }`}
                  >
                    <span>Sabit Ders (Kalıcı)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRecurring(false)}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      !isRecurring
                        ? "bg-[#E6F3F4] border-[#37757C] text-[#1E4549] shadow-xs"
                        : "bg-white border-[#D7E9EB] text-[#69888C] hover:bg-[#F7FAFA]"
                    }`}
                  >
                    <span>Sadece Bu Hafta</span>
                  </button>
                </div>
              </div>

              {/* Başlık Input */}
              <div>
                <label className="block text-xs font-semibold text-[#486B6F] mb-1">
                  Ders / Etkinlik İsmi
                </label>
                <input
                  type="text"
                  placeholder="Örn: Tipografi & UI Tasarım, Proje Toplantısı..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                  required
                  className="w-full px-3 py-2 text-sm bg-[#FAFCFC] border border-[#CFE4E6] rounded-xl focus:outline-none focus:border-[#37757C] focus:bg-white text-[#1C3E42] transition-colors"
                />
              </div>

              {/* Gün Seçimi: Tam isimlerle */}
              <div>
                <label className="block text-xs font-semibold text-[#486B6F] mb-1.5">
                  Gün
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1">
                  {DAY_FULL_NAMES.map((name, idx) => {
                    const dayVal = idx + 1;
                    const isSelected = dayOfWeek === dayVal;
                    return (
                      <button
                        key={dayVal}
                        type="button"
                        onClick={() => setDayOfWeek(dayVal)}
                        className={`py-1.5 px-1 text-[11px] font-medium rounded-lg border transition-all cursor-pointer truncate ${
                          isSelected
                            ? "bg-[#37757C] text-white border-[#37757C] shadow-xs"
                            : "bg-[#FAFCFC] border-[#DCEBED] text-[#557A7E] hover:bg-[#EDF6F7]"
                        }`}
                        title={name}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Saat Aralığı - 07:00'den 23:00'e kadar tüm saatler seçilebilir */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#486B6F] mb-1">
                    Başlangıç Saati
                  </label>
                  <select
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs sm:text-sm bg-[#FAFCFC] border border-[#CFE4E6] rounded-xl focus:outline-none focus:border-[#37757C] text-[#1C3E42]"
                  >
                    {ALL_HOURS.map((h) => {
                      const hStr = String(h).padStart(2, "0") + ":00";
                      const hHalf = String(h).padStart(2, "0") + ":30";
                      return (
                        <React.Fragment key={h}>
                          <option value={hStr}>{hStr}</option>
                          <option value={hHalf}>{hHalf}</option>
                        </React.Fragment>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#486B6F] mb-1">
                    Bitiş Saati
                  </label>
                  <select
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs sm:text-sm bg-[#FAFCFC] border border-[#CFE4E6] rounded-xl focus:outline-none focus:border-[#37757C] text-[#1C3E42]"
                  >
                    {ALL_HOURS.map((h) => {
                      const hStr = String(h).padStart(2, "0") + ":00";
                      const hHalf = String(h).padStart(2, "0") + ":30";
                      return (
                        <React.Fragment key={h}>
                          <option value={hStr}>{hStr}</option>
                          <option value={hHalf}>{hHalf}</option>
                        </React.Fragment>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Açıklama / Not */}
              <div>
                <label className="block text-xs font-semibold text-[#486B6F] mb-1">
                  Açıklama / Not
                </label>
                <input
                  type="text"
                  placeholder="Örn: Vize hazırlık tekrarı, grup ödevi incelemesi..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs sm:text-sm bg-[#FAFCFC] border border-[#CFE4E6] rounded-xl focus:outline-none focus:border-[#37757C] text-[#1C3E42]"
                />
              </div>

              {/* Konum / Mekan (İsteğe bağlı) */}
              <div>
                <label className="block text-xs font-semibold text-[#486B6F] mb-1">
                  Mekan / Derslik
                </label>
                <input
                  type="text"
                  placeholder="Örn: Atölye 302, Amfi 1 veya Google Meet"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs sm:text-sm bg-[#FAFCFC] border border-[#CFE4E6] rounded-xl focus:outline-none focus:border-[#37757C] text-[#1C3E42]"
                />
              </div>

              {/* Renk Seçimi */}
              <div>
                <label className="block text-xs font-semibold text-[#486B6F] mb-1.5">
                  Renk Paleti
                </label>
                <div className="flex items-center gap-2.5">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setColor(preset.value)}
                      style={{ backgroundColor: preset.value }}
                      className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all cursor-pointer ${
                        color === preset.value
                          ? "border-[#25545A] scale-110 shadow-xs"
                          : "border-white/80 hover:scale-105"
                      }`}
                      title={preset.name}
                    >
                      {color === preset.value && (
                        <Check className="w-3.5 h-3.5 text-[#25545A] stroke-[2.5]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E8F2F2]">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 text-xs sm:text-sm font-medium text-[#5A7E82] hover:bg-[#EEF7F8] rounded-xl transition-colors cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs sm:text-sm font-medium text-white bg-[#37757C] hover:bg-[#275C62] rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {editingItem ? "Değişiklikleri Kaydet" : "Programa Ekle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL / DELETE / EDIT POPUP MODAL */}
      {selectedItemForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-[#D7E9EB] flex flex-col gap-3.5">
            {/* Header: Color dot, Type & Close */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div
                  style={{ backgroundColor: selectedItemForDetail.color || "#E8C5C8" }}
                  className="w-4 h-4 rounded-full border border-black/10"
                />
                <span className="text-xs font-semibold text-[#57797D] uppercase tracking-wider">
                  {selectedItemForDetail.isRecurring
                    ? "Sabit Ders Programı"
                    : "Haftalık Özel Etkinlik"}
                </span>
              </div>
              <button
                onClick={() => setSelectedItemForDetail(null)}
                className="p-1 rounded-full text-[#7B9CA0] hover:text-[#24464A] hover:bg-[#EEF7F8] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Details: Title, Time, Description, Location */}
            <div>
              <h4 className="font-serif-title text-xl font-medium text-[#1E4549]">
                {selectedItemForDetail.title}
              </h4>
              <div className="mt-2.5 space-y-1.5 text-xs text-[#4A6D71]">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-3.5 h-3.5 text-[#37757C]" />
                  <span>{DAY_FULL_NAMES[selectedItemForDetail.dayOfWeek - 1]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#37757C]" />
                  <span>
                    {selectedItemForDetail.startTime} - {selectedItemForDetail.endTime}
                  </span>
                </div>
                {selectedItemForDetail.description && (
                  <div className="flex items-start gap-2 pt-0.5">
                    <FileText className="w-3.5 h-3.5 text-[#37757C] mt-0.5 flex-shrink-0" />
                    <span className="leading-snug text-[#2B4E52]">
                      {selectedItemForDetail.description}
                    </span>
                  </div>
                )}
                {selectedItemForDetail.location && (
                  <div className="flex items-center gap-2 pt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#37757C] flex-shrink-0" />
                    <span>{selectedItemForDetail.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions: Düzenle, Sil, Kapat */}
            <div className="flex items-center justify-between pt-3 border-t border-[#E8F2F2] mt-1">
              <button
                onClick={() => {
                  onDeleteTimetableItem(selectedItemForDetail.id);
                  setSelectedItemForDetail(null);
                }}
                className="text-xs font-medium text-rose-600 hover:text-rose-700 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sil</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEditModal(selectedItemForDetail)}
                  className="px-3 py-1.5 text-xs font-medium text-[#205157] bg-[#E2F0F2] hover:bg-[#D3E8EA] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Düzenle</span>
                </button>

                <button
                  onClick={() => setSelectedItemForDetail(null)}
                  className="px-3 py-1.5 text-xs font-medium text-[#56797D] hover:bg-[#EEF7F8] rounded-lg transition-colors cursor-pointer"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
