import { createContext, useContext, useState, useEffect } from 'react';
import Web3 from 'web3';
import { notifications } from '@mantine/notifications';
import YesNoVoting from '../contracts/YesNoVoting.json';

interface Web3ContextType {
  web3: any | undefined;
  accounts: string[] | undefined;
  contract: any | undefined;
  selectedAccount: string | undefined;
  setSelectedAccount: (account: string | undefined) => void;
}

const Web3Context = createContext<Web3ContextType>({
  web3: undefined,
  accounts: undefined,
  contract: undefined,
  selectedAccount: undefined,
  setSelectedAccount: () => {},
});

interface Web3ProviderProps {
  children: React.ReactNode;
}

export const Web3Provider = ({ children }: Web3ProviderProps) => {
  const [web3, setWeb3] = useState<any>(null);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [contract, setContract] = useState<any>(null);
  const [selectedAccount, setSelectedAccount] = useState<string>();

  useEffect(() => {
    const initWeb3 = async () => {
      const web3Instance = new Web3('http://127.0.0.1:8545'); // Connect to local Ganache
      try {
        const ethAccounts = await web3Instance.eth.getAccounts();
        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = YesNoVoting.networks[networkId];
        const instance = new web3Instance.eth.Contract(
          YesNoVoting.abi,
          deployedNetwork && deployedNetwork.address
        );
        const web3test = new Web3(new Web3.providers.WebsocketProvider('ws://127.0.0.1:8545'));
        const instance1 = new web3test.eth.Contract(
          YesNoVoting.abi,
          deployedNetwork && deployedNetwork.address
        );
        instance1.events.VotingStarted().on('data', () => {
          notifications.show({
            title: 'Voting started',
            message: 'Voting has started!',
            color: 'blue',
          });
        });
        instance1.events.VotingEnded().on('data', () => {
          notifications.show({
            title: 'Voting ended',
            message: 'Voting has ended!',
            color: 'blue',
          });
        });
        instance1.events.VoteSubmitted().on('data', (eventData: any) => {
          console.log('Vote submitted', eventData);
          notifications.show({
            title: 'Vote submitted',
            message: 'Voting has ended!',
            color: 'blue',
          });
        });
        setWeb3(web3Instance);
        setAccounts(ethAccounts);
        setContract(instance);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Could not connect to wallet', error);
        notifications.show({
          title: 'Connection failed',
          message: 'Could not connect to wallet',
          color: 'red',
        });
      }
    };
    initWeb3();
  }, []);

  return (
    <Web3Context.Provider value={{ web3, accounts, contract, selectedAccount, setSelectedAccount }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
