/**
 * Unit tests for the Colors helper.
 */

import { Colors } from '../src/utils/helpers/colors';

describe('Colors helper', () => {
  it('exposes the expected palette keys', () => {
    expect(Object.keys(Colors).sort()).toEqual(
      ['cardBg', 'mainBg', 'morado', 'white'].sort(),
    );
  });

  it('uses valid hex color values', () => {
    const hexPattern = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
    Object.values(Colors).forEach(value => {
      expect(typeof value).toBe('string');
      expect(value).toMatch(hexPattern);
    });
  });

  it('maps each key to the expected color', () => {
    expect(Colors.morado).toBe('#800080');
    expect(Colors.white).toBe('#fff');
    expect(Colors.mainBg).toBe('#26262E');
    expect(Colors.cardBg).toBe('#35353B');
  });
});
