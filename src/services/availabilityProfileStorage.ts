import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AvailabilityProfile } from '../types/availabilityProfile';

const AVAILABILITY_PROFILE_KEY = '@agenda-digital/availability-profile';

export async function loadAvailabilityProfile(): Promise<AvailabilityProfile | null> {
  const serializedProfile = await AsyncStorage.getItem(AVAILABILITY_PROFILE_KEY);
  if (!serializedProfile) return null;

  return JSON.parse(serializedProfile) as AvailabilityProfile;
}

export async function saveAvailabilityProfile(
  profile: AvailabilityProfile,
): Promise<void> {
  await AsyncStorage.setItem(AVAILABILITY_PROFILE_KEY, JSON.stringify(profile));
}