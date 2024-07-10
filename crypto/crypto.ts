import { ec as EC, curve } from 'elliptic';
import secureRandom from 'secure-random';
import BN from 'bn.js';

import abi from 'ethereumjs-abi';
import { keccak256 } from 'ethereumjs-util';

const group = new EC('p256');

interface KeyPair {
    publicKey: curve.base.BasePoint;
    privateKey: BN;
}

interface DerivedKey {
    x: BN;
    y: curve.base.BasePoint;
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

export function keyDerive(privateKey: BN, candidateId: number): DerivedKey {
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
