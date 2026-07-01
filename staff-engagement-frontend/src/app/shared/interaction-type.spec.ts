import { describe, it, expect } from 'vitest';

import { interactionTypeStyle } from './interaction-type';
import { InteractionType } from '../interactions/interaction.models';

describe('interactionTypeStyle', () => {
  it('maps known types to a label and colours', () => {
    const meeting = interactionTypeStyle(InteractionType.MEETING);
    expect(meeting.label).toBe('Meeting');
    expect(meeting.color).toMatch(/^#[0-9a-f]{6}$/);
    expect(meeting.bg).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('degrades unknown types to a neutral, humanised badge', () => {
    const style = interactionTypeStyle('WORKSHOP');
    expect(style.label).toBe('Workshop');
    expect(style.color).toBe('#475467');
  });

  it('handles null/undefined without throwing', () => {
    expect(interactionTypeStyle(null).label).toBe('Other');
    expect(interactionTypeStyle(undefined).label).toBe('Other');
  });
});
