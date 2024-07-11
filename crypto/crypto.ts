import { ec as EC } from 'elliptic';
import secureRandom from 'secure-random';
import BN from 'bn.js';

import abi from 'ethereumjs-abi';
import { keccak256 } from 'ethereumjs-util';
import { BP, DerivedKey, KeyPair, PrivateKey, PublicKey, VoterKeys } from '@/types';

const group = new EC('p256');

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

export function getVoterKeys(
  keyPair: KeyPair,
  numCandidates: number,
  numVoters: number,
  myNumber: number
): VoterKeys {
  const xs: BN[] = [];
  const ys: BP[] = [];
  for (let i = 1; i <= numCandidates; i += 1) {
    const { x, y } = keyDerive(keyPair.privateKey, i);
    xs.push(x);
    ys.push(y);
  }
  const randKeys: BP[] = [];
  const randVoteKeys: BP[][] = [];
  for (let i = 0; i < numVoters; i += 1) {
    if (i !== myNumber) {
      randKeys.push(group.genKeyPair().getPublic());
    } else {
      randKeys.push(keyPair.publicKey);
    }
    const inner = [];
    if (i === myNumber) {
      randVoteKeys.push(ys);
    } else {
      for (let j = 1; j <= numVoters; j += 1) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { x, y } = keyDerive(keyPair.privateKey, j);
        // console.log(y)
        inner.push(y);
      }
      randVoteKeys.push(inner);
    }
  }
  return { xs, ys, randKeys, randVoteKeys };
}

export function ZKPoK1(
  privateKey: PrivateKey,
  s: BN,
  xi: BP,
  nu: BP,
  point: number,
  j: number,
  votersPublicKeys: PublicKey[],
  myNumber: number,
  minScore: number,
  maxScore: number
) {
  if (!group.n) {
    throw new Error('Group is not initialized');
  }
  const newKey = group.genKeyPair();
  const X_new = newKey.getPrivate();
  const Y_new = newKey.getPublic();
  const rho = getRand();
  const W_i = getW(votersPublicKeys, myNumber);
  const es = [];
  const ds = [];
  const as = [];
  const bs = [];
  const data = [s, xi.getX(), xi.getY(), nu.getX(), nu.getY()];
  for (let i = minScore; i <= maxScore; i += 1) {
    const e_k = getRand();
    const d_k = getRand();
    let a_k;
    let b_k;
    if (i !== point) {
      a_k = group.g.mul(e_k).add(xi.mul(d_k));
      b_k = W_i.mul(e_k).add(nu.add(group.g.mul(point).neg()).mul(d_k));
    } else {
      a_k = group.g.mul(rho);
      b_k = W_i.mul(rho);
    }
    es.push(e_k);
    ds.push(d_k);
    as.push(a_k);
    bs.push(b_k);
    data.push(a_k.getX());
    data.push(a_k.getY());
    data.push(b_k.getX());
    data.push(b_k.getY());
  }
  const inputSize = (maxScore - minScore + 1) * 4 + 5;
  const input = abi.rawEncode([`uint[${inputSize}]`], [data]);
  let c = new BN(keccak256(input));
  c = c.mod(group.n);
  let dsum = new BN(0);
  for (let i = minScore; i <= maxScore; i += 1) {
    if (i !== point) {
      dsum = dsum.add(ds[i - minScore]).mod(group.n);
    }
  }
  let d_j = c.sub(dsum).mod(group.n);
  if (d_j.isNeg()) {
    d_j = d_j.add(group.n);
  }
  let e_j = rho.sub(s.mul(d_j)).mod(group.n);
  if (e_j.isNeg()) {
    e_j = e_j.add(group.n);
  }
  let X_new_new = X_new.sub(c.mul(privateKey).mod(group.n)).mod(group.n);
  if (X_new_new.isNeg()) {
    X_new_new = X_new_new.add(group.n);
  }
  const pi = [xi, nu, c];
  for (let i = minScore; i <= maxScore; i += 1) {
    pi.push(as[i - minScore]);
    pi.push(bs[i - minScore]);
    if (i !== point) {
      pi.push(ds[i - minScore]);
      pi.push(es[i - minScore]);
    } else {
      pi.push(d_j);
      pi.push(e_j);
    }
  }
  return { pi, X_new_new, Y_new };
}
