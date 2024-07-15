import { useEffect } from 'react';
import router from 'next/router';
import { VotingStatus } from '@/types';
import { useWeb3 } from '@/contexts';

const VoterPage = () => {
  const { votingStatus } = useWeb3();
  useEffect(() => {
    switch (votingStatus) {
      case VotingStatus.RegisterCandidates:
        router.push('/voter/registerCandidates');
        break;
      case VotingStatus.RegisterVoters:
        router.push('/voter/registerVoters');
        break;
      case VotingStatus.Commit:
      case VotingStatus.Vote:
        router.push('/voter/vote');
        break;
      case VotingStatus.End:
        router.push('/voter/results');
        break;
      default:
        router.push('/voter/registerCandidates');
        break;
    }
  }, [votingStatus]);
};

export default VoterPage;
