import { FlatList, StyleSheet, Text, View } from 'react-native';
import type { Task } from '../../types/task';
import { TaskItem } from './TaskItem';

type TaskListProps = {
  tasks: Task[];
  completedTasks: Task[];
  onMoveToToday: (taskId: number) => void;
  onToggleCompleted: (taskId: number) => void;
};

export function TaskList({
  tasks,
  completedTasks,
  onMoveToToday,
  onToggleCompleted,
}: TaskListProps) {
  return (
    <>
      <View style={styles.listHeading}>
        <Text style={styles.sectionTitle}>Lista general</Text>
        <Text style={styles.sectionCaption}>EN ORDEN DE CAPTURA</Text>
      </View>
      <FlatList
        data={tasks}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={tasks.length === 0 ? styles.emptyList : styles.taskList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyMark}>
              <Text style={styles.emptyMarkText}>+</Text>
            </View>
            <Text style={styles.emptyTitle}>Tu lista empieza aquí</Text>
            <Text style={styles.emptyMessage}>
              Escribe una tarea arriba y guárdala para añadirla a tus pendientes.
            </Text>
          </View>
        }
        ListFooterComponent={
          <View style={styles.completedSection}>
            <View style={styles.completedHeading}>
              <Text style={styles.sectionTitle}>Tareas completadas</Text>
              <Text style={styles.sectionCaption}>
                {completedTasks.length} {completedTasks.length === 1 ? 'TAREA' : 'TAREAS'}
              </Text>
            </View>
            {completedTasks.length === 0 ? (
              <Text style={styles.completedEmptyMessage}>
                Las tareas que marques como completadas aparecerán aquí.
              </Text>
            ) : (
              completedTasks.map((task, index) => (
                <TaskItem
                  index={index}
                  key={task.id}
                  onToggleCompleted={onToggleCompleted}
                  task={task}
                />
              ))
            )}
          </View>
        }
        renderItem={({ item, index }) => (
          <TaskItem index={index} onMoveToToday={onMoveToToday} task={item} />
        )}
      />
    </>
  );
}

const styles = StyleSheet.create({
  listHeading: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginTop: 34,
  },
  sectionTitle: {
    color: '#202820',
    fontSize: 18,
    fontWeight: '700',
  },
  sectionCaption: {
    color: '#85877F',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  taskList: {
    paddingBottom: 24,
  },
  completedSection: {
    paddingBottom: 24,
  },
  completedHeading: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginTop: 20,
  },
  completedEmptyMessage: {
    color: '#777B72',
    fontSize: 13,
    lineHeight: 20,
    paddingBottom: 16,
    paddingTop: 8,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 70,
    paddingHorizontal: 24,
    paddingTop: 70,
  },
  emptyMark: {
    alignItems: 'center',
    backgroundColor: '#E8EDE4',
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    marginBottom: 18,
    width: 56,
  },
  emptyMarkText: {
    color: '#507056',
    fontSize: 30,
    fontWeight: '300',
    lineHeight: 34,
  },
  emptyTitle: {
    color: '#273329',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyMessage: {
    color: '#777B72',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
});