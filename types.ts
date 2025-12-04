export interface Exhibition {
  id: string;
  name: string;
  description: string;
  venue: string;
  startDate: string; // ISO Date YYYY-MM-DD
  endDate: string;   // ISO Date YYYY-MM-DD
  startTime?: string;
  endTime?: string;
  sourceUrl?: string;
}

export interface DayCell {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export interface CalendarEventProps {
  event: Exhibition;
  onClick: (event: Exhibition) => void;
  isStart: boolean;
  isEnd: boolean;
  position: number; // Vertical position in the day cell to avoid overlapping
}
