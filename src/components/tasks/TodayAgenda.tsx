import { FlatList, StyleSheet, Text, View } from 'react-native';
import type { Task } from '../../types/task';
import { TaskItem } from './TaskItem';

type TodayAgendaProps = {
  tasks: Task[];
};

export function TodayAgenda({ tasks }: TodayAgendaProps) {
  const todayLabel = new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  return (
    <>
      <View style={styles.listHeading}>
        <View>
          <Text style={styles.sectionTitle}>Agenda de hoy</Text>
          <Text style={styles.sectionCaption}>{todayLabel}</Text>
        </View>
        <Text style={styles.sectionCaption}>
          {tasks.length} {tasks.length === 1 ? 'TAREA' : 'TAREAS'}
        </Text>
      </View>
      <FlatList
        data={tasks}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={tasks.length === 0 ? styles.emptyList : styles.taskList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyMark}>
              <Text style={styles.emptyMarkText}>HOY</Text>
            </View>
            <Text style={styles.emptyTitle}>Tu día está despejado</Text>
            <Text style={styles.emptyMessage}>
              Mueve una tarea de pendientes para añadirla a tu agenda de hoy.
            </Text>
          </View>
        }
        renderItem={({ item, index }) => <TaskItem index={index} task={item} />}
      />
    </>
  );
}

const styles = StyleSheet.create({
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
  taskList: {
    paddingBottom: 24,
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
    fontSize: 11,
    fontWeight: '700',
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
