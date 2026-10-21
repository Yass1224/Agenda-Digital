import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { AvailabilityProfile } from '../../types/availabilityProfile';
import type { Task } from '../../types/task';
import {
  formatTime,
  getFixedScheduleBlocks,
  timeToMinutes,
  type ScheduleBlock,
} from '../../utils/daySchedule';

const HOUR_HEIGHT = 60;
const DAY_HEIGHT = 24 * HOUR_HEIGHT;

type TodayAgendaProps = {
  tasks: Task[];
  profile: AvailabilityProfile;
  onOrganize: () => number;
};

export function TodayAgenda({ tasks, profile, onOrganize }: TodayAgendaProps) {
  const [organizeMessage, setOrganizeMessage] = useState('');
  const todayLabel = new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());
  const scheduleBlocks: ScheduleBlock[] = [
    ...getFixedScheduleBlocks(profile),
    ...tasks.flatMap((task) => {
      if (!task.startTime || !task.endTime) return [];
      return [{
        label: task.title,
        startMinute: timeToMinutes(task.startTime),
        endMinute: timeToMinutes(task.endTime),
        kind: 'task' as const,
        taskId: task.id,
      }];
    }),
  ];

  function handleOrganize() {
    const unscheduledCount = onOrganize();
    if (unscheduledCount === 0) {
      setOrganizeMessage('Tus tareas se acomodaron en los espacios disponibles.');
    } else {
      setOrganizeMessage(
        `${unscheduledCount} ${unscheduledCount === 1 ? 'tarea quedó' : 'tareas quedaron'} sin espacio disponible.`,
      );
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.listHeading}>
        <View>
          <Text style={styles.sectionTitle}>Agenda de hoy</Text>
          <Text style={styles.sectionCaption}>{todayLabel}</Text>
        </View>
        <Text style={styles.sectionCaption}>
          {tasks.length} {tasks.length === 1 ? 'TAREA' : 'TAREAS'}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        disabled={tasks.length === 0}
        onPress={handleOrganize}
        style={({ pressed }) => [
          styles.organizeButton,
          tasks.length === 0 && styles.organizeButtonDisabled,
          pressed && tasks.length > 0 && styles.organizeButtonPressed,
        ]}
      >
        <Text style={styles.organizeButtonText}>Organizar día</Text>
      </Pressable>
      {organizeMessage ? (
        <Text accessibilityLiveRegion="polite" style={styles.organizeMessage}>
          {organizeMessage}
        </Text>
      ) : null}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.timelineTitle}>Horario de 24 horas</Text>
        <View style={styles.timeline}>
          {Array.from({ length: 25 }, (_, hour) => (
            <View
              key={hour}
              style={[styles.hourRow, { top: hour * HOUR_HEIGHT }]}
            >
              <Text style={styles.hourLabel}>
                {hour === 24 ? '24:00' : `${String(hour).padStart(2, '0')}:00`}
              </Text>
              <View style={styles.hourLine} />
            </View>
          ))}
          {scheduleBlocks.map((block, index) => {
            const duration = block.endMinute - block.startMinute;
            return (
              <View
                key={block.taskId === undefined
                  ? `${block.label}-${block.startMinute}-${index}`
                  : `task-${block.taskId}`}
                style={[
                  styles.scheduleBlock,
                  block.kind === 'task' ? styles.taskBlock : styles.fixedBlock,
                  {
                    height: Math.max(duration, 28),
                    top: block.startMinute,
                  },
                ]}
              >
                <Text
                  numberOfLines={1}
                  style={[
                    styles.blockTitle,
                    block.kind === 'task' && styles.taskBlockTitle,
                  ]}
                >
                  {block.label}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.blockTime,
                    block.kind === 'task' && styles.taskBlockTime,
                  ]}
                >
                  {formatTime(block.startMinute)}–{formatTime(block.endMinute)}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.taskHeading}>
          <Text style={styles.timelineTitle}>Tareas de hoy</Text>
          <Text style={styles.sectionCaption}>EN ORDEN DE AGENDA</Text>
        </View>
        {tasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Tu día está despejado</Text>
            <Text style={styles.emptyMessage}>
              Mueve una tarea de pendientes para añadirla a tu agenda de hoy.
            </Text>
          </View>
        ) : (
          tasks.map((task, index) => (
            <View key={task.id} style={styles.taskCard}>
              <Text style={styles.taskIndex}>{String(index + 1).padStart(2, '0')}</Text>
              <View style={styles.taskDetails}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskTime}>
                  {task.startTime && task.endTime
                    ? `${task.startTime}–${task.endTime}`
                    : 'Sin espacio disponible'}
                  {'  ·  '}
                  {task.durationMinutes} min
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginTop: 28,
  },
  sectionTitle: {
    color: '#202820',
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  sectionCaption: {
    color: '#85877F',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  organizeButton: {
    alignItems: 'center',
    backgroundColor: '#D96543',
    borderRadius: 9,
    justifyContent: 'center',
    marginBottom: 10,
    minHeight: 46,
  },
  organizeButtonDisabled: {
    backgroundColor: '#B9BDB5',
  },
  organizeButtonPressed: {
    backgroundColor: '#BA5033',
  },
  organizeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  organizeMessage: {
    color: '#35563F',
    fontSize: 12,
    marginBottom: 8,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  timelineTitle: {
    color: '#202820',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  timeline: {
    height: DAY_HEIGHT,
    marginBottom: 24,
    position: 'relative',
  },
  hourRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    height: HOUR_HEIGHT,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  hourLabel: {
    color: '#68756A',
    fontSize: 11,
    fontVariant: ['tabular-nums'],
    paddingTop: 0,
    width: 56,
  },
  hourLine: {
    borderTopColor: '#E1E3DA',
    borderTopWidth: 1,
    flex: 1,
    marginTop: 7,
  },
  scheduleBlock: {
    borderRadius: 6,
    justifyContent: 'center',
    left: 62,
    overflow: 'hidden',
    paddingHorizontal: 7,
    position: 'absolute',
    right: 2,
  },
  fixedBlock: {
    backgroundColor: '#DCE9DB',
    borderLeftColor: '#507056',
    borderLeftWidth: 3,
  },
  taskBlock: {
    backgroundColor: '#F8DED4',
    borderLeftColor: '#D96543',
    borderLeftWidth: 3,
    zIndex: 1,
  },
  blockTitle: {
    color: '#35563F',
    fontSize: 11,
    fontWeight: '700',
  },
  taskBlockTitle: {
    color: '#8E3D2B',
  },
  blockTime: {
    color: '#507056',
    fontSize: 10,
  },
  taskBlockTime: {
    color: '#AC4F37',
  },
  taskHeading: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  taskCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E9E8E1',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 8,
    minHeight: 62,
    paddingHorizontal: 14,
  },
  taskIndex: {
    color: '#92968C',
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    width: 34,
  },
  taskDetails: {
    flex: 1,
    paddingVertical: 10,
  },
  taskTitle: {
    color: '#293129',
    fontSize: 14,
    fontWeight: '600',
  },
  taskTime: {
    color: '#68756A',
    fontSize: 11,
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  emptyTitle: {
    color: '#273329',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 7,
  },
  emptyMessage: {
    color: '#777B72',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
});
