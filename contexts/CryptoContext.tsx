import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import { KeyPair, VoterKeys } from '@/types';
import { getVoterKeys, keyGen } from '@/crypto/crypto';

interface CryptoContextType {
  keyPair?: KeyPair;
  voterKeys?: VoterKeys;
  calculateVoterKeys: (numCandidates: number, numVoters: number, myNumber: number) => void;
}

const CryptoContext = createContext<CryptoContextType>({
  keyPair: undefined,
  voterKeys: undefined,
  calculateVoterKeys: () => {},
});

interface CryptoProviderProps {
  children: React.ReactNode;
}

export const CryptoProvider = ({ children }: CryptoProviderProps) => {
  const [keyPair, setKeyPair] = useState<KeyPair>();
  const [voterKeys, setVoterKeys] = useState<VoterKeys>();

  useEffect(() => {
    if (keyPair) {
      return;
    }
    try {
      const key = keyGen();
      setKeyPair(key);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Error while generating key pair',
        color: 'red',
      });
    }
  });

  const calculateVoterKeys = useCallback(
    (numCandidates: number, numVoters: number, myNumber: number) => {
      if (!keyPair) {
        // eslint-disable-next-line no-console
        console.error('Key pair not initialized');
        notifications.show({
          title: 'Error deriving keys',
          message: 'Key pair not initialized',
          color: 'red',
        });
        return;
      }
      const vKeys = getVoterKeys(keyPair, numCandidates, numVoters, myNumber);
      setVoterKeys(vKeys);
    },
    [keyPair, setVoterKeys]
  );

  return (
    <CryptoContext.Provider value={{ keyPair, calculateVoterKeys, voterKeys }}>
      {children}
    </CryptoContext.Provider>
  );
};

export const useCrypto = () => useContext(CryptoContext);
