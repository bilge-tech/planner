"use client";

import React, { useState } from "react";
import { Plus, Check, Trash2, X, ListPlus, ChevronRight, Sparkles } from "lucide-react";
import { ProjectItem, ProjectMilestone } from "@/types";

interface ProjectsTrackerProps {
  projects: ProjectItem[];
  onAddProject: (project: Omit<ProjectItem, "id">) => void;
  onUpdateProject: (project: ProjectItem) => void;
  onDeleteProject: (id: string) => void;
  onSendToTodo: (todoTitle: string) => void;
}

const PRESET_PROJECT_COLORS = [
  { name: "Dusk Rose", hex: "#9E5B63" },
  { name: "Sage Forest", hex: "#587358" },
  { name: "Warm Amber", hex: "#A8763E" },
  { name: "Ocean Slate", hex: "#466B78" },
  { name: "Clay Terracotta", hex: "#AF6352" },
  { name: "Deep Teal", hex: "#327178" },
];

export default function ProjectsTracker({
  projects,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  onSendToTodo,
}: ProjectsTrackerProps) {
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeProjectForEdit, setActiveProjectForEdit] = useState<ProjectItem | null>(null);

  // New Project Form State
  const [newTitle, setNewTitle] = useState("");
  const [newColor, setNewColor] = useState(PRESET_PROJECT_COLORS[0].hex);
  // Dynamic checklist inputs array (starts with 1 empty input)
  const [dynamicSubtasks, setDynamicSubtasks] = useState<string[]>([""]);

  // Toast / feedback for sending to todo
  const [sentSubtaskId, setSentSubtaskId] = useState<string | null>(null);

  // Handle dynamic subtasks input changes
  const handleSubtaskInputChange = (index: number, value: string) => {
    const updated = [...dynamicSubtasks];
    updated[index] = value;

    // If typing in the last input and it's not empty, automatically add the next input!
    if (index === updated.length - 1 && value.trim() !== "") {
      updated.push("");
    }

    setDynamicSubtasks(updated);
  };

  const handleRemoveSubtaskInput = (index: number) => {
    if (dynamicSubtasks.length <= 1) {
      setDynamicSubtasks([""]);
      return;
    }
    const updated = dynamicSubtasks.filter((_, i) => i !== index);
    setDynamicSubtasks(updated);
  };

  // Submit New Project
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    // Filter out non-empty subtasks
    const validMilestones: ProjectMilestone[] = dynamicSubtasks
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((title, idx) => ({
        id: `m-${Date.now()}-${idx}`,
        title,
        completed: false,
      }));

    onAddProject({
      title: newTitle.trim(),
      color: newColor,
      milestones: validMilestones,
    });

    // Reset form
    setNewTitle("");
    setNewColor(PRESET_PROJECT_COLORS[0].hex);
    setDynamicSubtasks([""]);
    setIsAddModalOpen(false);
  };

  // Subtask management inside active project modal
  const [newSubtaskTitleInEdit, setNewSubtaskTitleInEdit] = useState("");

  const handleToggleMilestone = (project: ProjectItem, milestoneId: string) => {
    const updatedMilestones = project.milestones.map((m) =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );
    const updatedProject = { ...project, milestones: updatedMilestones };
    onUpdateProject(updatedProject);
    setActiveProjectForEdit(updatedProject);
  };

  const handleAddMilestoneInEdit = (project: ProjectItem) => {
    if (!newSubtaskTitleInEdit.trim()) return;
    const newM: ProjectMilestone = {
      id: `m-${Date.now()}`,
      title: newSubtaskTitleInEdit.trim(),
      completed: false,
    };
    const updatedProject = {
      ...project,
      milestones: [...project.milestones, newM],
    };
    onUpdateProject(updatedProject);
    setActiveProjectForEdit(updatedProject);
    setNewSubtaskTitleInEdit("");
  };

  const handleDeleteMilestoneInEdit = (project: ProjectItem, milestoneId: string) => {
    const updatedProject = {
      ...project,
      milestones: project.milestones.filter((m) => m.id !== milestoneId),
    };
    onUpdateProject(updatedProject);
    setActiveProjectForEdit(updatedProject);
  };

  const handleSendMilestoneToTodo = (title: string, milestoneId: string) => {
    onSendToTodo(title);
    setSentSubtaskId(milestoneId);
    setTimeout(() => {
      setSentSubtaskId(null);
    }, 2000);
  };

  return (
    <div className="w-full pt-1">
      {/* Header: Projeler Başlığı ve Yanında '+' Butonu */}
      <div className="flex items-center justify-between pb-2 mb-3 border-b-2 border-[#BEDCE0]">
        <div className="flex items-center gap-2">
          <h2 className="font-serif-title text-xl sm:text-2xl font-medium text-[#1E4549] tracking-tight">
            Projeler
          </h2>

          {/* 3 yazan yerde artı butonu */}
          <button
            onClick={() => {
              setDynamicSubtasks([""]);
              setIsAddModalOpen(true);
            }}
            className="p-1 rounded-full text-[#2A5E64] hover:bg-[#E2F0F2] transition-colors cursor-pointer"
            title="Yeni Proje Ekle"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Projeler Grid Listesi */}
      {projects.length === 0 ? (
        <div className="py-8 text-center text-[#8EA9AB] bg-white/60 border border-dashed border-[#D2E4E6] rounded-2xl">
          <p className="font-serif-title text-sm text-[#5B7B7E]">Henüz bir proje eklenmedi.</p>
          <p className="text-xs text-[#8BA4A7] mt-0.5">
            Yukarıdaki &ldquo;+&rdquo; butonuna basarak ilk projenizi başlatabilirsiniz.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {projects.map((project) => {
            const total = project.milestones.length;
            const completedCount = project.milestones.filter((m) => m.completed).length;
            const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

            return (
              <div
                key={project.id}
                className="group relative bg-[#FFFFFF] border border-[#D5E6E8] hover:border-[#A6CDD1] rounded-2xl p-4 shadow-xs hover:shadow-sm transition-all flex flex-col justify-center gap-2.5"
              >
                {/* Title & Delete button */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: project.color }}
                    />
                    <h3 className="font-medium text-[#243336] text-sm sm:text-[15px] truncate">
                      {project.title}
                    </h3>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteProject(project.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#A0B9BC] hover:text-[#C74B40] transition-opacity cursor-pointer shrink-0"
                    title="Projeyi Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Sadece Loading Bar - Tıklayınca Yapılacaklar Açılır */}
                <div
                  onClick={() => setActiveProjectForEdit(project)}
                  className="relative w-full h-4 sm:h-4.5 bg-[#EDF4F5] rounded-full overflow-hidden p-0.5 cursor-pointer border border-[#DAE8EA] hover:border-[#B8D7DA] transition-all hover:scale-[1.01]"
                  title="Yapılacakları yönetmek için tıklayın"
                >
                  {/* Fill */}
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: project.color,
                    }}
                  />

                  {/* Segment Dividers if subtasks exist */}
                  {total > 1 && (
                    <div className="absolute inset-0 flex justify-between px-1 pointer-events-none">
                      {Array.from({ length: total - 1 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-[1.5px] h-full bg-white/70"
                          style={{
                            left: `${((i + 1) / total) * 100}%`,
                            position: "absolute",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* YENİ PROJE EKLEME POP-UP MODAL */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="bg-[#FFFFFF] border-2 border-[#94C6CB] p-5 w-full max-w-md shadow-2xl rounded-2xl animate-in zoom-in-95 duration-150 text-left max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[#E8F2F4] mb-3 shrink-0">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#3F8890]" />
                <h3 className="font-serif-title text-base sm:text-lg font-medium text-[#1E4549]">
                  Yeni Proje Başlat
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-[#7B9A9D] hover:text-[#243336] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3.5 overflow-y-auto pr-1">
              {/* Proje Adı */}
              <div>
                <label className="block text-xs font-semibold text-[#456A6E] mb-1">
                  Proje İsmi
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Örn: Portfolyo Web Sitesi, Maket Hazırlığı..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-[#B8D7DA] bg-[#F7FCFC] text-[#243336] text-xs sm:text-sm rounded-lg focus:outline-none focus:border-[#489DA5]"
                />
              </div>

              {/* Renk Seçimi */}
              <div>
                <label className="block text-xs font-semibold text-[#456A6E] mb-1">
                  Vurgu Rengi
                </label>
                <div className="flex items-center gap-2">
                  {PRESET_PROJECT_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setNewColor(c.hex)}
                      className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                        newColor === c.hex
                          ? "scale-125 ring-2 ring-offset-2 ring-[#2A5E64]"
                          : "hover:scale-110"
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Dinamik Alt Başlıklar / Yapılacaklar Listesi */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#456A6E]">
                    Alt Başlıklar / Yapılacaklar (Opsiyonel)
                  </label>
                  <span className="text-[10px] text-[#85A4A7]">Yazdıkça yeni satır açılır</span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-0.5">
                  {dynamicSubtasks.map((taskText, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-[#7C9FA3] w-4 text-right">
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        placeholder={
                          idx === 0
                            ? "1. alt başlığı yazın..."
                            : `${idx + 1}. alt başlığı yazın...`
                        }
                        value={taskText}
                        onChange={(e) => handleSubtaskInputChange(idx, e.target.value)}
                        className="flex-1 px-2.5 py-1.5 border border-[#C5DEDF] bg-[#F9FDFD] text-[#243336] text-xs rounded-md focus:outline-none focus:border-[#489DA5]"
                      />
                      {dynamicSubtasks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSubtaskInput(idx)}
                          className="p-1 text-[#A8C1C3] hover:text-[#C74B40] transition-colors cursor-pointer"
                          title="Satırı Kaldır"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8F2F4] shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#5D8185] hover:bg-[#F2F8F9] rounded-md transition-colors cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="px-4 py-1.5 text-xs font-medium bg-[#2A5E64] text-white hover:bg-[#1E464A] disabled:opacity-40 rounded-md transition-colors cursor-pointer"
                >
                  Projeyi Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROJE DETAY & YAPILACAKLARI YÖNETME POP-UP MODAL (Bara tıklayınca açılan) */}
      {activeProjectForEdit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setActiveProjectForEdit(null)}
        >
          <div
            className="bg-[#FFFFFF] border-2 border-[#94C6CB] p-5 w-full max-w-lg shadow-2xl rounded-2xl animate-in zoom-in-95 duration-150 text-left max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#E8F2F4] mb-3 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: activeProjectForEdit.color }}
                  />
                  <h3 className="font-serif-title text-lg sm:text-xl font-bold text-[#1E4549]">
                    {activeProjectForEdit.title}
                  </h3>
                </div>
                <p className="text-xs text-[#638487] mt-0.5">
                  Yapılacakları işaretleyebilir, yeni adım ekleyebilir veya To-Do listesine
                  gönderebilirsiniz.
                </p>
              </div>

              <button
                onClick={() => setActiveProjectForEdit(null)}
                className="p-1 text-[#7B9A9D] hover:text-[#243336] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress status */}
            <div className="mb-3 shrink-0">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-[#486B6F]">İlerleme Durumu</span>
                <span
                  className="font-bold"
                  style={{ color: activeProjectForEdit.color }}
                >
                  {activeProjectForEdit.milestones.length > 0
                    ? `%${Math.round(
                        (activeProjectForEdit.milestones.filter((m) => m.completed).length /
                          activeProjectForEdit.milestones.length) *
                          100
                      )} (${
                        activeProjectForEdit.milestones.filter((m) => m.completed).length
                      }/${activeProjectForEdit.milestones.length})`
                    : "Alt görev yok"}
                </span>
              </div>

              {/* Bar */}
              <div className="w-full h-3 bg-[#E8F2F3] rounded-full overflow-hidden p-0.5 border border-[#DAE8EA]">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      activeProjectForEdit.milestones.length > 0
                        ? Math.round(
                            (activeProjectForEdit.milestones.filter((m) => m.completed).length /
                              activeProjectForEdit.milestones.length) *
                              100
                          )
                        : 0
                    }%`,
                    backgroundColor: activeProjectForEdit.color,
                  }}
                />
              </div>
            </div>

            {/* Subtasks List */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 mb-3 divide-y divide-[#EDF4F5]">
              {activeProjectForEdit.milestones.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#8BA4A7] italic">
                  Henüz tanımlanmış bir alt görev yok. Aşağıdan ekleyebilirsiniz.
                </div>
              ) : (
                activeProjectForEdit.milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className="flex items-center justify-between gap-2 py-2 hover:bg-[#F8FCFC] px-1 rounded-md transition-colors"
                  >
                    {/* Checkbox and text */}
                    <div
                      onClick={() =>
                        handleToggleMilestone(activeProjectForEdit, milestone.id)
                      }
                      className="flex items-center gap-2.5 flex-1 cursor-pointer min-w-0"
                    >
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center transition-all shrink-0 ${
                          milestone.completed
                            ? "bg-[#2A5E64] text-white"
                            : "border-2 border-[#8BB9BD] hover:border-[#2A5E64] bg-white"
                        }`}
                      >
                        {milestone.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>

                      <span
                        className={`text-xs sm:text-sm leading-snug break-words ${
                          milestone.completed
                            ? "line-through text-[#8FA8AB]"
                            : "text-[#243336]"
                        }`}
                      >
                        {milestone.title}
                      </span>
                    </div>

                    {/* Actions: Send to Todo List & Delete */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* To-Do Liste Gönderme Butonu */}
                      <button
                        type="button"
                        onClick={() =>
                          handleSendMilestoneToTodo(milestone.title, milestone.id)
                        }
                        className={`px-2 py-1 text-[11px] font-medium rounded-md border transition-all flex items-center gap-1 cursor-pointer ${
                          sentSubtaskId === milestone.id
                            ? "bg-[#D8F0E2] text-[#28633B] border-[#B2DEBF]"
                            : "bg-[#F2F8F9] hover:bg-[#E3EFF1] text-[#33686E] border-[#CFE4E6]"
                        }`}
                        title="Bu görevi günlük To-Do listesine ekle"
                      >
                        {sentSubtaskId === milestone.id ? (
                          <>
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Gönderildi</span>
                          </>
                        ) : (
                          <>
                            <ListPlus className="w-3 h-3" />
                            <span>To-Do&apos;ya Gönder</span>
                          </>
                        )}
                      </button>

                      {/* Delete Subtask */}
                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteMilestoneInEdit(activeProjectForEdit, milestone.id)
                        }
                        className="p-1 text-[#A8C1C3] hover:text-[#C74B40] transition-colors cursor-pointer"
                        title="Alt görevi sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add new subtask input inside edit modal */}
            <div className="pt-2 border-t border-[#E8F2F4] flex items-center gap-2 shrink-0">
              <input
                type="text"
                placeholder="Yeni bir alt görev yazın..."
                value={newSubtaskTitleInEdit}
                onChange={(e) => setNewSubtaskTitleInEdit(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddMilestoneInEdit(activeProjectForEdit);
                  }
                }}
                className="flex-1 px-3 py-1.5 border border-[#B8D7DA] bg-[#F7FCFC] text-[#243336] text-xs rounded-lg focus:outline-none focus:border-[#489DA5]"
              />
              <button
                type="button"
                onClick={() => handleAddMilestoneInEdit(activeProjectForEdit)}
                disabled={!newSubtaskTitleInEdit.trim()}
                className="px-3.5 py-1.5 text-xs font-medium bg-[#2A5E64] hover:bg-[#1E464A] text-white disabled:opacity-40 rounded-lg transition-colors cursor-pointer"
              >
                Ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
