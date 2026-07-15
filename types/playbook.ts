export interface PlaybookDrop {
  id: string;
  type: 'Audio' | 'Video' | 'Article';
  title: string;
  meta?: string;
  date: string;
  day?: string;
  views?: string;
  color?: string;
  path?: string;
}

export interface PlaybookWeek {
  id: string;
  week: number;
  label: string;
  startDate?: string;
  endDate?: string;
  dateRange: string;
  theme: string;
  drops: PlaybookDrop[];
}