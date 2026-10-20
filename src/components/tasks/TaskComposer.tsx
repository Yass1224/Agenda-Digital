import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

type TaskComposerProps = {
  onAddTask: (title: string, duration: string) => void;
};

export function TaskComposer({ onAddTask }: TaskComposerProps) {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const hasTitle = Boolean(title.trim());

  function handleSave() {
    if (!hasTitle) return;

    onAddTask(title, duration);
    setTitle('');
    setDuration('');
  }

  return (
    <View style={styles.composer}>
      <TextInput
        accessibilityLabel="Título de la tarea"
        onChangeText={setTitle}
        onSubmitEditing={handleSave}
        placeholder="¿Qué necesitas hacer?"
        placeholderTextColor="#85877F"
        returnKeyType="done"
        style={styles.input}
        value={title}
      />
      <View style={styles.composerFooter}>
        <View style={styles.durationField}>
          <Text style={styles.durationLabel}>DURACIÓN</Text>
          <TextInput
            accessibilityLabel="Duración en minutos"
            keyboardType="number-pad"
            maxLength={4}
            onChangeText={(value) => setDuration(value.replace(/\D/g, ''))}
            placeholder="30 min"
            placeholderTextColor="#85877F"
            returnKeyType="done"
            style={styles.durationInput}
            value={duration}
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Guardar tarea"
          disabled={!hasTitle}
          onPress={handleSave}
          style={({ pressed }) => [
            styles.saveButton,
            !hasTitle && styles.saveButtonDisabled,
            pressed && hasTitle && styles.saveButtonPressed,
          ]}
        >
          <Text style={styles.saveButtonText}>Guardar</Text>
          <Text style={styles.saveArrow}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  composer: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E6E5DD',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  input: {
    color: '#202820',
    fontSize: 16,
    minHeight: 46,
    paddingHorizontal: 4,
  },
  composerFooter: {
    alignItems: 'center',
    borderTopColor: '#E9E8E1',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 10,
  },
  durationField: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  durationLabel: {
    color: '#85877F',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginRight: 8,
  },
  durationInput: {
    color: '#293129',
    fontSize: 14,
    minWidth: 64,
    paddingVertical: 6,
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
});