import { ec as EC, curve } from 'elliptic';
import secureRandom from 'secure-random';
import BN from 'bn.js';

import abi from 'ethereumjs-abi';
import { keccak256 } from 'ethereumjs-util';

const group = new EC('p256');

type BP = curve.base.BasePoint;
type PublicKey = curve.base.BasePoint;
type PrivateKey = BN;

interface KeyPair {
    publicKey: PublicKey;
    privateKey: PrivateKey;
}

interface DerivedKey {
    x: BN;
    y: BP;
}

export function keyGen(): KeyPair {
    const key = group.genKeyPair();
    const publicKey = key.getPublic();
    const privateKey = key.getPrivate();
    return { publicKey, privateKey }; // publicKey -- BasePoint, private -- BN
}

export function getRand(): BN {
    if (!group.n) {
        throw new Error('Group is not initialized');
    }
    const buf = secureRandom.randomBuffer(group.n.bitLength());
    return new BN(buf).mod(group.n);
}

export function keyDerive(privateKey: PrivateKey, candidateId: number): DerivedKey {
    if (!group.n) {
        throw new Error('Group is not initialized');
    }
    const r = getRand();
    const data = [privateKey, candidateId, r];
    const input = abi.rawEncode(['uint256[3]'], [data]);
    let x = new BN(keccak256(input));
    x = x.mod(group.n);
    const y = group.g.mul(x);
    return { x, y }; // x_i -- BigNumber, y_i -- point on elliptic curve
}

export function getW(publicKeys: PublicKey[], i: number) {
    let W_top = group.g.add(group.g.neg());
    let W_bot = group.g.add(group.g.neg());
    for (let j = 0; j < i; j += 1) {
        W_top = W_top.add(publicKeys[j]);
    }
    for (let j = i + 1; j < publicKeys.length; j += 1) {
        W_bot = W_bot.add(publicKeys[j]);
    }
    return W_top.add(W_bot.neg());
}

export function toPos(n: BN) {
    if (!group.n) {
        throw new Error('Group is not initialized');
    }
    if (n.isNeg()) {
        n = n.add(group.n);
    }
    return n;
}
