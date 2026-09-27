import { TodoItem, CalendarEvent, MemoryBoxData, TimetableItem, BrainDumpData, ExpenseItem, ProjectItem } from "@/types";

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: "cal-1",
    date: new Date().toISOString().split("T")[0],
    title: "Tasarım Sistemi Değerlendirmesi",
    notes: "Aesthetic Life Dashboard font ve renk paleti onaylanacak.",
    color: "#B76E79",
  },
  {
    id: "cal-2",
    date: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    title: "Staj / Proje Başvurusu",
    notes: "Portfolyo ve CV güncellenip PDF formatında gönderilecek.",
    color: "#6E8B74",
  },
  {
    id: "cal-3",
    date: new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0],
    title: "Deniz'in Doğum Günü 🎂",
    notes: "Hediye paketini hazırla, akşam buluşması.",
    color: "#B8860B",
  },
  {
    id: "cal-4",
    date: new Date(Date.now() + 86400000 * 12).toISOString().split("T")[0],
    title: "İspanyolca Seviye Tespit Sınavı",
    notes: "A2 kelime kartlarını tekrar et.",
    color: "#7E7398",
  },
];

export const INITIAL_TODOS: TodoItem[] = [
  {
    id: "todo-cal-1",
    title: "Tasarım Sistemi Değerlendirmesi",
    completed: false,
    isFromCalendar: true,
    date: new Date().toISOString().split("T")[0],
  },
  {
    id: "todo-2",
    title: "Sabah 20 dakika farkındalık ve kahve molası",
    completed: true,
    isFromCalendar: false,
    date: new Date().toISOString().split("T")[0],
  },
  {
    id: "todo-3",
    title: "Minimalist haftalık ders ve etkinlik planını tamamla",
    completed: false,
    isFromCalendar: false,
    date: new Date().toISOString().split("T")[0],
  },
  {
    id: "todo-4",
    title: "Eylül ayı giderlerini gözden geçir ve bütçeyi güncelle",
    completed: false,
    isFromCalendar: false,
    date: new Date().toISOString().split("T")[0],
  },
  {
    id: "todo-5",
    title: "Kitap okuma: Günde 25 sayfa (Kayıp Zamanın İzinde)",
    completed: false,
    isFromCalendar: false,
    date: new Date().toISOString().split("T")[0],
  },
];

export const INITIAL_MEMORY: MemoryBoxData = {
  date: new Date().toISOString().split("T")[0],
  imageUrl: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80",
  caption: "Sakin bir pazar sabahı & kahve kokusu ☕🌿",
};

export const INITIAL_TIMETABLE: TimetableItem[] = [
  {
    id: "time-1",
    title: "Tipografi & UI/UX Tasarım",
    dayOfWeek: 1, // Pazartesi
    startTime: "09:00",
    endTime: "11:00",
    isRecurring: true,
    color: "#E8C5C8",
  },
  {
    id: "time-2",
    title: "Veritabanı Mimarisi & SQL",
    dayOfWeek: 1,
    startTime: "13:00",
    endTime: "15:00",
    isRecurring: true,
    color: "#CBDCEB",
  },
  {
    id: "time-3",
    title: "Yazılım Mühendisliği Stüdyosu",
    dayOfWeek: 2, // Salı
    startTime: "10:00",
    endTime: "12:00",
    isRecurring: true,
    color: "#C5D5C5",
  },
  {
    id: "time-4",
    title: "Proje Ekibi Sync Toplantısı",
    dayOfWeek: 3, // Çarşamba
    startTime: "15:00",
    endTime: "16:00",
    isRecurring: false,
    color: "#E8C98F",
  },
  {
    id: "time-5",
    title: "İleri Algoritmalar & Veri Yapıları",
    dayOfWeek: 4, // Perşembe
    startTime: "11:00",
    endTime: "13:00",
    isRecurring: true,
    color: "#D9CEE8",
  },
  {
    id: "time-6",
    title: "Akademik Danışman Görüşmesi",
    dayOfWeek: 5, // Cuma
    startTime: "14:00",
    endTime: "15:00",
    isRecurring: false,
    color: "#F2D4C2",
  },
];

export const INITIAL_BRAINDUMP: BrainDumpData = {
  date: new Date().toISOString().split("T")[0],
  text: "Bugün daha sade ve yavaş bir tempoda ilerlemek iyi geldi. Proje çizelgesini sadeleştirdikçe zihnimin de ferahladığını hissediyorum. Akşam için hafif bir müzik listesi açıp eskiz defterine birkaç not alacağım...",
  moodEmoji: "🍵",
};

export const INITIAL_EXPENSES: ExpenseItem[] = [
  { id: "exp-1", category: "Market & Organik", amount: 1450, color: "#C5D5C5", date: new Date().toISOString().split("T")[0] },
  { id: "exp-2", category: "Kahve & Kafe", amount: 480, color: "#E8C98F", date: new Date().toISOString().split("T")[0] },
  { id: "exp-3", category: "Kırtasiye & Kitap", amount: 620, color: "#E8C5C8", date: new Date().toISOString().split("T")[0] },
  { id: "exp-4", category: "Abonelikler (SaaS)", amount: 390, color: "#CBDCEB", date: new Date().toISOString().split("T")[0] },
  { id: "exp-5", category: "Ulaşım & Yakıt", amount: 850, color: "#D9CEE8", date: new Date().toISOString().split("T")[0] },
];

export const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: "proj-1",
    title: "Minimalist Portfolyo & Blog Yenilemesi",
    color: "#9E5B63",
    milestones: [
      { id: "m-1", title: "Figma wireframe ve tipografi seçimi", completed: true },
      { id: "m-2", title: "Next.js & Tailwind CSS kurulumu", completed: true },
      { id: "m-3", title: "Projeler ve vaka analizleri içerik metinleri", completed: true },
      { id: "m-4", title: "Mobil responsive ve animasyon cila", completed: false },
      { id: "m-5", title: "Vercel üzerinde canlı yayına alma", completed: false },
    ],
  },
  {
    id: "proj-2",
    title: "İspanyolca B1 Hazırlık",
    color: "#587358",
    milestones: [
      { id: "m-6", title: "300 yeni fiil ve çekim kartları", completed: true },
      { id: "m-7", title: "Haftalık 3 saat podcast dinleme", completed: true },
      { id: "m-8", title: "Deneme sınavı çözümü ve analiz", completed: false },
    ],
  },
  {
    id: "proj-3",
    title: "Minimalist Yaşam Alanı Düzenlemesi",
    color: "#966B24",
    milestones: [
      { id: "m-9", title: "Çalışma masası ve kablo düzeni", completed: true },
      { id: "m-10", title: "Gardırop mevsimlik ayıklama", completed: false },
    ],
  },
];
