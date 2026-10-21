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
  AvailabilityBlock,
  AvailabilityProfile,
} from '../../types/availabilityProfile';

type AvailabilityProfileFormProps = {
  initialProfile: AvailabilityProfile | null;
  onCancel?: () => void;
  onSave: (profile: AvailabilityProfile) => Promise<void>;
};

const DEFAULT_BLOCKS: AvailabilityBlock[] = [
  { id: 'work', label: 'Trabajo', start: '09:00', end: '17:00' },
  { id: 'sleep', label: 'Sueño', start: '22:00', end: '06:00' },
  { id: 'breakfast', label: 'Desayuno', start: '07:00', end: '07:30' },
  { id: 'lunch', label: 'Comida', start: '13:00', end: '14:00' },
  { id: 'dinner', label: 'Cena', start: '20:00', end: '20:30' },
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
  const [blocks, setBlocks] = useState<AvailabilityBlock[]>(
    () => initialProfile?.blocks.map((block) => ({ ...block })) ?? DEFAULT_BLOCKS,
  );
  const [activityName, setActivityName] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  function updateBlock(
    blockId: string,
    field: 'label' | 'start' | 'end',
    value: string,
  ) {
    const nextValue =
      field === 'label'
        ? value
        : (() => {
            const digits = value.replace(/[^\d]/g, '').slice(0, 4);
            return digits.length > 2
              ? `${digits.slice(0, 2)}:${digits.slice(2)}`
              : digits;
          })();

    setBlocks((currentBlocks) =>
      currentBlocks.map((block) =>
        block.id === blockId ? { ...block, [field]: nextValue } : block,
      ),
    );
    setError('');
  }

  function addActivity() {
    const label = activityName.trim();
    if (!label) {
      setError('Escribe el nombre de la actividad que quieres agregar.');
      return;
    }

    setBlocks((currentBlocks) => [
      ...currentBlocks,
      {
        id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        label,
        start: '18:00',
        end: '19:00',
      },
    ]);
    setActivityName('');
    setError('');
  }

  function removeActivity(blockId: string) {
    setBlocks((currentBlocks) => currentBlocks.filter((block) => block.id !== blockId));
    setError('');
  }

  async function handleSave() {
    const hasInvalidBlock = blocks.some(
      (block) =>
        !block.label.trim() ||
        !isValidTime(block.start) ||
        !isValidTime(block.end),
    );

    if (hasInvalidBlock) {
      setError('Completa cada actividad con un nombre y horas válidas en formato 24 h.');
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      await onSave({
        blocks: blocks.map((block) => ({ ...block, label: block.label.trim() })),
        savedAt: new Date().toISOString(),
      });
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
          Agrega las actividades que ocupan tu día y elimina las que no necesites. Se tomarán
          en cuenta para organizar tus tareas.
        </Text>

        <View style={styles.blocks}>
          {blocks.map((block) => (
            <View key={block.id} style={styles.blockCard}>
              <View style={styles.blockHeading}>
                <TextInput
                  accessibilityLabel="Nombre de la actividad"
                  onChangeText={(value) => updateBlock(block.id, 'label', value)}
                  placeholder="Nombre de actividad"
                  placeholderTextColor="#85877F"
                  style={styles.blockLabelInput}
                  value={block.label}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Eliminar ${block.label}`}
                  onPress={() => removeActivity(block.id)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>Eliminar</Text>
                </Pressable>
              </View>
              <View style={styles.timeRange}>
                <TextInput
                  accessibilityLabel={`${block.label}, hora de inicio`}
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                  onChangeText={(value) => updateBlock(block.id, 'start', value)}
                  placeholder="09:00"
                  placeholderTextColor="#85877F"
                  style={styles.timeInput}
                  value={block.start}
                />
                <Text style={styles.toLabel}>a</Text>
                <TextInput
                  accessibilityLabel={`${block.label}, hora de fin`}
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                  onChangeText={(value) => updateBlock(block.id, 'end', value)}
                  placeholder="17:00"
                  placeholderTextColor="#85877F"
                  style={styles.timeInput}
                  value={block.end}
                />
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.addHeading}>Agregar actividad fija</Text>
        <View style={styles.addActivityRow}>
          <TextInput
            accessibilityLabel="Nombre de nueva actividad"
            onChangeText={setActivityName}
            onSubmitEditing={addActivity}
            placeholder="Ej. Gimnasio"
            placeholderTextColor="#85877F"
            returnKeyType="done"
            style={styles.activityInput}
            value={activityName}
          />
          <Pressable
            accessibilityRole="button"
            onPress={addActivity}
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>Agregar</Text>
          </Pressable>
        </View>
        <Text style={styles.addHint}>La nueva actividad inicia de 18:00 a 19:00; puedes cambiarlo.</Text>

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
    marginTop: 20,
  },
  blockCard: {
    borderBottomColor: '#E2E2D9',
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  blockHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },
  blockLabelInput: {
    color: '#293129',
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 6,
  },
  removeButton: {
    justifyContent: 'center',
    minHeight: 36,
    paddingHorizontal: 8,
  },
  removeButtonText: {
    color: '#AC3F2D',
    fontSize: 12,
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
  addHeading: {
    color: '#293129',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 24,
  },
  addActivityRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  activityInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E0D7',
    borderRadius: 8,
    borderWidth: 1,
    color: '#202820',
    flex: 1,
    fontSize: 15,
    minHeight: 46,
    paddingHorizontal: 12,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: '#E8EDE4',
    borderRadius: 8,
    justifyContent: 'center',
    marginLeft: 8,
    paddingHorizontal: 14,
  },
  addButtonText: {
    color: '#35563F',
    fontSize: 13,
    fontWeight: '700',
  },
  addHint: {
    color: '#85877F',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 7,
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
