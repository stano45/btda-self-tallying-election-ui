import { ec as EC, curve } from 'elliptic';
import BN from 'bn.js';

import { keyGen, getRand, keyDerive } from './crypto';

const group = new EC('p256');

jest.mock('secure-random', () => ({
    randomBuffer: jest.fn(() => Buffer.from('1234567890abcdef1234567890abcdef', 'hex')),
}));

describe('Elliptic Curve Key Generation and Derivation', () => {
    it('should generate a valid key pair', () => {
        const { publicKey, privateKey } = keyGen();

        expect(publicKey).toBeDefined();
        expect(BN.isBN(privateKey)).toBe(true);

        const isValidPublicKey = group.curve.validate(publicKey);
        expect(isValidPublicKey).toBe(true);

        const isValidPrivateKey = privateKey.cmp(new BN(0)) > 0 && privateKey.cmp(group.n!) < 0;
        expect(isValidPrivateKey).toBe(true);
    });

    it('should generate a random number within the curve order', () => {
        const rand = getRand();

        expect(rand).toBeInstanceOf(BN);
        expect(rand.cmp(new BN(0))).toBeGreaterThan(0);
        expect(rand.cmp(group.n!)).toBeLessThan(0);
    });

    it('should derive a valid key', () => {
        const { privateKey } = keyGen();
        const candidateId = 123;
        const { x, y } = keyDerive(privateKey, candidateId);

        expect(x).toBeInstanceOf(BN);
        expect(y).toBeInstanceOf(curve.base.BasePoint);

        const isValidDerivedKey = x.cmp(new BN(0)) > 0 && x.cmp(group.n!) < 0;
        expect(isValidDerivedKey).toBe(true);

        const isValidDerivedPoint = group.curve.validate(y);
        expect(isValidDerivedPoint).toBe(true);
    });
});
