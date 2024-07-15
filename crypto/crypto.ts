import { ec as EC } from 'elliptic';
import secureRandom from 'secure-random';
import BN from 'bn.js';

import abi from 'ethereumjs-abi';
import { keccak256 } from 'ethereumjs-util';
import { BP, CommitArgs, DerivedKey, KeyPair, PrivateKey, PublicKey, ZKPoK2Result } from '@/types';

const GROUP = new EC('bn256');
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
  const input = abi.rawEncode(['uint[3]'], [data]);
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

export function getVoterKeys(keyPair: KeyPair, numCandidates: number): BN[] {
  console.log('Generating voter keys', keyPair, numCandidates);
  const voterKeys: BN[] = [];
  for (let j = 0; j < numCandidates; j += 1) {
    const otherKeys = keyDerive(keyPair.privateKey, j);
    voterKeys.push(otherKeys.y.getX(), otherKeys.y.getY());
  }
  return voterKeys;
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
): BN[] {
  if (!GROUP.n) {
    throw new Error('Group is not initialized');
  }
  console.log('Called ZKPoK1', {
    privateKey,
    s,
    xi,
    nu,
    point,
    j,
    votersPublicKeys,
    myNumber,
    minScore,
    maxScore,
  });
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
    let a_k;
    let b_k;
    if (i !== point) {
      a_k = GROUP.g.mul(e_k).add(xi.mul(d_k));
      b_k = W_i.mul(e_k).add(nu.add(GROUP.g.mul(i).neg()).mul(d_k));
    } else {
      a_k = GROUP.g.mul(rho);
      b_k = W_i.mul(rho);
    }
    console.log('here', {
      i,
      rho,
      W_i,
      a_k,
      b_k,
      d_k,
      e_k,
    });

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
  const pi = [c, X_new_new, Y_new.getX(), Y_new.getY()];
  for (let i = minScore; i <= maxScore; i += 1) {
    pi.push(as[i - minScore].getX());
    pi.push(as[i - minScore].getY());
    pi.push(bs[i - minScore].getX());
    pi.push(bs[i - minScore].getY());
    if (i !== point) {
      pi.push(ds[i - minScore]);
      pi.push(es[i - minScore]);
    } else {
      pi.push(d_j);
      pi.push(e_j);
    }
  }
  return pi;
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
  if (!GROUP.n) {
    throw new Error('Group is not initialized');
  }
  console.log('Called getCommitArgs', {
    privateKey,
    points,
    votersPublicKeys,
    myNumber,
    numCandidates,
  });
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
  const W_i = getW(votersPublicKeys, myNumber);
  for (let i = 0; i < numCandidates; i += 1) {
    const s = getRand();
    const xi = GROUP.g.mul(s);
    const nu = GROUP.g.mul(points[i]).add(A.mul(s));
    ss.push(s);
    xis.push(xi);
    nus.push(nu);
    C.push({ xi, nu });
  }
  console.log('C:', C);
  const proof1: BN[][] = [];
  for (let i = 0; i < numCandidates; i += 1) {
    const pi = ZKPoK1(
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
    const c = pi[0];
    const X_new_new = pi[1];
    const Y_new = GROUP.curve.point(pi[2], pi[3]);
    // check 1
    let p_d = pi[7];
    for (let k = 11; k < pi.length; k += 4) {
      p_d = p_d.add(pi[k]).mod(GROUP.n);
    }
    console.log(`ZPK1 test 1 candidate ${i}: ${c.eq(p_d)}`);

    //check 3
    let check2 = true;
    for (let k = 5; k < pi.length; k += 4) {
      const a = pi[k];
      const d = pi[k + 2];
      const e = pi[k + 3];
      const ge = GROUP.g.mul(e);
      const xid = C[i].xi.mul(d);
      check2 = check2 && a.eq(ge.add(xid));
    }
    console.log(`ZPK1 test 2 candidate ${i}: ${check2}`);

    // //check 3
    let check3 = true;
    for (let k = 6; k < pi.length; k += 6) {
      const b = GROUP.curve.point(pi[k], pi[k + 1]);
      const d = pi[k + 2];
      const e = pi[k + 3];
      const we = W_i.mul(e);
      const pointValue = Math.floor((k - 6) / 6);
      const nugd = C[i].nu.add(GROUP.g.mul(pointValue).neg()).mul(d);
      check3 = check3 && b.eq(we.add(nugd));
    }
    console.log(`ZPK1 test 3 candidate ${i}: ${check3}`);
    //
    //check 4
    // console.log("Check priv pub: " + votersPublicKeys[number].eq(group.g.mul(privateKey)))
    console.log(
      `ZPK1 test 4 candidate ${i}: ${Y_new.eq(votersPublicKeys[myNumber].mul(c).add(GROUP.g.mul(X_new_new)))}`
    );
  }
  const proof2 = ZKPoK2(votersPublicKeys, xis, nus, ss, myNumber, numCandidates);

  return { xis, nus, proof1, proof2, w_i: W_i };
}
