import type { AvailabilityProfile } from '../types/availabilityProfile';
import type { Task } from '../types/task';

export type ScheduleBlock = {
  label: string;
  startMinute: number;
  endMinute: number;
  kind: 'fixed' | 'task';
  taskId?: number;
};

type MinuteRange = {
  startMinute: number;
  endMinute: number;
};

export function getFixedScheduleBlocks(profile: AvailabilityProfile): ScheduleBlock[] {
  return profile.blocks.flatMap(({ label, start, end }) => {
    const startMinute = timeToMinutes(start);
    const endMinute = timeToMinutes(end);

    if (startMinute === endMinute) return [];
    if (endMinute > startMinute) {
      return [{ label, startMinute, endMinute, kind: 'fixed' }];
    }

    return [
      ...(endMinute > 0
        ? [{ label, startMinute: 0, endMinute, kind: 'fixed' as const }]
        : []),
      ...(startMinute < 24 * 60
        ? [{
            label,
            startMinute,
            endMinute: 24 * 60,
            kind: 'fixed' as const,
          }]
        : []),
    ];
  });
}

export function organizeTasks(
  tasks: Task[],
  profile: AvailabilityProfile,
): { tasks: Task[]; unscheduledCount: number } {
  return scheduleTasksFrom(tasks, profile, 0);
}

export function reorganizeTasks(
  tasks: Task[],
  profile: AvailabilityProfile,
  startMinute: number,
): { tasks: Task[]; unscheduledCount: number } {
  return scheduleTasksFrom(tasks, profile, startMinute);
}

function scheduleTasksFrom(
  tasks: Task[],
  profile: AvailabilityProfile,
  startMinute: number,
): { tasks: Task[]; unscheduledCount: number } {
  const availableRanges = mergeRanges(
    getFixedScheduleBlocks(profile).map(({ startMinute, endMinute }) => ({
      startMinute,
      endMinute,
    })),
  );
  const freeRanges: MinuteRange[] = [];
  let nextStartMinute = Math.min(Math.max(startMinute, 0), 24 * 60);

  for (const range of availableRanges) {
    const rangeStart = Math.max(range.startMinute, nextStartMinute);
    if (range.endMinute > nextStartMinute && rangeStart > nextStartMinute) {
      freeRanges.push({ startMinute: nextStartMinute, endMinute: rangeStart });
    }
    if (range.endMinute > nextStartMinute) {
      nextStartMinute = range.endMinute;
    }
  }
  if (nextStartMinute < 24 * 60) {
    freeRanges.push({ startMinute: nextStartMinute, endMinute: 24 * 60 });
  }

  let unscheduledCount = 0;
  let currentRangeIndex = 0;
  const scheduledTasks = tasks.map((task) => {
    while (
      currentRangeIndex < freeRanges.length &&
      freeRanges[currentRangeIndex].endMinute - freeRanges[currentRangeIndex].startMinute <
        task.durationMinutes
    ) {
      currentRangeIndex += 1;
    }
    const availableRange = freeRanges[currentRangeIndex];
    if (!availableRange) {
      unscheduledCount += 1;
      return { ...task, startTime: undefined, endTime: undefined };
    }

    const startMinute = availableRange.startMinute;
    const endMinute = startMinute + task.durationMinutes;
    availableRange.startMinute = endMinute;
    return {
      ...task,
      startTime: formatTime(startMinute),
      endTime: formatTime(endMinute),
    };
  });

  return { tasks: scheduledTasks, unscheduledCount };
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function formatTime(minutes: number): string {
  if (minutes === 24 * 60) return '24:00';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}`;
}

function mergeRanges(ranges: MinuteRange[]): MinuteRange[] {
  const sortedRanges = [...ranges].sort((first, second) => first.startMinute - second.startMinute);
  const mergedRanges: MinuteRange[] = [];

  for (const range of sortedRanges) {
    const lastRange = mergedRanges[mergedRanges.length - 1];
    if (!lastRange || range.startMinute > lastRange.endMinute) {
      mergedRanges.push({ ...range });
    } else {
      lastRange.endMinute = Math.max(lastRange.endMinute, range.endMinute);
    }
  }

  return mergedRanges;
}
