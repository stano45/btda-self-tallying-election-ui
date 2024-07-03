export interface Candidate {
  name: string;
  id?: string;
}

export enum VotingStatus {
  Pre = 0,
  Vote = 1,
  Post = 2,
}
