import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
  onExtendTask: (taskId: number, additionalMinutes: number) => number;
  onToggleCompleted: (taskId: number) => void;
};

export function TodayAgenda({
  tasks,
  profile,
  onOrganize,
  onExtendTask,
  onToggleCompleted,
}: TodayAgendaProps) {
  const [agendaMessage, setAgendaMessage] = useState('');
  const [isExtensionPanelVisible, setIsExtensionPanelVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [additionalMinutes, setAdditionalMinutes] = useState('30');
  const [extensionError, setExtensionError] = useState('');
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
      setAgendaMessage('Tus tareas se acomodaron en los espacios disponibles.');
    } else {
      setAgendaMessage(
        `${unscheduledCount} ${unscheduledCount === 1 ? 'tarea quedó' : 'tareas quedaron'} sin espacio disponible.`,
      );
    }
  }

  function openExtensionPanel() {
    setSelectedTaskId(tasks[0]?.id ?? null);
    setAdditionalMinutes('30');
    setExtensionError('');
    setIsExtensionPanelVisible(true);
  }

  function handleExtendTask() {
    const parsedAdditionalMinutes = Number.parseInt(additionalMinutes, 10);
    if (!selectedTaskId || !Number.isInteger(parsedAdditionalMinutes) || parsedAdditionalMinutes <= 0) {
      setExtensionError('Elige una tarea e indica una cantidad de minutos mayor que cero.');
      return;
    }

    const unscheduledCount = onExtendTask(selectedTaskId, parsedAdditionalMinutes);
    const unscheduledMessage = unscheduledCount > 0
      ? ` ${unscheduledCount} ${unscheduledCount === 1 ? 'tarea quedó' : 'tareas quedaron'} sin espacio disponible.`
      : '';
    setAgendaMessage(`Se amplió el tiempo de la tarea y se actualizaron los horarios.${unscheduledMessage}`);
    setIsExtensionPanelVisible(false);
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
      <Pressable
        accessibilityRole="button"
        disabled={tasks.length === 0}
        onPress={openExtensionPanel}
        style={({ pressed }) => [
          styles.reorganizeButton,
          tasks.length === 0 && styles.organizeButtonDisabled,
          pressed && tasks.length > 0 && styles.reorganizeButtonPressed,
        ]}
      >
        <Text style={styles.reorganizeButtonText}>Reajustar agenda</Text>
      </Pressable>
      {agendaMessage ? (
        <Text accessibilityLiveRegion="polite" style={styles.organizeMessage}>
          {agendaMessage}
        </Text>
      ) : null}
      <Modal
        animationType="slide"
        onRequestClose={() => setIsExtensionPanelVisible(false)}
        transparent
        visible={isExtensionPanelVisible}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.extensionPanel}>
            <Text style={styles.panelTitle}>Ampliar tiempo de una tarea</Text>
            <Text style={styles.panelDescription}>
              Elige la tarea que necesita más tiempo. Las siguientes se recorrerán para actualizar
              sus horarios.
            </Text>
            <ScrollView
              style={styles.taskOptions}
              showsVerticalScrollIndicator={false}
            >
              {tasks.map((task) => {
                const isSelected = selectedTaskId === task.id;
                return (
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    key={task.id}
                    onPress={() => {
                      setSelectedTaskId(task.id);
                      setExtensionError('');
                    }}
                    style={[
                      styles.taskOption,
                      isSelected && styles.taskOptionSelected,
                    ]}
                  >
                    <View style={styles.taskOptionText}>
                      <Text style={styles.taskOptionTitle}>{task.title}</Text>
                      <Text style={styles.taskOptionCaption}>
                        {task.startTime && task.endTime
                          ? `${task.startTime}–${task.endTime}`
                          : 'Sin horario asignado'}
                        {' · '}{task.durationMinutes} min actuales
                      </Text>
                    </View>
                    <View style={[styles.radio, isSelected && styles.radioSelected]} />
                  </Pressable>
                );
              })}
            </ScrollView>
            <Text style={styles.inputLabel}>Minutos adicionales</Text>
            <TextInput
              accessibilityLabel="Minutos adicionales para la tarea"
              keyboardType="number-pad"
              onChangeText={(value) => {
                setAdditionalMinutes(value.replace(/[^\d]/g, ''));
                setExtensionError('');
              }}
              style={styles.minutesInput}
              value={additionalMinutes}
            />
            {extensionError ? (
              <Text accessibilityRole="alert" style={styles.extensionError}>
                {extensionError}
              </Text>
            ) : null}
            <View style={styles.panelActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setIsExtensionPanelVisible(false)}
                style={styles.cancelPanelButton}
              >
                <Text style={styles.cancelPanelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={handleExtendTask}
                style={styles.confirmExtensionButton}
              >
                <Text style={styles.confirmExtensionText}>Ampliar tiempo</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

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
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: false }}
                accessibilityLabel={`Marcar ${task.title} como completada`}
                onPress={() => onToggleCompleted(task.id)}
                style={({ pressed }) => [
                  styles.checkbox,
                  pressed && styles.checkboxPressed,
                ]}
              />
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
  reorganizeButton: {
    alignItems: 'center',
    backgroundColor: '#E8EDE4',
    borderColor: '#CDD8CC',
    borderRadius: 9,
    borderWidth: 1,
    justifyContent: 'center',
    marginBottom: 10,
    minHeight: 44,
  },
  reorganizeButtonPressed: {
    backgroundColor: '#DCE9DB',
  },
  reorganizeButtonText: {
    color: '#35563F',
    fontSize: 14,
    fontWeight: '700',
  },
  organizeMessage: {
    color: '#35563F',
    fontSize: 12,
    marginBottom: 8,
  },
  modalBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(24, 32, 25, 0.45)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  extensionPanel: {
    backgroundColor: '#F6F5EF',
    borderRadius: 16,
    maxHeight: '85%',
    padding: 20,
    width: '100%',
  },
  panelTitle: {
    color: '#202820',
    fontSize: 20,
    fontWeight: '700',
  },
  panelDescription: {
    color: '#70766D',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },
  taskOptions: {
    marginTop: 14,
    maxHeight: 240,
  },
  taskOption: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E0D7',
    borderRadius: 9,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 8,
    minHeight: 60,
    paddingHorizontal: 12,
  },
  taskOptionSelected: {
    backgroundColor: '#E8EDE4',
    borderColor: '#507056',
  },
  taskOptionText: {
    flex: 1,
    paddingVertical: 9,
  },
  taskOptionTitle: {
    color: '#293129',
    fontSize: 14,
    fontWeight: '600',
  },
  taskOptionCaption: {
    color: '#68756A',
    fontSize: 11,
    marginTop: 3,
  },
  radio: {
    borderColor: '#92968C',
    borderRadius: 10,
    borderWidth: 2,
    height: 20,
    marginLeft: 10,
    width: 20,
  },
  radioSelected: {
    backgroundColor: '#507056',
    borderColor: '#507056',
  },
  inputLabel: {
    color: '#293129',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
  minutesInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E0D7',
    borderRadius: 8,
    borderWidth: 1,
    color: '#202820',
    fontSize: 16,
    marginTop: 7,
    minHeight: 46,
    paddingHorizontal: 12,
  },
  extensionError: {
    color: '#AC3F2D',
    fontSize: 12,
    marginTop: 8,
  },
  panelActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 18,
  },
  cancelPanelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    minHeight: 44,
    paddingHorizontal: 12,
  },
  cancelPanelText: {
    color: '#4E5E50',
    fontSize: 13,
    fontWeight: '600',
  },
  confirmExtensionButton: {
    alignItems: 'center',
    backgroundColor: '#D96543',
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 14,
  },
  confirmExtensionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
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
  checkbox: {
    borderColor: '#D96543',
    borderRadius: 6,
    borderWidth: 2,
    height: 20,
    marginRight: 12,
    width: 20,
  },
  checkboxPressed: {
    opacity: 0.7,
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
