import { curve } from 'elliptic';
import BN from 'bn.js';

export interface Candidate {
  name: string;
  id?: number;
  yesVotes?: number;
  noVotes?: number;
}

export enum VotingStatus {
  CandidateRegistration = 0,
  VoterRegistration = 1,
  Commit = 2,
  Vote = 3,
  End = 4,
}

export type BP = curve.base.BasePoint;
export type PublicKey = curve.base.BasePoint;
export type PrivateKey = BN;

export interface KeyPair {
  publicKey: PublicKey;
  privateKey: PrivateKey;
}

export interface DerivedKey {
  x: BN;
  y: BP;
}

export interface VoterKeys {
  xs: BN[];
  ys: BP[];
  randKeys: BP[];
  randVoteKeys: BP[][];
}

export interface PiArrayElement {
  a: BP;
  b: BP;
  d: BN;
  e: BN;
}

export interface PiType {
  xi: BP;
  nu: BP;
  c: BN;
  piArray: PiArrayElement[];
}

export interface ZKPoK1Result {
  pi: PiType;
  X_new_new: BN;
  Y_new: BP;
}

export interface ZKPoK2Result {
  p_xi: BP;
  p_xi_new: BP;
  p_nu: BP;
  p_nu_new: BP;
  s_s_new: BN;
  c: BN;
}

export interface CommitArgs {
  xis: BP[];
  nus: BP[];
  proof1: PiType[];
  proof2: ZKPoK2Result;
  w_i: BP;
}
