import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Task = {
  id: number;
  title: string;
};

export default function App() {
  const [title, setTitle] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);

  function addTask() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    setTasks((currentTasks) => [
      ...currentTasks,
      { id: Date.now(), title: trimmedTitle },
    ]);
    setTitle('');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>AGENDA DIGITAL</Text>
            <Text style={styles.heading}>Pendientes</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.count}>{tasks.length}</Text>
          </View>
        </View>

        <View style={styles.composer}>
          <TextInput
            accessibilityLabel="Título de la tarea"
            onChangeText={setTitle}
            onSubmitEditing={addTask}
            placeholder="¿Qué necesitas hacer?"
            placeholderTextColor="#85877F"
            returnKeyType="done"
            style={styles.input}
            value={title}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Guardar tarea"
            disabled={!title.trim()}
            onPress={addTask}
            style={({ pressed }) => [
              styles.saveButton,
              !title.trim() && styles.saveButtonDisabled,
              pressed && title.trim() && styles.saveButtonPressed,
            ]}
          >
            <Text style={styles.saveButtonText}>Guardar</Text>
            <Text style={styles.saveArrow}>+</Text>
          </Pressable>
        </View>

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
          renderItem={({ item, index }) => (
            <View style={styles.taskRow}>
              <Text style={styles.taskIndex}>{String(index + 1).padStart(2, '0')}</Text>
              <View style={styles.taskMarker} />
              <Text style={styles.taskTitle}>{item.title}</Text>
            </View>
          )}
        />
      </KeyboardAvoidingView>
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
  composer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E6E5DD',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 64,
    padding: 8,
  },
  input: {
    color: '#202820',
    flex: 1,
    fontSize: 16,
    minHeight: 46,
    paddingHorizontal: 12,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: '#D96543',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: 14,
  },
  saveButtonDisabled: {
    backgroundColor: '#C8C8BE',
  },
  saveButtonPressed: {
    backgroundColor: '#BA5033',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  saveArrow: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '400',
    marginLeft: 7,
  },
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
});
