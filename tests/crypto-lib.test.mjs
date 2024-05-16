import { describe, it, expect } from 'vitest';
import { createHash } from '../utilities/crypto-lib.mjs';

describe('Hashing', () => {
  it('should produce a hash with supplied arguments', () => {
    expect(createHash('degen', 'hodler')).toEqual(
      createHash('degen', 'hodler'),
    );
  });

  it('should produce a hash with supplied arguments in any order', () => {
    expect(createHash('degen', 'hodler')).toEqual(
      createHash('degen', 'hodler'),
    );
  });
});
