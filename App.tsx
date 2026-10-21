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
import { TodayAgenda } from './src/components/tasks/TodayAgenda';
import { useAvailabilityProfile } from './src/hooks/useAvailabilityProfile';
import { useTasks } from './src/hooks/useTasks';

export default function App() {
  const { pendingTasks, todayTasks, addTask, moveTaskToToday, organizeToday } = useTasks();
  const { profile, isLoading, loadError, saveProfile } = useAvailabilityProfile();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [activeScreen, setActiveScreen] = useState<'pending' | 'today'>('pending');

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
            <Text style={styles.heading}>
              {activeScreen === 'pending' ? 'Pendientes' : 'Agenda de hoy'}
            </Text>
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
              <Text style={styles.count}>
                {activeScreen === 'pending' ? pendingTasks.length : todayTasks.length}
              </Text>
            </View>
          </View>
        </View>
        {showSavedMessage ? (
          <Text accessibilityRole="alert" style={styles.savedMessage}>
            Horario fijo guardado correctamente.
          </Text>
        ) : null}
        <View style={styles.screenTabs}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: activeScreen === 'pending' }}
            onPress={() => setActiveScreen('pending')}
            style={[styles.screenTab, activeScreen === 'pending' && styles.screenTabActive]}
          >
            <Text
              style={[
                styles.screenTabText,
                activeScreen === 'pending' && styles.screenTabTextActive,
              ]}
            >
              Pendientes
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: activeScreen === 'today' }}
            onPress={() => setActiveScreen('today')}
            style={[styles.screenTab, activeScreen === 'today' && styles.screenTabActive]}
          >
            <Text
              style={[
                styles.screenTabText,
                activeScreen === 'today' && styles.screenTabTextActive,
              ]}
            >
              Agenda de hoy
            </Text>
          </Pressable>
        </View>
        {activeScreen === 'pending' ? (
          <>
            <TaskComposer onAddTask={addTask} />
            <TaskList onMoveToToday={moveTaskToToday} tasks={pendingTasks} />
          </>
        ) : (
          <TodayAgenda
            onOrganize={() => organizeToday(profile)}
            profile={profile}
            tasks={todayTasks}
          />
        )}
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
  screenTabs: {
    backgroundColor: '#E9E8E1',
    borderRadius: 10,
    flexDirection: 'row',
    marginBottom: 8,
    padding: 4,
  },
  screenTab: {
    alignItems: 'center',
    borderRadius: 7,
    flex: 1,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: 8,
  },
  screenTabActive: {
    backgroundColor: '#FFFFFF',
  },
  screenTabText: {
    color: '#68756A',
    fontSize: 13,
    fontWeight: '600',
  },
  screenTabTextActive: {
    color: '#35563F',
    fontWeight: '700',
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