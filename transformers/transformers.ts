import { Candidate, CommitArgs } from '@/types';

export function transformCandidateFromApi(candidate: any): Candidate {
  return {
    id: parseInt(candidate.id, 10),
    name: candidate.name,
    yesVotes: parseInt(candidate.yesVotes, 10),
    noVotes: parseInt(candidate.noVotes, 10),
  };
}

export function transformCommitArgsToSmartContract(args: CommitArgs) {
  return {
    xis: args.xis,
    nus: args.nus,
    proof1: args.proof1,
    proof2: [
      args.proof2.p_xi,
      args.proof2.p_xi_new,
      args.proof2.p_nu,
      args.proof2.p_nu_new,
      args.proof2.s_s_new,
      args.proof2.c,
    ],
    w_i: [args.w_i.getX(), args.w_i.getY()],
  };
}
