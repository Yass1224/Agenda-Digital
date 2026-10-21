export type TimeRange = {
  start: string;
  end: string;
};

export type AvailabilityProfile = {
  work: TimeRange;
  sleep: TimeRange;
  breakfast: TimeRange;
  lunch: TimeRange;
  dinner: TimeRange;
  savedAt: string;
};

export type AvailabilityBlockKey = Exclude<keyof AvailabilityProfile, 'savedAt'>;