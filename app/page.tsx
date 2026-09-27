"use client";

import React, { useState, useEffect, useMemo } from "react";
import { format, isSameDay, parseISO } from "date-fns";
import Header from "@/components/dashboard/Header";
import CalendarView from "@/components/dashboard/CalendarView";
import TodoList from "@/components/dashboard/TodoList";
import PolaroidMemoryBox from "@/components/dashboard/PolaroidMemoryBox";
import {
  INITIAL_CALENDAR_EVENTS,
  INITIAL_TODOS,
  INITIAL_MEMORY,
} from "@/lib/mock-data";
import { CalendarEvent, TodoItem, MemoryBoxData } from "@/types";

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_CALENDAR_EVENTS);
  const [allTodos, setAllTodos] = useState<TodoItem[]>(INITIAL_TODOS);
  const [memories, setMemories] = useState<Record<string, MemoryBoxData>>({
    [new Date().toISOString().split("T")[0]]: INITIAL_MEMORY,
  });

  const selectedDateStr = useMemo(() => {
    return format(selectedDate, "yyyy-MM-dd");
  }, [selectedDate]);

  // Synchronize calendar reminders with daily todos for the selected date
  useEffect(() => {
    const dayEvents = events.filter((ev) => {
      try {
        const evDate = typeof ev.date === "string" ? parseISO(ev.date) : ev.date;
        return isSameDay(evDate, selectedDate);
      } catch {
        return false;
      }
    });

    if (dayEvents.length > 0) {
      setAllTodos((prev) => {
        let updated = [...prev];
        dayEvents.forEach((ev) => {
          const alreadyExists = updated.some(
            (t) => t.date === selectedDateStr && t.title === ev.title
          );
          if (!alreadyExists) {
            updated.unshift({
              id: `auto-${ev.id}-${selectedDateStr}`,
              title: ev.title,
              completed: false,
              isFromCalendar: true,
              date: selectedDateStr,
            });
          }
        });
        return updated;
      });
    }
  }, [selectedDate, events, selectedDateStr]);

  // Filter todos for the current active date
  const currentTodos = useMemo(() => {
    return allTodos.filter((t) => t.date === selectedDateStr);
  }, [allTodos, selectedDateStr]);

  // Handlers for Todos
  const handleToggleTodo = (id: string) => {
    setAllTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleAddTodo = (title: string) => {
    const newTodo: TodoItem = {
      id: `todo-${Date.now()}`,
      title,
      completed: false,
      isFromCalendar: false,
      date: selectedDateStr,
    };
    setAllTodos((prev) => [newTodo, ...prev]);
  };

  const handleDeleteTodo = (id: string) => {
    setAllTodos((prev) => prev.filter((t) => t.id !== id));
  };

  // Handlers for Calendar Events
  const handleAddEvent = (newEvent: Omit<CalendarEvent, "id">) => {
    const eventWithId: CalendarEvent = {
      ...newEvent,
      id: `cal-${Date.now()}`,
    };
    setEvents((prev) => [...prev, eventWithId]);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
  };

  // Handler for Memory Box
  const handleUpdateMemory = (data: MemoryBoxData) => {
    setMemories((prev) => ({
      ...prev,
      [data.date]: data,
    }));
  };

  const currentMemory = memories[selectedDateStr];

  return (
    <div className="min-h-screen bg-[#F4F8F9] text-[#243336] px-2 sm:px-4 md:px-8 lg:px-12 py-3 sm:py-6 max-w-7xl mx-auto flex flex-col justify-between">
      {/* Header */}
      <Header
        currentDate={selectedDate}
        onSelectDate={(newDate) => setSelectedDate(newDate)}
      />

      {/* Main Grid: Left = To-Do List | Right = Calendar (Top) & Polaroid (Bottom) */}
      <main className="w-full space-y-6">
        <section className="grid grid-cols-12 gap-2 sm:gap-4 md:gap-6 items-start">
          {/* SOL SÜTUN: Daily To-Do List */}
          <div className="col-span-6 sm:col-span-7 h-full">
            <TodoList
              todos={currentTodos}
              selectedDateStr={selectedDateStr}
              onToggleTodo={handleToggleTodo}
              onAddTodo={handleAddTodo}
              onDeleteTodo={handleDeleteTodo}
            />
          </div>

          {/* SAĞ SÜTUN: Takvim (Sağ Üst) + Polaroid Fotoğraf (Sağ Alt, eğri & kutusuz) */}
          <div className="col-span-6 sm:col-span-5 flex flex-col gap-3 sm:gap-5 items-center">
            {/* Takvim Sağ Üstte */}
            <CalendarView
              events={events}
              selectedDate={selectedDate}
              onAddEvent={handleAddEvent}
              onDeleteEvent={handleDeleteEvent}
            />

            {/* Polaroid Fotoğraf Alanı (Takvimin altında) */}
            <div className="w-full flex justify-center pt-0.5">
              <PolaroidMemoryBox
                memoryData={currentMemory}
                selectedDate={selectedDate}
                onUpdateMemory={handleUpdateMemory}
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-8 text-center text-[10px] sm:text-[11px] text-[#85A6A9] py-2">
        <span>Aesthetic Life Dashboard</span>
      </footer>
    </div>
  );
}
