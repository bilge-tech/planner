"use client";

import React, { useState, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import { Check, Plus, Trash2, Star, X } from "lucide-react";
import { TodoItem, CalendarEvent } from "@/types";

interface TodoListProps {
  todos: TodoItem[];
  deadlines?: CalendarEvent[];
  selectedDateStr: string;
  onToggleTodo: (id: string) => void;
  onAddTodo: (title: string) => void;
  onDeleteTodo: (id: string) => void;
  onDeleteDeadline?: (id: string) => void;
}

export default function TodoList({
  todos,
  deadlines = [],
  selectedDateStr,
  onToggleTodo,
  onAddTodo,
  onDeleteTodo,
  onDeleteDeadline,
}: TodoListProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [confirmDeleteDeadlineItem, setConfirmDeleteDeadlineItem] = useState<CalendarEvent | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTodo(newTitle.trim());
    setNewTitle("");
    setIsAddModalOpen(false);
  };

  // Calendar-linked tasks come first, then incomplete, then completed
  const sortedTodos = useMemo(() => {
    return [...todos].sort((a, b) => {
      if (a.isFromCalendar && !b.isFromCalendar) return -1;
      if (!a.isFromCalendar && b.isFromCalendar) return 1;
      if (a.completed === b.completed) return 0;
      return a.completed ? 1 : -1;
    });
  }, [todos]);

  // En yakın 3 son başvuru tarihi (Takvimden çekilen)
  const upcomingDeadlines = useMemo(() => {
    return (deadlines || [])
      .filter((ev) => ev.isDeadline || ev.category === "deadline")
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 3);
  }, [deadlines]);

  return (
    <div className="w-full flex flex-col pt-1">
      {/* Header: To-Do List title on left, "+" button on right */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b-2 border-[#BEDCE0]">
        <h2 className="font-serif-title text-xl sm:text-2xl font-medium text-[#1E4549] tracking-tight">
          To-Do List
        </h2>

        {/* Plus Button to add tasks */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="p-1 rounded-full text-[#2A5E64] hover:bg-[#E2F0F2] transition-colors cursor-pointer"
          title="Yeni Görev Ekle"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Tasks List - Ruled line format with circular checkboxes */}
      <div className="space-y-0 divide-y divide-[#E4F0F2] overflow-y-auto max-h-[340px] pr-0.5">
        {sortedTodos.length === 0 ? (
          <div className="py-6 text-center text-[#8EA9AB]">
            <p className="font-serif-title text-sm text-[#5B7B7E]">Listeniz henüz boş</p>
          </div>
        ) : (
          sortedTodos.map((todo) => (
            <div
              key={todo.id}
              className={`group flex items-start justify-between py-2 sm:py-2.5 transition-colors ${
                todo.completed ? "opacity-45" : "hover:bg-[#F0F7F8]/40"
              }`}
            >
              {/* Task item: Circular checkbox and text */}
              <div
                className="flex items-start gap-2.5 flex-1 cursor-pointer select-none min-w-0"
                onClick={() => onToggleTodo(todo.id)}
              >
                {/* Round Circular Checkbox (Yuvarlak) */}
                <div
                  className={`w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full flex items-center justify-center transition-all shrink-0 mt-0.5 ${
                    todo.completed
                      ? "bg-[#2A5E64] text-white"
                      : "border-2 border-[#8BB9BD] group-hover:border-[#3D858D] bg-white"
                  }`}
                >
                  {todo.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>

                {/* Task Text directly next to circle */}
                <div className="flex-1 min-w-0">
                  <span
                    className={`text-xs sm:text-[13px] transition-all leading-snug block break-words ${
                      todo.completed
                        ? "line-through text-[#87A1A4]"
                        : "text-[#243336] font-normal"
                    }`}
                  >
                    {todo.title}
                  </span>

                  {todo.isFromCalendar && (
                    <span className="inline-flex items-center gap-0.5 mt-0.5 text-[9px] font-medium text-[#2E737B] bg-[#E2F4F5] px-1.5 py-0.2 rounded-full border border-[#C2E9EC]">
                      <Star className="w-2 h-2 fill-current" />
                      Anımsatıcı
                    </span>
                  )}
                </div>
              </div>

              {/* Delete Icon on hover */}
              <button
                onClick={() => onDeleteTodo(todo.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-[#93B0B3] hover:text-[#D9534F] transition-all shrink-0 ml-1 cursor-pointer"
                title="Sil"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* EN ALTTA 3 SATIR: Takvimden Gelen Son Başvuru Tarihleri (Başlık yok, tarih satırda yazmaz, pop-up'ta yazar) */}
      {upcomingDeadlines.length > 0 && (
        <div className="mt-2 pt-2 border-t-2 border-[#BEDCE0]">
          <div className="space-y-0 divide-y divide-[#E4F0F2]">
            {upcomingDeadlines.map((item) => (
              <div
                key={item.id}
                className="group flex items-start justify-between py-2 sm:py-2.5 hover:bg-[#F0F7F8]/40 transition-colors cursor-pointer select-none"
                onClick={() => setConfirmDeleteDeadlineItem(item)}
              >
                {/* Task item: Circular ring and text (Todo tarzında, üstü çizilmez, tarih yazmaz) */}
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  {/* Round Circular Ring (Yuvarlak daire) */}
                  <div
                    className="w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full border-2 border-[#C77D74] group-hover:border-[#A84A40] bg-white flex items-center justify-center shrink-0 mt-0.5 transition-colors"
                    title="Başvuruyu Tamamla / Sil"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C77D74]/70 group-hover:bg-[#A84A40]" />
                  </div>

                  {/* Task Text directly next to circle (Üstü ASLA çizilmez) */}
                  <div className="flex-1 min-w-0">
                    <span className="text-xs sm:text-[13px] text-[#243336] font-normal leading-snug block break-words">
                      {item.title}
                    </span>
                  </div>
                </div>

                {/* Delete Icon on hover */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDeleteDeadlineItem(item);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-[#93B0B3] hover:text-[#D9534F] transition-all shrink-0 ml-1 cursor-pointer"
                  title="Sil"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* "Başvurdun muuuuuu" Pop-up Modal */}
      {confirmDeleteDeadlineItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setConfirmDeleteDeadlineItem(null)}
        >
          <div
            className="bg-[#FFFFFF] border-2 border-[#D97D72] p-5 w-full max-w-xs shadow-2xl text-center rounded-xl animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-11 h-11 rounded-full bg-[#FCECE9] text-[#C77D74] flex items-center justify-center mx-auto mb-2 text-xl shadow-xs">
              🎓
            </div>

            <h3 className="font-serif-title text-xl font-bold text-[#8C342A] mb-1">
              başvurdun muuuuuu
            </h3>

            {/* Son Tarih Bilgisi burada pop-up içinde gösterilir */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FDF2F0] border border-[#F2D5D0] rounded-full text-xs font-semibold text-[#964B42] mb-3">
              <span>Son Tarih:</span>
              <span>
                {(() => {
                  try {
                    return format(parseISO(confirmDeleteDeadlineItem.date), "d MMMM yyyy", { locale: tr });
                  } catch {
                    return confirmDeleteDeadlineItem.date;
                  }
                })()}
              </span>
            </div>

            <p className="text-xs text-[#526B6E] mb-4 leading-relaxed px-1">
              <span className="font-semibold text-[#243336]">
                &ldquo;{confirmDeleteDeadlineItem.title}&rdquo;
              </span>{" "}
              için başvurunu tamamladıysan buradan silebilirsin.
            </p>

            <div className="flex items-center justify-center gap-2 pt-2 border-t border-[#F2D7D4]">
              <button
                type="button"
                onClick={() => setConfirmDeleteDeadlineItem(null)}
                className="px-3 py-1.5 text-xs text-[#638487] hover:bg-[#F2F8F9] transition-colors font-medium cursor-pointer rounded-md"
              >
                Henüz değil
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteDeadline) {
                    onDeleteDeadline(confirmDeleteDeadlineItem.id);
                  }
                  setConfirmDeleteDeadlineItem(null);
                }}
                className="px-3.5 py-1.5 text-xs bg-[#B2382C] hover:bg-[#99281D] text-white font-medium shadow-xs transition-colors cursor-pointer rounded-md"
              >
                Evet, silebilirsin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Pop-up Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="bg-[#FFFFFF] border-2 border-[#94C6CB] p-4 sm:p-5 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-150 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#E8F2F4] mb-3">
              <h3 className="font-serif-title text-base sm:text-lg font-medium text-[#1E4549]">
                Yeni Görev Ekle
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-[#7B9A9D] hover:text-[#243336] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder="Görevi yazın..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-[#B8D7DA] bg-[#F7FCFC] text-[#243336] text-xs sm:text-sm focus:outline-none focus:border-[#489DA5]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8F2F4]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#5D8185] cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="px-4 py-1.5 text-xs font-medium bg-[#2A5E64] text-white hover:bg-[#1E464A] disabled:opacity-40 transition-colors cursor-pointer"
                >
                  Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
