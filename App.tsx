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
import { getAvailableMinutes } from './src/utils/daySchedule';

export default function App() {
  const {
    pendingTasks,
    todayTasks,
    completedTasks,
    addTask,
    moveTaskToToday,
    returnTaskToPending,
    toggleTaskCompleted,
    organizeToday,
    extendTodayTask,
  } = useTasks();
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

  const availableMinutes = getAvailableMinutes(todayTasks, profile);

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
            {activeScreen === 'today' ? (
              <View
                accessible
                accessibilityLabel={`Tiempo libre: ${formatAvailableTimeForAccessibility(availableMinutes)}`}
                style={[styles.countBadge, styles.availabilityBadge]}
              >
                <Text style={styles.availabilityValue}>
                  {formatAvailableTime(availableMinutes)}
                </Text>
                <Text style={styles.availabilityLabel}>LIBRES</Text>
              </View>
            ) : (
              <View style={styles.countBadge}>
                <Text style={styles.count}>{pendingTasks.length}</Text>
              </View>
            )}
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
            <TaskList
              tasks={pendingTasks}
              completedTasks={completedTasks}
              onMoveToToday={moveTaskToToday}
            />
          </>
        ) : (
          <TodayAgenda
            onOrganize={() => organizeToday(profile)}
            onExtendTask={(taskId, additionalMinutes) =>
              extendTodayTask(taskId, additionalMinutes, profile)
            }
            onReturnToPending={returnTaskToPending}
            onToggleCompleted={toggleTaskCompleted}
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
  availabilityBadge: {
    borderRadius: 12,
    height: 48,
    minWidth: 68,
    paddingHorizontal: 6,
  },
  availabilityValue: {
    color: '#35563F',
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
  },
  availabilityLabel: {
    color: '#507056',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.6,
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
    marginRight: 6,
    minHeight: 40,
    paddingHorizontal: 8,
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

function formatAvailableTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${remainingMinutes}m`;
  return remainingMinutes === 0
    ? `${hours}h`
    : `${hours}h${String(remainingMinutes).padStart(2, '0')}m`;
}

function formatAvailableTimeForAccessibility(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${remainingMinutes} minutos`;
  if (remainingMinutes === 0) return `${hours} horas`;
  return `${hours} horas y ${remainingMinutes} minutos`;
}