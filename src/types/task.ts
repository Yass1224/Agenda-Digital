export type Task = {
  id: number;
  title: string;
  durationMinutes: number;
  scheduledDate?: string;
  completed?: boolean;
};