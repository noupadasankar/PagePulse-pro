import type { CheckCategory, CheckId, CheckPriority, MetricCheck, MetricStatus } from '@pagepulse/shared-types';

/**
 * Builds a MetricCheck. Exists so every analyzer produces an identically shaped
 * result and no field is quietly forgotten.
 */
export function buildCheck(input: {
  id: CheckId;
  label: string;
  category: CheckCategory;
  status: MetricStatus;
  value: string | number | boolean | null;
  displayValue: string;
  recommendedValue: string;
  message: string;
  recommendation: string;
  /** Defaults from status: red => high, amber => medium, green => low. */
  priority?: CheckPriority;
  weight: number;
}): MetricCheck {
  const { priority, ...rest } = input;
  return { ...rest, priority: priority ?? defaultPriority(input.status) };
}

function defaultPriority(status: MetricStatus): CheckPriority {
  if (status === 'red') return 'high';
  if (status === 'amber') return 'medium';
  return 'low';
}

/** Picks a status by numeric thresholds, inclusive of each bound. */
export function gradeRange(
  value: number,
  { green, amber }: { green: [number, number]; amber: [number, number] }
): MetricStatus {
  if (value >= green[0] && value <= green[1]) return 'green';
  if (value >= amber[0] && value <= amber[1]) return 'amber';
  return 'red';
}

/** Truncates long extracted text for display without breaking the layout. */
export function truncate(text: string, maxLength = 80): string {
  return text.length <= maxLength ? text : `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
