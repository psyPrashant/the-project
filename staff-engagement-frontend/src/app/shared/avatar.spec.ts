import { describe, it, expect } from 'vitest';

import { avatarColor, initials } from './avatar';

describe('avatarColor', () => {
  it('is deterministic for the same seed', () => {
    expect(avatarColor(1)).toBe(avatarColor(1));
    expect(avatarColor('e1')).toBe(avatarColor('e1'));
  });

  it('returns a palette hex colour', () => {
    expect(avatarColor(42)).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('handles null/undefined seeds without throwing', () => {
    expect(avatarColor(null)).toMatch(/^#[0-9a-f]{6}$/);
    expect(avatarColor(undefined)).toMatch(/^#[0-9a-f]{6}$/);
  });
});

describe('initials', () => {
  it('takes up to two uppercase initials', () => {
    expect(initials('Priya Naidoo')).toBe('PN');
    expect(initials('Sarah Jane Coetzee')).toBe('SJ');
  });

  it('handles a single name', () => {
    expect(initials('Madonna')).toBe('M');
  });

  it('falls back to ? for empty input', () => {
    expect(initials('')).toBe('?');
    expect(initials(null)).toBe('?');
    expect(initials('   ')).toBe('?');
  });
});
