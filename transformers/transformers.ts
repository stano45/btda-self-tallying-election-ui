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

function convertBPToBN(basePoint: BP): BN {
  return new BN(basePoint.encode('hex', false), 16);
}

export function transformCommitArgsToSmartContract(args: CommitArgs) {
  return {
    xis: args.xis.map(convertBPToBN),
    nus: args.nus.map(convertBPToBN),
    proof1: args.proof1,
    proof2: [
      convertBPToBN(args.proof2.p_xi),
      convertBPToBN(args.proof2.p_xi_new),
      convertBPToBN(args.proof2.p_nu),
      convertBPToBN(args.proof2.p_nu_new),
      args.proof2.s_s_new,
      args.proof2.c,
    ],
    w_i: [args.w_i.getX(), args.w_i.getY()],
  };
}
