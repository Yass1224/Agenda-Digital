import { StyleSheet, Text, View } from 'react-native';
import type { Task } from '../../types/task';

type TaskItemProps = {
  index: number;
  task: Task;
};

export function TaskItem({ index, task }: TaskItemProps) {
  return (
    <View style={styles.taskRow}>
      <Text style={styles.taskIndex}>{String(index + 1).padStart(2, '0')}</Text>
      <View style={styles.taskMarker} />
      <Text style={styles.taskTitle}>{task.title}</Text>
      <Text style={styles.taskDuration}>{task.durationMinutes} min</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  taskRow: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E9E8E1',
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 64,
    paddingHorizontal: 14,
  },
  taskIndex: {
    color: '#92968C',
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    width: 34,
  },
  taskMarker: {
    backgroundColor: '#D96543',
    borderRadius: 4,
    height: 8,
    marginRight: 12,
    width: 8,
  },
  taskTitle: {
    color: '#293129',
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    paddingVertical: 14,
  },
  taskDuration: {
    color: '#68756A',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
  },
});