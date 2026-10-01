export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  isFromCalendar?: boolean;
  date: string; // YYYY-MM-DD
}

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  notes?: string;
  color?: string; // hex or preset name
  category?: string;
  isDeadline?: boolean;
}

export interface MemoryBoxData {
  date: string;
  imageUrl?: string;
  caption?: string;
}

export interface TimetableItem {
  id: string;
  title: string;
  dayOfWeek: number; // 1 (Mon) - 7 (Sun)
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "11:00"
  isRecurring: boolean; // true = permanent template, false = this week only
  color?: string;
  weekStartDate?: string; // YYYY-MM-DD of Monday for this specific week (if isRecurring is false)
  location?: string;
  description?: string;
}

export interface BrainDumpData {
  date: string;
  text: string;
  moodEmoji?: string;
}

export interface ExpenseItem {
  id: string;
  category: string;
  amount: number;
  color: string;
  date: string; // YYYY-MM-DD
}

export interface ProjectMilestone {
  id: string;
  title: string;
  completed: boolean;
}

export interface ProjectItem {
  id: string;
  title: string;
  color: string;
  milestones: ProjectMilestone[];
}
