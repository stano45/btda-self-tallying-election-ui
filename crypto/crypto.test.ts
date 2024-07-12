import { ec as EC, curve } from 'elliptic';
import BN from 'bn.js';

import { keyGen, getRand, keyDerive, getW, toPos, ZKPoK1, ZKPoK2, getCommitArgs } from './crypto';

describe('Crypto Functions', () => {
  const group = new EC('secp256k1');

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mock('secure-random', () => ({
      randomBuffer: jest.fn(() => Buffer.from('1234567890abcdef1234567890abcdef', 'hex')),
    }));
  });

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
      // Given
      const negativeBN = new BN('-123');

      // When
      const positiveBN = toPos(negativeBN);

      // Then
      expect(positiveBN.isNeg()).toBe(false);
      expect(positiveBN.cmp(new BN('0'))).toBeGreaterThan(0);
    });

    it('should return the same value for a positive BN value', () => {
      // Given
      const positiveBN = new BN('123');

      // When
      const result = toPos(positiveBN);

      // Then
      expect(result.eq(positiveBN)).toBe(true);
    });
  });

  describe('ZKPoK1', () => {
    beforeEach(() => {
      jest.mock('./crypto', () => ({
        getRand: jest.fn(() => new BN('1234567890', 16).toRed(group.curve.red)),
        getW: jest.fn(() => group.keyFromPrivate('abcdef', 'hex').getPublic()),
        genKeyPair: jest.fn(() => group.genKeyPair()),
      }));
    });

    it('calculates the correct outputs with basic inputs', () => {
      // Given
      const privateKey = new BN('1234567890abcdef', 16).toRed(group.curve.red);
      const s = new BN('9876543210abcdef', 16).toRed(group.curve.red);
      const xi = group.keyFromPrivate('abcdef', 'hex').getPublic();
      const nu = group.keyFromPrivate('fedcba', 'hex').getPublic();
      const point = 5;
      const j = 0;
      const votersPublicKeys = [
        group.keyFromPrivate('abcdef', 'hex').getPublic(),
        group.keyFromPrivate('123456', 'hex').getPublic(),
      ];
      const myNumber = 1;
      const minScore = 1;
      const maxScore = 10;

      // When
      const result = ZKPoK1(
        privateKey,
        s,
        xi,
        nu,
        point,
        j,
        votersPublicKeys,
        myNumber,
        minScore,
        maxScore
      );

      // Then
      const expectedPi = [xi, nu, expect.any(BN)];
      for (let i = minScore; i <= maxScore; i += 1) {
        expectedPi.push(expect.any(curve.base.BasePoint));
        expectedPi.push(expect.any(curve.base.BasePoint));
        expectedPi.push(expect.any(BN));
        expectedPi.push(expect.any(BN));
      }
      expect(result.pi).toHaveLength((maxScore - minScore + 1) * 4 + 3);
      expect(result.pi).toEqual(expect.arrayContaining(expectedPi));
    });
  });

  describe('ZKPoK2', () => {
    beforeEach(() => {
      jest.mock('./crypto', () => ({
        getRand: jest.fn(() => new BN('1234567890', 16).toRed(group.curve.red)),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        getW: jest.fn((_publicKeys, _myNumber) =>
          group.keyFromPrivate('abcdef', 'hex').getPublic()
        ),
      }));
    });

    it('calculates the correct outputs with given inputs', () => {
      // Given
      const publicKeys = [
        group.keyFromPrivate('abcdef', 'hex').getPublic(),
        group.keyFromPrivate('123456', 'hex').getPublic(),
      ];
      const xis = [
        group.keyFromPrivate('abcdef', 'hex').getPublic(),
        group.keyFromPrivate('fedcba', 'hex').getPublic(),
      ];
      const nus = [
        group.keyFromPrivate('abcdef', 'hex').getPublic(),
        group.keyFromPrivate('fedcba', 'hex').getPublic(),
      ];
      const ss = [
        new BN('1234567890abcdef', 16).toRed(group.curve.red),
        new BN('9876543210abcdef', 16).toRed(group.curve.red),
      ];
      const myNumber = 1;
      const candidatesNumber = 10;

      // When
      const result = ZKPoK2(publicKeys, xis, nus, ss, myNumber, candidatesNumber);

      // Then
      expect(result).toHaveProperty('p_xi');
      expect(result.p_xi).toBeInstanceOf(curve.base.BasePoint);
      expect(result).toHaveProperty('p_xi_new');
      expect(result.p_xi_new).toBeInstanceOf(curve.base.BasePoint);
      expect(result).toHaveProperty('p_nu');
      expect(result.p_nu).toBeInstanceOf(curve.base.BasePoint);
      expect(result).toHaveProperty('p_nu_new');
      expect(result.p_nu_new).toBeInstanceOf(curve.base.BasePoint);
      expect(result).toHaveProperty('s_s_new');
      expect(result).toHaveProperty('c');
    });
  });

  describe('getCommitArgs', () => {
    beforeEach(() => {
      // Mock functions
      jest.mock('./crypto', () => ({
        getRand: jest.fn(() => new BN('1234567890', 16).toRed(group.curve.red)),
        getW: jest.fn((keys, i) => {
          let W = group.curve.point();
          for (let j = 0; j < keys.length; i += 1) {
            if (j !== i) {
              W = W.add(keys[j]);
            }
          }
          return W;
        }),
        ZKPoK1: jest.fn(() => ({ pi: [expect.any(Object), expect.any(Object), expect.any(BN)] })),
        ZKPoK2: jest.fn(() => ({
          p_xi: expect.any(Object),
          p_xi_new: expect.any(Object),
          p_nu: expect.any(Object),
          p_nu_new: expect.any(Object),
          s_s_new: expect.any(BN),
          c: expect.any(BN),
        })),
      }));
    });

    it('should generate valid commit arguments', () => {
      // Given
      const { privateKey } = keyGen();
      const points = [1, 2, 3];
      const votersPublicKeys = Array.from({ length: 5 }, () => group.genKeyPair().getPublic());
      const myNumber = 2;
      const numCandidates = 3;

      // When
      const result = getCommitArgs(privateKey, points, votersPublicKeys, myNumber, numCandidates);

      // Then
      expect(result.xis).toHaveLength(numCandidates);
      expect(result.nus).toHaveLength(numCandidates);
      expect(result.proof1).toHaveLength(numCandidates);
      expect(result.proof2).toHaveProperty('p_xi');
      expect(result.proof2).toHaveProperty('p_xi_new');
      expect(result.proof2).toHaveProperty('p_nu');
      expect(result.proof2).toHaveProperty('p_nu_new');
      expect(result.proof2).toHaveProperty('s_s_new');
      expect(result.proof2).toHaveProperty('c');
      expect(result.w_i).toBeDefined();
    });
  });
});
