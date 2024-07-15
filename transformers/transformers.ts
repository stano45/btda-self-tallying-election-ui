import BN from 'bn.js';
import { BP, Candidate, CommitArgs } from '@/types';

export function transformCandidateFromApi(candidate: any): Candidate {
  return {
    id: parseInt(candidate.id, 10),
    name: candidate.name,
    yesVotes: parseInt(candidate.yesVotes, 10),
    noVotes: parseInt(candidate.noVotes, 10),
  };
}

export function BNtoBase10String(bn: BN): string {
  return bn.toString(10);
}

export function BPtoBase10Array(bp: BP): string[] {
  return [BNtoBase10String(bp.getX()), BNtoBase10String(bp.getY())];
}

export function BPArrayToBase10Array(bpArray: BP[]): string[] {
  const result: string[] = [];
  for (const bp of bpArray) {
    result.push(...BPtoBase10Array(bp));
  }
  return result;
}

export function transformCommitArgsToApi(commitArgs: CommitArgs) {
  return {
    xis: BPArrayToBase10Array(commitArgs.xis),
    nus: BPArrayToBase10Array(commitArgs.nus),
    proof1: commitArgs.proof1.map((proof) => proof.map(BNtoBase10String)),
    //TODO
    proof2: [],
    W_i: BPtoBase10Array(commitArgs.w_i),
  };
}
