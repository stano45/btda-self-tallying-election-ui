import { useState, useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import { useCrypto, useWeb3 } from '@/contexts';
import { getVoterKeys } from '@/crypto/crypto';
import { useGetCandidates } from './useGetCandidates';

export const useRegisterVoter = () => {
  const { contract, selectedAccount, web3 } = useWeb3();
  const { candidates, reload } = useGetCandidates();
  console.log('Candidates:', candidates);
  const { keyPair } = useCrypto();
  const [loading, setLoading] = useState<boolean>(false);

  const registerVoter = useCallback(async (): Promise<boolean> => {
    if (!contract || !selectedAccount || !keyPair) return false;

    setLoading(true);
    try {
      const res = await reload();
      if (!res) {
        notifications.show({
          title: 'Error registering voter',
          message: 'Failed to fetch candidates',
          color: 'red',
        });
        return false;
      }
      const publicKeyBN = [keyPair?.publicKey.getX(), keyPair?.publicKey.getY()];
      const _pubKey = publicKeyBN.map((bn) => web3?.utils.numberToHex(bn.toString(10)));
      const voterKeys = getVoterKeys(keyPair, candidates.length);
      const _pubKeyForCandidates = voterKeys.map((bn) => web3?.utils.numberToHex(bn.toString(10)));
      console.log('Calling registerVoter with', _pubKey, _pubKeyForCandidates);
      await contract.methods
        .registerVoter(_pubKey, _pubKeyForCandidates)
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
  }, [contract, selectedAccount]);

  return { registerVoter, loading };
};
