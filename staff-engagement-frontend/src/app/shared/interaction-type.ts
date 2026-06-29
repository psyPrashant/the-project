import { InteractionType } from '../interactions/interaction.models';

/** Visual style for an interaction-type badge in the "Engage" design (TSP-44). */
export interface InteractionTypeStyle {
  label: string;
  color: string;
  bg: string;
}

const STYLES: Record<InteractionType, InteractionTypeStyle> = {
  [InteractionType.NOTE]: { label: 'Note', color: '#3b5bdb', bg: '#eef1fd' },
  [InteractionType.CALL]: { label: 'Call', color: '#0891b2', bg: '#e6f6fb' },
  [InteractionType.MEETING]: { label: 'Meeting', color: '#15803d', bg: '#e9f6ee' },
  [InteractionType.EMAIL]: { label: 'Email', color: '#7c3aed', bg: '#f3eefe' }
};

const FALLBACK: InteractionTypeStyle = { label: 'Other', color: '#475467', bg: '#f1f3f6' };

/**
 * Badge style for an interaction type. Unknown or future types degrade gracefully to a neutral
 * badge labelled with a humanised form of the raw value, so a new backend enum never breaks the UI.
 */
export function interactionTypeStyle(type: string | null | undefined): InteractionTypeStyle {
  if (!type) {
    return { ...FALLBACK };
  }
  const known = STYLES[type as InteractionType];
  if (known) {
    return known;
  }
  const label = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  return { ...FALLBACK, label };
}
