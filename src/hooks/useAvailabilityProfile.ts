import { useEffect, useState } from 'react';
import {
  loadAvailabilityProfile,
  saveAvailabilityProfile as persistAvailabilityProfile,
} from '../services/availabilityProfileStorage';
import type { AvailabilityProfile } from '../types/availabilityProfile';

export function useAvailabilityProfile() {
  const [profile, setProfile] = useState<AvailabilityProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let isActive = true;

    loadAvailabilityProfile()
      .then((savedProfile) => {
        if (isActive) setProfile(savedProfile);
      })
      .catch(() => {
        if (isActive) setLoadError(true);
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  async function saveProfile(nextProfile: AvailabilityProfile) {
    await persistAvailabilityProfile(nextProfile);
    setProfile(nextProfile);
    setLoadError(false);
  }

  return { profile, isLoading, loadError, saveProfile };
}