export type TimeRange = {
  start: string;
  end: string;
};

export type AvailabilityBlock = TimeRange & {
  id: string;
  label: string;
};

export type AvailabilityProfile = {
  blocks: AvailabilityBlock[];
  savedAt: string;
};
