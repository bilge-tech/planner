"use client";

import React, { useState, useEffect, useMemo } from "react";
import { format, isSameDay, parseISO } from "date-fns";
import Header from "@/components/dashboard/Header";
import CalendarView from "@/components/dashboard/CalendarView";
import TodoList from "@/components/dashboard/TodoList";
import PolaroidMemoryBox from "@/components/dashboard/PolaroidMemoryBox";
import WeeklyTimetable from "@/components/dashboard/WeeklyTimetable";
import BrainDump from "@/components/dashboard/BrainDump";
import ProjectsTracker from "@/components/dashboard/ProjectsTracker";
import ExpenseTracker from "@/components/dashboard/ExpenseTracker";
import {
  INITIAL_CALENDAR_EVENTS,
  INITIAL_TODOS,
  INITIAL_MEMORY,
  INITIAL_TIMETABLE,
  INITIAL_BRAINDUMP,
  INITIAL_PROJECTS,
  INITIAL_EXPENSES,
} from "@/lib/mock-data";
import {
  CalendarEvent,
  TodoItem,
  MemoryBoxData,
  TimetableItem,
  ProjectItem,
  ExpenseItem,
} from "@/types";

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_CALENDAR_EVENTS);
  const [allTodos, setAllTodos] = useState<TodoItem[]>(INITIAL_TODOS);
  const [timetableItems, setTimetableItems] = useState<TimetableItem[]>(INITIAL_TIMETABLE);
  const [projects, setProjects] = useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [expenses, setExpenses] = useState<ExpenseItem[]>(INITIAL_EXPENSES);
  const [memories, setMemories] = useState<Record<string, MemoryBoxData>>({
    [format(new Date(), "yyyy-MM-dd")]: INITIAL_MEMORY,
  });
  const [brainDumps, setBrainDumps] = useState<Record<string, string>>({
    [format(new Date(), "yyyy-MM-dd")]: INITIAL_BRAINDUMP.text,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on client-side mount
  useEffect(() => {
    try {
      const savedEvents = localStorage.getItem("planner_events");
      if (savedEvents) setEvents(JSON.parse(savedEvents));

      const savedTodos = localStorage.getItem("planner_todos");
      if (savedTodos) setAllTodos(JSON.parse(savedTodos));

      const savedTimetable = localStorage.getItem("planner_timetable");
      if (savedTimetable) setTimetableItems(JSON.parse(savedTimetable));

      const savedProjects = localStorage.getItem("planner_projects");
      if (savedProjects) setProjects(JSON.parse(savedProjects));

      const savedExpenses = localStorage.getItem("planner_expenses");
      if (savedExpenses) setExpenses(JSON.parse(savedExpenses));

      const savedMemories = localStorage.getItem("planner_memories");
      if (savedMemories) setMemories(JSON.parse(savedMemories));

      const savedBrainDumps = localStorage.getItem("planner_braindumps");
      if (savedBrainDumps) setBrainDumps(JSON.parse(savedBrainDumps));
    } catch (e) {
      console.error("Failed to load planner data from localStorage:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever data changes (only after hydration)
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("planner_events", JSON.stringify(events));
    } catch (e) {
      console.error("Failed saving events:", e);
    }
  }, [events, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("planner_todos", JSON.stringify(allTodos));
    } catch (e) {
      console.error("Failed saving todos:", e);
    }
  }, [allTodos, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("planner_timetable", JSON.stringify(timetableItems));
    } catch (e) {
      console.error("Failed saving timetable:", e);
    }
  }, [timetableItems, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("planner_projects", JSON.stringify(projects));
    } catch (e) {
      console.error("Failed saving projects:", e);
    }
  }, [projects, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("planner_expenses", JSON.stringify(expenses));
    } catch (e) {
      console.error("Failed saving expenses:", e);
    }
  }, [expenses, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("planner_memories", JSON.stringify(memories));
    } catch (e) {
      console.error("Failed saving memories:", e);
    }
  }, [memories, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("planner_braindumps", JSON.stringify(brainDumps));
    } catch (e) {
      console.error("Failed saving braindumps:", e);
    }
  }, [brainDumps, isLoaded]);

  const selectedDateStr = useMemo(() => {
    return format(selectedDate, "yyyy-MM-dd");
  }, [selectedDate]);

  // Synchronize calendar reminders with daily todos for the selected date
  useEffect(() => {
    if (!isLoaded) return;

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
  }, [selectedDate, events, selectedDateStr, isLoaded]);

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

  // Handlers for Timetable
  const handleAddTimetableItem = (newItem: Omit<TimetableItem, "id">) => {
    const itemWithId: TimetableItem = {
      ...newItem,
      id: `time-${Date.now()}`,
    };
    setTimetableItems((prev) => [...prev, itemWithId]);
  };

  const handleDeleteTimetableItem = (id: string) => {
    setTimetableItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateTimetableItem = (updatedItem: TimetableItem) => {
    setTimetableItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
  };

  // Handler for Memory Box
  const handleUpdateMemory = (data: MemoryBoxData) => {
    setMemories((prev) => ({
      ...prev,
      [data.date]: data,
    }));
  };

  // Handlers for Projects
  const handleAddProject = (newProj: Omit<ProjectItem, "id">) => {
    const projWithId: ProjectItem = {
      ...newProj,
      id: `proj-${Date.now()}`,
    };
    setProjects((prev) => [projWithId, ...prev]);
  };

  const handleUpdateProject = (updated: ProjectItem) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  };

  const handleDeleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSendProjectTaskToTodo = (taskTitle: string) => {
    handleAddTodo(taskTitle);
  };

  // Handlers for Expenses
  const handleAddExpense = (newExp: Omit<ExpenseItem, "id">) => {
    const expWithId: ExpenseItem = {
      ...newExp,
      id: `exp-${Date.now()}`,
    };
    setExpenses((prev) => [expWithId, ...prev]);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const handleResetAllData = () => {
    if (typeof window !== "undefined" && window.confirm("Tüm verileri varsayılan örnek verilere sıfırlamak istediğinize emin misiniz?")) {
      try {
        localStorage.removeItem("planner_events");
        localStorage.removeItem("planner_todos");
        localStorage.removeItem("planner_timetable");
        localStorage.removeItem("planner_projects");
        localStorage.removeItem("planner_expenses");
        localStorage.removeItem("planner_memories");
        localStorage.removeItem("planner_braindumps");
        window.location.reload();
      } catch (e) {
        console.error("Reset error:", e);
      }
    }
  };

  const currentMemory = memories[selectedDateStr];

  return (
    <div className="min-h-screen bg-[#F4F8F9] text-[#243336] px-2 sm:px-4 md:px-8 lg:px-12 py-3 sm:py-6 max-w-7xl mx-auto flex flex-col justify-between">
      {/* Header */}
      <Header
        currentDate={selectedDate}
        onSelectDate={(newDate) => setSelectedDate(newDate)}
      />

      {/* Main Grid: Upper Section & Timetable */}
      <main className="w-full space-y-7 sm:space-y-9 mt-1">
        {/* ÜST BÖLÜM: Left = To-Do List | Right = Calendar & Polaroid */}
        <section className="grid grid-cols-12 gap-2 sm:gap-4 md:gap-6 items-start">
          {/* SOL SÜTUN: Daily To-Do List */}
          <div className="col-span-6 sm:col-span-7 h-full">
            <TodoList
              todos={currentTodos}
              deadlines={events}
              selectedDateStr={selectedDateStr}
              onToggleTodo={handleToggleTodo}
              onAddTodo={handleAddTodo}
              onDeleteTodo={handleDeleteTodo}
              onDeleteDeadline={handleDeleteEvent}
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

        {/* MODÜL 5: Haftalık Program (Weekly Timetable) */}
        <section className="w-full pt-1">
          <WeeklyTimetable
            selectedDate={selectedDate}
            timetableItems={timetableItems}
            onAddTimetableItem={handleAddTimetableItem}
            onUpdateTimetableItem={handleUpdateTimetableItem}
            onDeleteTimetableItem={handleDeleteTimetableItem}
          />
        </section>

        {/* MODÜL 6: Brain Dump (Sol Tarafta Her Zaman 3/4 Genişlik) */}
        <section className="w-full pt-1 flex justify-start">
          <div className="w-[75%]">
            <BrainDump
              value={brainDumps[selectedDateStr] ?? ""}
              onChange={(val) =>
                setBrainDumps((prev) => ({
                  ...prev,
                  [selectedDateStr]: val,
                }))
              }
              selectedDateStr={selectedDateStr}
            />
          </div>
        </section>

        {/* MODÜL 8: Projeler & İlerleme Çubukları */}
        <section className="w-full pt-2">
          <ProjectsTracker
            projects={projects}
            onAddProject={handleAddProject}
            onUpdateProject={handleUpdateProject}
            onDeleteProject={handleDeleteProject}
            onSendToTodo={handleSendProjectTaskToTodo}
          />
        </section>

        {/* MODÜL 7: Gider Takibi & Bütçe Grafiği (En Altta) */}
        <section className="w-full pt-2">
          <ExpenseTracker
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-8 text-center text-[10px] sm:text-[11px] text-[#85A6A9] py-2 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
        <span>Aesthetic Life Dashboard</span>
        <span className="hidden sm:inline opacity-50">•</span>
        <button
          type="button"
          onClick={handleResetAllData}
          className="hover:text-[#D97054] underline underline-offset-2 transition-colors cursor-pointer opacity-75 hover:opacity-100"
          title="Tüm verileri başlangıç durumuna döndürür"
        >
          Örnek Verileri Sıfırla
        </button>
      </footer>
    </div>
  );
}
