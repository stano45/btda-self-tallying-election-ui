import { curve } from 'elliptic';
import BN from 'bn.js';

export interface Candidate {
  name: string;
  id?: number;
  yesVotes?: number;
  noVotes?: number;
}

export enum VotingStatus {
  Pre = 0,
  Vote = 1,
  Post = 2,
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
