import { useState } from 'react';
import type { AvailabilityProfile } from '../types/availabilityProfile';
import type { Task } from '../types/task';
import { organizeTasks, reorganizeTasks, timeToMinutes } from '../utils/daySchedule';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const todayDate = getLocalDateKey(new Date());

  const pendingTasks = tasks.filter(
    (task) => !task.completed && task.scheduledDate !== todayDate
  );
  const todayTasks = tasks.filter(
    (task) => !task.completed && task.scheduledDate === todayDate
  );
  const completedTasks = tasks.filter((task) => task.completed);

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

  function extendTodayTask(
    taskId: number,
    additionalMinutes: number,
    profile: AvailabilityProfile,
  ) {
    const now = new Date();
    const currentMinute = now.getHours() * 60 + now.getMinutes();
    const orderedTasks = todayTasks
      .map((task, index) => ({ task, index }))
      .sort((first, second) => {
        const firstStart = first.task.startTime
          ? timeToMinutes(first.task.startTime)
          : Number.POSITIVE_INFINITY;
        const secondStart = second.task.startTime
          ? timeToMinutes(second.task.startTime)
          : Number.POSITIVE_INFINITY;
        return firstStart - secondStart || first.index - second.index;
      })
      .map(({ task }) => task);
    const selectedIndex = orderedTasks.findIndex((task) => task.id === taskId);
    if (selectedIndex === -1) return 0;

    const selectedTask = orderedTasks[selectedIndex];
    const plannedStart = selectedTask.startTime
      ? timeToMinutes(selectedTask.startTime)
      : currentMinute;
    const startMinute = Math.max(plannedStart, currentMinute);
    const tasksToReschedule = orderedTasks.slice(selectedIndex).map((task) =>
      task.id === taskId
        ? { ...task, durationMinutes: task.durationMinutes + additionalMinutes }
        : task,
    );
    const result = reorganizeTasks(tasksToReschedule, profile, startMinute);
    const scheduledTasksById = new Map(result.tasks.map((task) => [task.id, task]));
    setTasks((currentTasks) =>
      currentTasks.map((task) => {
        const rescheduledTask = scheduledTasksById.get(task.id);
        if (rescheduledTask) return rescheduledTask;
        if (task.id === taskId) {
          return { ...task, durationMinutes: task.durationMinutes + additionalMinutes };
        }
        return task;
      }),
    );
    return result.unscheduledCount;
  }

  return {
    pendingTasks,
    todayTasks,
    completedTasks,
    addTask,
    moveTaskToToday,
    toggleTaskCompleted,
    organizeToday,
    extendTodayTask,
  };
}

function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}