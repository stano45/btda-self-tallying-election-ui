import { createContext, useContext, useState, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import { KeyPair } from '@/types';
import { keyGen } from '@/crypto/crypto';

interface CryptoContextType {
  keyPair?: KeyPair;
}

const CryptoContext = createContext<CryptoContextType>({
  keyPair: undefined,
});

interface CryptoProviderProps {
  children: React.ReactNode;
}

export const CryptoProvider = ({ children }: CryptoProviderProps) => {
  const [keyPair, setKeyPair] = useState<KeyPair>();

  console.log('keyPair', keyPair);
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
  }, [keyPair]);

  return <CryptoContext.Provider value={{ keyPair }}>{children}</CryptoContext.Provider>;
};

export const useCrypto = () => useContext(CryptoContext);
