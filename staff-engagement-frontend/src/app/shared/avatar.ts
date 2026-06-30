/**
 * Deterministic avatar styling for the "Engage" design (TSP-44). The prototype assigned avatar
 * colours by array index; with real data we hash a stable seed (the employee id) so the same
 * person always gets the same colour wherever they are rendered.
 */
const AVATAR_PALETTE = [
  '#3b5bdb',
  '#7c3aed',
  '#0891b2',
  '#15803d',
  '#b45309',
  '#be123c',
  '#0d9488',
  '#6d28d9',
  '#0369a1'
] as const;

/** Pick a stable palette colour for a seed (e.g. an employee id). */
export function avatarColor(seed: string | number | null | undefined): string {
  const value = String(seed ?? '');
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

/** Up to two uppercase initials from a name, or '?' when the name is empty. */
export function initials(name: string | null | undefined): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }
  return parts
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
