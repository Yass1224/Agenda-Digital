import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Task } from '../../types/task';

type TaskItemProps = {
  index: number;
  task: Task;
  onMoveToToday?: (taskId: number) => void;
  onToggleCompleted?: (taskId: number) => void;
};

export function TaskItem({
  index,
  task,
  onMoveToToday,
  onToggleCompleted,
}: TaskItemProps) {
  return (
    <View style={styles.taskCard}>
      <View style={styles.taskRow}>
        <Text style={styles.taskIndex}>{String(index + 1).padStart(2, '0')}</Text>
        
        {/* Casilla de verificación interactiva */}
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: !!task.completed }}
          accessibilityLabel={`Marcar ${task.title} como ${
            task.completed ? 'pendiente' : 'completada'
          }`}
          onPress={() => onToggleCompleted?.(task.id)}
          style={({ pressed }) => [
            styles.checkbox,
            task.completed && styles.checkboxCompleted,
            pressed && styles.checkboxPressed,
          ]}
        >
          {task.completed ? <Text style={styles.checkmark}>✓</Text> : null}
        </Pressable>

        <Text
          style={[
            styles.taskTitle,
            task.completed && styles.taskTitleCompleted,
          ]}
        >
          {task.title}
        </Text>
        <Text style={styles.taskDuration}>{task.durationMinutes} min</Text>
      </View>

      {onMoveToToday && !task.completed ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Mover ${task.title} a hoy`}
          onPress={() => onMoveToToday(task.id)}
          style={({ pressed }) => [
            styles.moveButton,
            pressed && styles.moveButtonPressed,
          ]}
        >
          <Text style={styles.moveButtonText}>Mover a hoy</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E9E8E1',
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 14,
  },
  taskRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 64,
  },
  taskIndex: {
    color: '#92968C',
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    width: 34,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: '#D96543',
    borderRadius: 6,
    borderWidth: 2,
    height: 20,
    justifyContent: 'center',
    marginRight: 12,
    width: 20,
  },
  checkboxCompleted: {
    backgroundColor: '#35563F',
    borderColor: '#35563F',
  },
  checkboxPressed: {
    opacity: 0.7,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  taskTitle: {
    color: '#293129',
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    paddingVertical: 14,
  },
  taskTitleCompleted: {
    color: '#92968C',
    textDecorationLine: 'line-through',
  },
  taskDuration: {
    color: '#68756A',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
  },
  moveButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#E8EDE4',
    borderRadius: 7,
    justifyContent: 'center',
    marginBottom: 12,
    minHeight: 38,
    paddingHorizontal: 12,
  },
  moveButtonPressed: {
    backgroundColor: '#DCE9DB',
  },
  moveButtonText: {
    color: '#35563F',
    fontSize: 13,
    fontWeight: '700',
  },
});