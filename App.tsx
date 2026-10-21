import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AvailabilityProfileForm } from './src/components/profile/AvailabilityProfileForm';
import { TaskComposer } from './src/components/tasks/TaskComposer';
import { TaskList } from './src/components/tasks/TaskList';
import { useAvailabilityProfile } from './src/hooks/useAvailabilityProfile';
import { useTasks } from './src/hooks/useTasks';

export default function App() {
  const { tasks, addTask } = useTasks();
  const { profile, isLoading, loadError, saveProfile } = useAvailabilityProfile();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.loadingState]}>
        <ActivityIndicator color="#507056" size="large" />
      </SafeAreaView>
    );
  }

  if (!profile || isEditingProfile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        {loadError ? (
          <Text style={styles.storageError}>
            No se pudo leer el perfil guardado. Puedes volver a intentarlo al guardar.
          </Text>
        ) : null}
        <AvailabilityProfileForm
          initialProfile={profile}
          onCancel={profile ? () => setIsEditingProfile(false) : undefined}
          onSave={async (nextProfile) => {
            await saveProfile(nextProfile);
            setIsEditingProfile(false);
            setShowSavedMessage(true);
          }}
        />
      </SafeAreaView>
    );
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
          <View style={styles.headerActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Editar horario fijo"
              onPress={() => {
                setShowSavedMessage(false);
                setIsEditingProfile(true);
              }}
              style={styles.editButton}
            >
              <Text style={styles.editButtonText}>Horario</Text>
            </Pressable>
            <View style={styles.countBadge}>
              <Text style={styles.count}>{tasks.length}</Text>
            </View>
          </View>
        </View>
        {showSavedMessage ? (
          <Text accessibilityRole="alert" style={styles.savedMessage}>
            Horario fijo guardado correctamente.
          </Text>
        ) : null}
        <TaskComposer onAddTask={addTask} />
        <TaskList tasks={tasks} />
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
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
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
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  editButton: {
    borderColor: '#CDD8CC',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    marginRight: 10,
    minHeight: 40,
    paddingHorizontal: 12,
  },
  editButtonText: {
    color: '#35563F',
    fontSize: 13,
    fontWeight: '600',
  },
  savedMessage: {
    color: '#35563F',
    fontSize: 13,
    marginBottom: 12,
    marginTop: -12,
  },
  storageError: {
    backgroundColor: '#FFF0E8',
    color: '#8E3D2B',
    fontSize: 13,
    lineHeight: 19,
    marginHorizontal: 24,
    marginTop: 20,
    padding: 12,
  },
});