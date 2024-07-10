import { ec as EC, curve } from 'elliptic';
import BN from 'bn.js';

import { keyGen, getRand, keyDerive, getW, toPos } from './crypto';

const group = new EC('p256');

jest.mock('secure-random', () => ({
    randomBuffer: jest.fn(() => Buffer.from('1234567890abcdef1234567890abcdef', 'hex')),
}));

describe('Crypto Functions', () => {
    describe('keyGen', () => {
        it('should generate a valid key pair', () => {
            // When
            const { publicKey, privateKey } = keyGen();

            // Then
            expect(publicKey).toBeDefined();
            expect(BN.isBN(privateKey)).toBe(true);
            const isValidPublicKey = group.curve.validate(publicKey);
            expect(isValidPublicKey).toBe(true);
            const isValidPrivateKey = privateKey.cmp(new BN(0)) > 0 && privateKey.cmp(group.n!) < 0;
            expect(isValidPrivateKey).toBe(true);
        });
    });

    describe('getRand', () => {
        it('should generate a random number within the curve order', () => {
            // When
            const rand = getRand();

            // Then
            expect(rand).toBeInstanceOf(BN);
            expect(rand.cmp(new BN(0))).toBeGreaterThan(0);
            expect(rand.cmp(group.n!)).toBeLessThan(0);
        });
    });

    describe('keyDerive', () => {
        it('should derive a valid key', () => {
            // Given
            const { privateKey } = keyGen();
            const candidateId = 123;

            // When
            const { x, y } = keyDerive(privateKey, candidateId);

            // Then
            expect(x).toBeInstanceOf(BN);
            expect(y).toBeInstanceOf(curve.base.BasePoint);
            const isValidDerivedKey = x.cmp(new BN(0)) > 0 && x.cmp(group.n!) < 0;
            expect(isValidDerivedKey).toBe(true);
            const isValidDerivedPoint = group.curve.validate(y);
            expect(isValidDerivedPoint).toBe(true);
        });
    });
    describe('getW', () => {
        it('should compute W correctly', () => {
            // Given
            const keys = Array.from({ length: 5 }, () => group.genKeyPair().getPublic());
            const i = 2;

            // When
            const W = getW(keys, i);

            // Then
            expect(W).toBeDefined();
            expect(W.isInfinity()).toBe(false);
        });
    });
    describe('toPos', () => {
        it('should return a positive equivalent for a negative BN value', () => {
            const negativeBN = new BN('-123');
            const positiveBN = toPos(negativeBN);

            expect(positiveBN.isNeg()).toBe(false);
            expect(positiveBN.cmp(new BN('0'))).toBeGreaterThan(0);
        });

        it('should return the same value for a positive BN value', () => {
            const positiveBN = new BN('123');
            const result = toPos(positiveBN);

            expect(result.eq(positiveBN)).toBe(true);
        });
    });
});
