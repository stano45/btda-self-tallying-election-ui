import { useState, useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import { useCrypto, useWeb3 } from '@/contexts';
import { getVoterKeys } from '@/crypto/crypto';

export const useRegisterVoter = () => {
  const { contract, selectedAccount, web3 } = useWeb3();
  const { keyPair } = useCrypto();
  const [loading, setLoading] = useState<boolean>(false);

  const registerVoter = useCallback(
    async (candidateCount: number): Promise<boolean> => {
      if (!contract || !selectedAccount || !keyPair) return false;

      setLoading(true);
      try {
        const _pubKeys = [
          keyPair?.publicKey.getX().toString(10),
          keyPair?.publicKey.getY().toString(10),
        ];
        const voterKeys = getVoterKeys(keyPair, candidateCount);
        const _pubKeyForCandidates = voterKeys.map((bn) =>
          web3?.utils.numberToHex(bn.toString(10))
        );

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
    [contract, keyPair, selectedAccount, web3?.utils]
  );

  return { registerVoter, loading };
};
