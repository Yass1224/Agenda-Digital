import { useState } from 'react';
import type { Task } from '../types/task';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);

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

  return { tasks, addTask };
}