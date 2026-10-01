"use client";

import React, { useState, useMemo } from "react";
import { Plus, X, Wallet } from "lucide-react";
import { ExpenseItem } from "@/types";

interface ExpenseTrackerProps {
  expenses: ExpenseItem[];
  onAddExpense: (expense: Omit<ExpenseItem, "id">) => void;
  onDeleteExpense: (id: string) => void;
}

const PRESET_CATEGORIES = [
  { name: "Market", color: "#6E8B74" },
  { name: "Kahve", color: "#D4A373" },
  { name: "Kırtasiye", color: "#B76E79" },
  { name: "Abonelik", color: "#5AA1A8" },
  { name: "Ulaşım", color: "#8E7DBE" },
  { name: "Giyim", color: "#E09F67" },
  { name: "Diğer", color: "#95A5A6" },
];

export default function ExpenseTracker({
  expenses,
  onAddExpense,
}: ExpenseTrackerProps) {
  // Modal state for adding expense
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(PRESET_CATEGORIES[0].name);
  const [customCategory, setCustomCategory] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Group expenses by category
  const categoryTotals = useMemo(() => {
    const map = new Map<string, { total: number; color: string }>();

    expenses.forEach((item) => {
      const existing = map.get(item.category);
      if (existing) {
        existing.total += item.amount;
      } else {
        map.set(item.category, {
          total: item.amount,
          color: item.color || "#5AA1A8",
        });
      }
    });

    return Array.from(map.entries()).map(([category, data]) => ({
      category,
      total: data.total,
      color: data.color,
    }));
  }, [expenses]);

  // Overall Total
  const totalAmount = useMemo(() => {
    return categoryTotals.reduce((sum, item) => sum + item.total, 0);
  }, [categoryTotals]);

  // Sort categories by total descending
  const sortedCategories = useMemo(() => {
    return [...categoryTotals].sort((a, b) => b.total - a.total);
  }, [categoryTotals]);

  // Form submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amountStr.replace(/[^0-9.]/g, ""));
    if (!numAmount || numAmount <= 0) return;

    const catName =
      selectedCategory === "Diğer" && customCategory.trim()
        ? customCategory.trim()
        : selectedCategory;

    const matchedPreset = PRESET_CATEGORIES.find((c) => c.name === selectedCategory);
    const chosenColor = matchedPreset ? matchedPreset.color : "#5AA1A8";

    onAddExpense({
      category: catName,
      amount: numAmount,
      color: chosenColor,
      date: new Date().toISOString().split("T")[0],
    });

    setAmountStr("");
    setCustomCategory("");
    setIsAddModalOpen(false);
  };

  // Daha da büyük SVG Donut hesaplaması (Radius 58, Stroke 22)
  const radius = 58;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;
  const donutSlices = sortedCategories.map((item) => {
    const percent = totalAmount > 0 ? item.total / totalAmount : 0;
    const strokeDasharray = `${percent * circumference} ${circumference}`;
    const strokeDashoffset = -(accumulatedPercent * circumference);
    accumulatedPercent += percent;

    return {
      ...item,
      percent: Math.round(percent * 100),
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="w-full pt-1">
      {/* Başlık */}
      <div className="flex items-center justify-between pb-1.5 mb-2 border-b-2 border-[#BEDCE0]">
        <h2 className="font-serif-title text-lg sm:text-xl font-medium text-[#1E4549] tracking-tight">
          Gider Takibi
        </h2>
      </div>

      {/* Ayrı beyaz dikdörtgen kutu YOK: Sayfa zeminine entegre, ferah ve yan yana */}
      <div className="w-full py-2 flex flex-row items-center justify-between gap-1.5 sm:gap-6 overflow-hidden">
        
        {/* 1. SOLDA: Total Harcanan Para */}
        <div className="flex flex-col justify-center items-start min-w-[75px] sm:min-w-[120px] shrink-0">
          <span className="text-[10px] sm:text-xs text-[#7A9EA2] font-semibold uppercase tracking-wider">
            Total Harcama
          </span>
          <div className="font-serif-title text-xl sm:text-3xl font-bold text-[#1F4549] tracking-tight my-0.5">
            ₺{totalAmount.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
        </div>

        {/* 2. ORTADA: Büyütülmüş Pasta Grafiği (Donut / Pie Chart) */}
        <div className="flex-1 flex items-center justify-center py-1">
          {totalAmount === 0 ? (
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-2 border-dashed border-[#D2E6E8] flex items-center justify-center text-xs text-[#8BA4A7]">
              Veri Yok
            </div>
          ) : (
            <div className="relative w-32 h-32 sm:w-44 sm:h-44 md:w-52 md:h-52 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 150 150">
                {/* Background Track */}
                <circle
                  cx="75"
                  cy="75"
                  r={radius}
                  className="stroke-[#E8F2F3]"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />

                {/* Slices */}
                {donutSlices.map((slice) => {
                  const isHovered = hoveredCategory === slice.category;
                  return (
                    <circle
                      key={slice.category}
                      cx="75"
                      cy="75"
                      r={radius}
                      stroke={slice.color}
                      strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                      strokeDasharray={slice.strokeDasharray}
                      strokeDashoffset={slice.strokeDashoffset}
                      fill="transparent"
                      className="transition-all duration-200 cursor-pointer"
                      onMouseEnter={() => setHoveredCategory(slice.category)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    />
                  );
                })}
              </svg>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
                {hoveredCategory ? (
                  <>
                    <span className="text-[10px] sm:text-xs text-[#7A9EA2] font-medium truncate max-w-[80px]">
                      {hoveredCategory}
                    </span>
                    <span className="font-serif-title text-sm sm:text-base font-bold text-[#1E4549]">
                      %{donutSlices.find((s) => s.category === hoveredCategory)?.percent || 0}
                    </span>
                  </>
                ) : (
                  <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-[#7E9FA3]" />
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3. SAĞDA: Sadece Kategori İsimleri, Renkleri & Artı Butonu */}
        <div className="flex flex-col justify-center items-end shrink-0 pl-1">
          {/* Üstte Artı Ekleme Butonu */}
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-[11px] font-semibold text-[#668B8F] hidden sm:inline">
              Kategoriler
            </span>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="p-1.5 rounded-full bg-[#2A5E64] hover:bg-[#1E464A] text-white shadow-xs transition-colors cursor-pointer"
              title="Yeni Harcama Ekle"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          {/* Sadece Kategori İsimleri ve Renkleri */}
          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-0.5">
            {sortedCategories.length === 0 ? (
              <span className="text-[11px] text-[#8EA9AB] italic">Kategori yok</span>
            ) : (
              sortedCategories.map((item) => (
                <div
                  key={item.category}
                  onMouseEnter={() => setHoveredCategory(item.category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className={`flex items-center gap-2 text-xs sm:text-[13px] transition-colors cursor-pointer select-none ${
                    hoveredCategory === item.category ? "text-[#1E4549] font-semibold" : "text-[#4A6467]"
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate max-w-[85px] sm:max-w-[120px]">
                    {item.category}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* ARTI BUTONUNA TIKLAYINCA AÇILAN HARCAMA EKLEME POP-UP'I */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="bg-[#FFFFFF] border-2 border-[#94C6CB] p-5 w-full max-w-xs shadow-2xl rounded-2xl animate-in zoom-in-95 duration-150 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#E8F2F4] mb-3">
              <h3 className="font-serif-title text-base sm:text-lg font-medium text-[#1E4549]">
                Harcama Ekle
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-[#7B9A9D] hover:text-[#243336] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#476C70] font-semibold mb-1">Kategori</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#B8D7DA] bg-[#F7FCFC] text-[#243336] text-xs rounded-lg focus:outline-none cursor-pointer"
                >
                  {PRESET_CATEGORIES.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCategory === "Diğer" && (
                <div>
                  <label className="block text-[#476C70] font-semibold mb-1">Özel Kategori Adı</label>
                  <input
                    type="text"
                    required
                    placeholder="Kategori adı..."
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-[#B8D7DA] bg-[#F7FCFC] text-[#243336] text-xs rounded-lg focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-[#476C70] font-semibold mb-1">Tutar (₺)</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-xs text-[#6B8F93] font-semibold">
                    ₺
                  </span>
                  <input
                    type="number"
                    step="any"
                    required
                    autoFocus
                    placeholder="0.00"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    className="w-full pl-6 pr-2.5 py-1.5 border border-[#B8D7DA] bg-[#F7FCFC] text-[#243336] text-xs rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E8F2F4]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#5D8185] hover:bg-[#F2F8F9] rounded-lg transition-colors cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={!amountStr}
                  className="px-4 py-1.5 text-xs font-medium bg-[#2A5E64] hover:bg-[#1E464A] text-white disabled:opacity-40 rounded-lg transition-colors cursor-pointer"
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
