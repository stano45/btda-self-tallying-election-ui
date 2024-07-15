import { useState, useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import { useCrypto, useWeb3 } from '@/contexts';
import { getVoterKeys } from '@/crypto/crypto';
import { BNtoBase10String, BPtoBase10Array } from '@/transformers/transformers';

export const useRegisterVoter = () => {
  const { contract, selectedAccount } = useWeb3();
  const { keyPair } = useCrypto();
  const [loading, setLoading] = useState<boolean>(false);

  const registerVoter = useCallback(
    async (candidateCount: number): Promise<boolean> => {
      if (!contract || !selectedAccount || !keyPair) return false;

      setLoading(true);
      try {
        const _pubKeys = BPtoBase10Array(keyPair.publicKey);
        const voterKeys = getVoterKeys(keyPair, candidateCount);
        const _pubKeyForCandidates = voterKeys.map(BNtoBase10String);

        await contract.methods
          .registerVoter(_pubKeys, _pubKeyForCandidates)
          .send({ from: selectedAccount.name, gas: '1000000', gasPrice: 1000000000 });

        notifications.show({
          title: 'Registration successful',
          message: `Voter  ${selectedAccount.name} registered successfully`,
          color: 'blue',
        });

        return true;
      } catch (error: any) {
        // eslint-disable-next-line no-console
        console.error('Error registering voter', error);
        notifications.show({
          title: 'Registration failed',
          message: `Failed to register voter ${selectedAccount.name}: ${error}`,
          color: 'red',
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [contract, keyPair, selectedAccount]
  );

  return { registerVoter, loading };
};
