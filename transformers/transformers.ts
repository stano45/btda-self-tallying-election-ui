import { Candidate } from '@/types';

export function transformCandidateFromApi(candidate: any): Candidate {
  return {
    id: parseInt(candidate.id, 10),
    name: candidate.name,
    yesVotes: parseInt(candidate.yesVotes, 10),
    noVotes: parseInt(candidate.noVotes, 10),
  };
}
