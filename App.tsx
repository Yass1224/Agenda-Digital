import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { TaskComposer } from './src/components/tasks/TaskComposer';
import { TaskList } from './src/components/tasks/TaskList';
import { useTasks } from './src/hooks/useTasks';

export default function App() {
  const { tasks, addTask } = useTasks();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>AGENDA DIGITAL</Text>
            <Text style={styles.heading}>Pendientes</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.count}>{tasks.length}</Text>
          </View>
        </View>
        <TaskComposer onAddTask={addTask} />
        <TaskList tasks={tasks} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F5EF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  eyebrow: {
    color: '#68756A',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 7,
  },
  heading: {
    color: '#202820',
    fontSize: 34,
    fontWeight: '700',
  },
  countBadge: {
    alignItems: 'center',
    backgroundColor: '#DCE9DB',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    minWidth: 44,
    paddingHorizontal: 10,
  },
  count: {
    color: '#35563F',
    fontSize: 16,
    fontWeight: '700',
  },
});