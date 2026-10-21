import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  AvailabilityBlock,
  AvailabilityProfile,
  TimeRange,
} from '../types/availabilityProfile';

const AVAILABILITY_PROFILE_KEY = '@agenda-digital/availability-profile';
const LEGACY_BLOCKS = [
  { id: 'work', label: 'Trabajo' },
  { id: 'sleep', label: 'Sueño' },
  { id: 'breakfast', label: 'Desayuno' },
  { id: 'lunch', label: 'Comida' },
  { id: 'dinner', label: 'Cena' },
] as const;

export async function loadAvailabilityProfile(): Promise<AvailabilityProfile | null> {
  const serializedProfile = await AsyncStorage.getItem(AVAILABILITY_PROFILE_KEY);
  if (!serializedProfile) return null;

  return normalizeProfile(JSON.parse(serializedProfile));
}

export async function saveAvailabilityProfile(
  profile: AvailabilityProfile,
): Promise<void> {
  await AsyncStorage.setItem(AVAILABILITY_PROFILE_KEY, JSON.stringify(profile));
}

function normalizeProfile(value: unknown): AvailabilityProfile {
  if (!isRecord(value)) {
    throw new Error('El perfil de horarios guardado no tiene un formato válido.');
  }

  if (Array.isArray(value.blocks)) {
    const blocks = value.blocks.map((block): AvailabilityBlock => {
      if (
        !isRecord(block) ||
        typeof block.id !== 'string' ||
        typeof block.label !== 'string' ||
        typeof block.start !== 'string' ||
        typeof block.end !== 'string'
      ) {
        throw new Error('Uno de los bloques guardados no tiene un formato válido.');
      }
      return { id: block.id, label: block.label, start: block.start, end: block.end };
    });

    if (typeof value.savedAt !== 'string') {
      throw new Error('La fecha del perfil guardado no tiene un formato válido.');
    }
    return { blocks, savedAt: value.savedAt };
  }

  const blocks = LEGACY_BLOCKS.map(({ id, label }): AvailabilityBlock => {
    const range = value[id];
    if (!isTimeRange(range)) {
      throw new Error('El perfil de horarios guardado no tiene un formato válido.');
    }
    return { id, label, start: range.start, end: range.end };
  });

  return {
    blocks,
    savedAt: typeof value.savedAt === 'string' ? value.savedAt : '',
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isTimeRange(value: unknown): value is TimeRange {
  return (
    isRecord(value) &&
    typeof value.start === 'string' &&
    typeof value.end === 'string'
  );
}