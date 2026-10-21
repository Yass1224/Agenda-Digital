import { useState } from 'react';
import type { Task } from '../types/task';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const todayDate = getLocalDateKey(new Date());
  const pendingTasks = tasks.filter((task) => task.scheduledDate !== todayDate);
  const todayTasks = tasks.filter((task) => task.scheduledDate === todayDate);

  function addTask(title: string, duration: string) {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const requestedDuration = Number.parseInt(duration, 10);
    const durationMinutes = requestedDuration > 0 ? requestedDuration : 30;

    setTasks((currentTasks) => [
      ...currentTasks,
      { id: Date.now(), title: trimmedTitle, durationMinutes },
    ]);
  }

  function moveTaskToToday(taskId: number) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, scheduledDate: todayDate } : task,
      ),
    );
  }

  return { pendingTasks, todayTasks, addTask, moveTaskToToday };
}

function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}