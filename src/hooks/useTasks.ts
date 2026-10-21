import { useState } from 'react';
import type { AvailabilityProfile } from '../types/availabilityProfile';
import type { Task } from '../types/task';
import { organizeTasks } from '../utils/daySchedule';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const todayDate = getLocalDateKey(new Date());

  const pendingTasks = tasks.filter(
    (task) => !task.completed && task.scheduledDate !== todayDate
  );
  const todayTasks = tasks.filter(
    (task) => !task.completed && task.scheduledDate === todayDate
  );

  function addTask(title: string, duration: string) {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const requestedDuration = Number.parseInt(duration, 10);
    const durationMinutes = requestedDuration > 0 ? requestedDuration : 30;

    setTasks((currentTasks) => [
      ...currentTasks,
      { id: Date.now(), title: trimmedTitle, durationMinutes, completed: false },
    ]);
  }

  function moveTaskToToday(taskId: number) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, scheduledDate: todayDate } : task
      )
    );
  }

  function toggleTaskCompleted(taskId: number) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  }

  function organizeToday(profile: AvailabilityProfile) {
    const result = organizeTasks(todayTasks, profile);
    const scheduledTasksById = new Map(result.tasks.map((task) => [task.id, task]));
    setTasks((currentTasks) =>
      currentTasks.map((task) => scheduledTasksById.get(task.id) ?? task),
    );
    return result.unscheduledCount;
  }

  return { pendingTasks, todayTasks, addTask, moveTaskToToday, organizeToday };
}

function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}