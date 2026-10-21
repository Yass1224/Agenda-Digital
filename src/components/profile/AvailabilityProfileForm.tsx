import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type {
  AvailabilityBlockKey,
  AvailabilityProfile,
} from '../../types/availabilityProfile';

type AvailabilityProfileFormProps = {
  initialProfile: AvailabilityProfile | null;
  onCancel?: () => void;
  onSave: (profile: AvailabilityProfile) => Promise<void>;
};

const DEFAULT_PROFILE: AvailabilityProfile = {
  work: { start: '09:00', end: '17:00' },
  sleep: { start: '22:00', end: '06:00' },
  breakfast: { start: '07:00', end: '07:30' },
  lunch: { start: '13:00', end: '14:00' },
  dinner: { start: '20:00', end: '20:30' },
  savedAt: '',
};

const BLOCKS: { key: AvailabilityBlockKey; label: string }[] = [
  { key: 'work', label: 'Trabajo' },
  { key: 'sleep', label: 'Sueño' },
  { key: 'breakfast', label: 'Desayuno' },
  { key: 'lunch', label: 'Comida' },
  { key: 'dinner', label: 'Cena' },
];

function isValidTime(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return false;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours < 24 && minutes < 60;
}

export function AvailabilityProfileForm({
  initialProfile,
  onCancel,
  onSave,
}: AvailabilityProfileFormProps) {
  const [profile, setProfile] = useState<AvailabilityProfile>(
    initialProfile ?? DEFAULT_PROFILE,
  );
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  function updateTime(
    block: AvailabilityBlockKey,
    edge: 'start' | 'end',
    value: string,
  ) {
    const normalizedValue = value.replace(/[^\d]/g, '').slice(0, 4);
    const formattedValue =
      normalizedValue.length > 2
        ? `${normalizedValue.slice(0, 2)}:${normalizedValue.slice(2)}`
        : normalizedValue;

    setProfile((currentProfile) => ({
      ...currentProfile,
      [block]: { ...currentProfile[block], [edge]: formattedValue },
    }));
    setError('');
  }

  async function handleSave() {
    const hasInvalidTime = BLOCKS.some(({ key }) => {
      const range = profile[key];
      return !isValidTime(range.start) || !isValidTime(range.end);
    });

    if (hasInvalidTime) {
      setError('Completa cada horario con una hora válida en formato 24 h.');
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      await onSave({ ...profile, savedAt: new Date().toISOString() });
    } catch {
      setError('No se pudo guardar el horario. Inténtalo de nuevo.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>AGENDA DIGITAL / PERFIL INICIAL</Text>
        <Text style={styles.title}>Tus bloques fijos</Text>
        <Text style={styles.description}>
          Define tus horarios habituales. Los usaremos como límites de tu disponibilidad diaria.
        </Text>

        <View style={styles.blocks}>
          {BLOCKS.map(({ key, label }) => (
            <View key={key} style={styles.blockRow}>
              <Text style={styles.blockLabel}>{label}</Text>
              <View style={styles.timeRange}>
                <TextInput
                  accessibilityLabel={`${label}, hora de inicio`}
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                  onChangeText={(value) => updateTime(key, 'start', value)}
                  placeholder="09:00"
                  placeholderTextColor="#85877F"
                  style={styles.timeInput}
                  value={profile[key].start}
                />
                <Text style={styles.toLabel}>a</Text>
                <TextInput
                  accessibilityLabel={`${label}, hora de fin`}
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                  onChangeText={(value) => updateTime(key, 'end', value)}
                  placeholder="17:00"
                  placeholderTextColor="#85877F"
                  style={styles.timeInput}
                  value={profile[key].end}
                />
              </View>
            </View>
          ))}
        </View>

        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}

        <View style={styles.actions}>
          {onCancel ? (
            <Pressable accessibilityRole="button" onPress={onCancel} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
          ) : null}
          <Pressable
            accessibilityRole="button"
            disabled={isSaving}
            onPress={handleSave}
            style={({ pressed }) => [styles.saveButton, pressed && styles.savePressed]}
          >
            <Text style={styles.saveText}>
              {isSaving ? 'Guardando...' : 'Confirmar horario'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 36,
  },
  eyebrow: {
    color: '#68756A',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  title: {
    color: '#202820',
    fontSize: 30,
    fontWeight: '700',
  },
  description: {
    color: '#70766D',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
    maxWidth: 420,
  },
  blocks: {
    marginTop: 30,
  },
  blockRow: {
    alignItems: 'center',
    borderBottomColor: '#E2E2D9',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 68,
  },
  blockLabel: {
    color: '#293129',
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  timeRange: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  timeInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E0D7',
    borderRadius: 8,
    borderWidth: 1,
    color: '#202820',
    fontSize: 15,
    minWidth: 68,
    paddingHorizontal: 8,
    paddingVertical: 10,
    textAlign: 'center',
  },
  toLabel: {
    color: '#85877F',
    fontSize: 13,
    marginHorizontal: 8,
  },
  error: {
    color: '#AC3F2D',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 26,
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    minHeight: 48,
    paddingHorizontal: 16,
  },
  cancelText: {
    color: '#4E5E50',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: '#D96543',
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 18,
  },
  savePressed: {
    backgroundColor: '#BA5033',
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});