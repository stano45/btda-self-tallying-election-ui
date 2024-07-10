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
