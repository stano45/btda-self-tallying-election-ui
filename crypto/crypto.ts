import { ec as EC } from 'elliptic';
import secureRandom from 'secure-random';
import BN from 'bn.js';

import abi from 'ethereumjs-abi';
import { keccak256 } from 'ethereumjs-util';
import {
  BP,
  CommitArgs,
  DerivedKey,
  KeyPair,
  PiArrayElement,
  PiType,
  PrivateKey,
  PublicKey,
  VoterKeys,
  ZKPoK1Result,
  ZKPoK2Result,
} from '@/types';

const GROUP = new EC('secp256k1');
const MIN_SCORE = 0;
const MAX_SCORE = 5;

export function keyGen(): KeyPair {
  const key = GROUP.genKeyPair();
  const publicKey = key.getPublic();
  const privateKey = key.getPrivate();
  return { publicKey, privateKey }; // publicKey -- BasePoint, private -- BN
}

export function getRand(): BN {
  if (!GROUP.n) {
    throw new Error('Group is not initialized');
  }
  const buf = secureRandom.randomBuffer(GROUP.n.bitLength());
  return new BN(buf).mod(GROUP.n);
}

export function keyDerive(privateKey: PrivateKey, candidateId: number): DerivedKey {
  if (!GROUP.n) {
    throw new Error('Group is not initialized');
  }
  const r = getRand();
  const data = [privateKey, candidateId, r];
  const input = abi.rawEncode(['uint256[3]'], [data]);
  let x = new BN(keccak256(input));
  x = x.mod(GROUP.n);
  const y = GROUP.g.mul(x);
  return { x, y }; // x_i -- BigNumber, y_i -- point on elliptic curve
}

export function getW(publicKeys: PublicKey[], i: number) {
  let W_top = GROUP.g.add(GROUP.g.neg());
  let W_bot = GROUP.g.add(GROUP.g.neg());
  for (let j = 0; j < i; j += 1) {
    W_top = W_top.add(publicKeys[j]);
  }
  for (let j = i + 1; j < publicKeys.length; j += 1) {
    W_bot = W_bot.add(publicKeys[j]);
  }
  return W_top.add(W_bot.neg());
}

export function toPos(n: BN) {
  if (!GROUP.n) {
    throw new Error('Group is not initialized');
  }
  if (n.isNeg()) {
    n = n.add(GROUP.n);
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
      randKeys.push(GROUP.genKeyPair().getPublic());
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
): ZKPoK1Result {
  if (!GROUP.n) {
    throw new Error('Group is not initialized');
  }
  const newKey = GROUP.genKeyPair();
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
    let a_k: BP;
    let b_k: BP;
    if (i !== point) {
      a_k = GROUP.g.mul(e_k).add(xi.mul(d_k));
      b_k = W_i.mul(e_k).add(nu.add(GROUP.g.mul(point).neg()).mul(d_k));
    } else {
      a_k = GROUP.g.mul(rho);
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
  c = c.mod(GROUP.n);
  let dsum = new BN(0);
  for (let i = minScore; i <= maxScore; i += 1) {
    if (i !== point) {
      dsum = dsum.add(ds[i - minScore]).mod(GROUP.n);
    }
  }
  let d_j = c.sub(dsum).mod(GROUP.n);
  if (d_j.isNeg()) {
    d_j = d_j.add(GROUP.n);
  }
  let e_j = rho.sub(s.mul(d_j)).mod(GROUP.n);
  if (e_j.isNeg()) {
    e_j = e_j.add(GROUP.n);
  }
  let X_new_new = X_new.sub(c.mul(privateKey).mod(GROUP.n)).mod(GROUP.n);
  if (X_new_new.isNeg()) {
    X_new_new = X_new_new.add(GROUP.n);
  }
  const pi: PiType = {
    xi,
    nu,
    c,
    piArray: [],
  };
  for (let i = minScore; i <= maxScore; i += 1) {
    const piArrayElement: PiArrayElement = {
      a: as[i - minScore],
      b: bs[i - minScore],
      d: ds[i - minScore],
      e: es[i - minScore],
    };
    if (i === point) {
      piArrayElement.d = d_j;
      piArrayElement.e = e_j;
    }
    pi.piArray.push(piArrayElement);
  }
  return { pi, X_new_new, Y_new };
}

export function ZKPoK2(
  publicKeys: PublicKey[],
  xis: BP[],
  nus: BP[],
  ss: BN[],
  myNumber: number,
  candidatesNumber: number
): ZKPoK2Result {
  if (!GROUP.n) {
    throw new Error('Group is not initialized');
  }
  let s_sum = new BN(0);
  const W = getW(publicKeys, myNumber);
  for (let i = 0; i < candidatesNumber; i += 1) {
    const s = getRand();
    s_sum = s_sum.add(s).mod(GROUP.n);
  }
  const p_xi_new = GROUP.g.mul(s_sum);
  const p_nu_new = W.mul(s_sum);
  let p_xi = GROUP.g.add(GROUP.g.neg());
  let p_nu = GROUP.g.add(GROUP.g.neg());
  for (let i = 0; i < xis.length; i += 1) {
    p_xi = p_xi.add(xis[i]);
  }
  for (let i = 0; i < nus.length; i += 1) {
    p_nu = p_nu.add(nus[i]);
  }
  const data = [
    p_xi.getX(),
    p_xi.getY(),
    p_xi_new.getX(),
    p_xi_new.getY(),
    p_nu.getX(),
    p_nu.getY(),
    p_nu_new.getX(),
    p_nu_new.getY(),
  ];
  const input = abi.rawEncode(['uint[8]'], [data]);
  const c = new BN(keccak256(input)).mod(GROUP.n);
  let s_ss = new BN(0);
  for (let i = 0; i < ss.length; i += 1) {
    s_ss = s_ss.add(ss[i]);
  }
  let s_s_new = s_sum.sub(c.mul(s_ss)).mod(GROUP.n);
  if (s_s_new.isNeg()) {
    s_s_new = s_s_new.add(GROUP.n);
  }
  return { p_xi, p_xi_new, p_nu, p_nu_new, s_s_new, c };
}

export function getCommitArgs(
  privateKey: PrivateKey,
  points: number[],
  votersPublicKeys: PublicKey[],
  myNumber: number,
  numCandidates: number
): CommitArgs {
  // let A = group.g.add(group.g.neg())
  // for (let i = 0; i < votersPublicKeys.length; i += 1) {
  //     if (i !== myNumber) {
  //         A = A.add(votersPublicKeys[i]);
  //     }
  // }
  const A = getW(votersPublicKeys, myNumber);
  const ss = [];
  const xis = [];
  const nus = [];
  const C = [];
  const w_i = getW(votersPublicKeys, myNumber);
  for (let i = 0; i < numCandidates; i += 1) {
    const s = getRand();
    const xi = GROUP.g.mul(s);
    const nu = GROUP.g.mul(points[i]).add(A.mul(s));
    ss.push(s);
    xis.push(xi);
    nus.push(nu);
    C.push({ xi, nu });
  }

  const proof1: PiType[] = [];
  for (let i = 0; i < numCandidates; i += 1) {
    const { pi } = ZKPoK1(
      privateKey,
      ss[i],
      C[i].xi,
      C[i].nu,
      points[i],
      i,
      votersPublicKeys,
      myNumber,
      MIN_SCORE,
      MAX_SCORE
    );
    proof1.push(pi);
  }
  const proof2 = ZKPoK2(votersPublicKeys, xis, nus, ss, myNumber, numCandidates);

  return { xis, nus, proof1, proof2, w_i };
}
