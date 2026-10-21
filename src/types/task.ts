export type Task = {
  id: number;
  title: string;
  durationMinutes: number;
  completed: boolean;
  scheduledDate?: string;
  startTime?: string;
  endTime?: string;
};