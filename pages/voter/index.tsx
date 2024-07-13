import { useEffect } from 'react';
import router from 'next/router';
import { VotingStatus } from '@/types';
import { useWeb3 } from '@/contexts';

const VoterPage = () => {
  const { votingStatus } = useWeb3();
  useEffect(() => {
    switch (votingStatus) {
      case VotingStatus.CandidateRegistration:
        router.push('/voter/pre');
        break;
      case VotingStatus.Vote:
        router.push('/voter/vote');
        break;
      case VotingStatus.End:
        router.push('/voter/post');
        break;
      default:
        router.push('/voter/pre');
        break;
    }
  }, [votingStatus]);
};

export default VoterPage;
