import { createContext, useContext, useState, useEffect } from 'react';
import Web3 from 'web3';
import { notifications } from '@mantine/notifications';
import { RegisteredSubscription } from 'web3/lib/commonjs/eth.exports';
import ScoreVoting from '../contracts/ScoreVoting.json';
import { Account, VotingStatus } from '@/types';

interface Web3ContextType {
  web3: Web3<RegisteredSubscription> | undefined;
  accounts: Account[] | undefined;
  contract: any | undefined;
  selectedAccount: Account | undefined;
  selectAccount: (name: string | undefined) => void;
  votingStatus: VotingStatus;
}

const Web3Context = createContext<Web3ContextType>({
  web3: undefined,
  accounts: undefined,
  contract: undefined,
  selectedAccount: undefined,
  selectAccount: () => {},
  votingStatus: VotingStatus.RegisterCandidates,
});

interface Web3ProviderProps {
  children: React.ReactNode;
}

export const Web3Provider = ({ children }: Web3ProviderProps) => {
  const [web3, setWeb3] = useState<Web3<RegisteredSubscription>>();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [contract, setContract] = useState<any>(undefined);
  const [selectedAccount, setSelectedAccount] = useState<Account>();
  const [votingStatus, setVotingStatus] = useState<VotingStatus>(VotingStatus.RegisterCandidates);

  console.log(selectedAccount);
  useEffect(() => {
    const initWeb3 = async () => {
      try {
        const web3Instance = new Web3('http://127.0.0.1:8545'); // Connect to local Ganache
        const ethAccounts = await web3Instance.eth.getAccounts();
        const networkId = await web3Instance.eth.net.getId();
        // @ts-ignore
        const deployedNetwork = ScoreVoting.networks[networkId];
        const instance = new web3Instance.eth.Contract(
          ScoreVoting.abi,
          deployedNetwork && deployedNetwork.address
        );
        const web3SocketInstance = new Web3(
          new Web3.providers.WebsocketProvider('ws://127.0.0.1:8545')
        );
        const socketContract = new web3SocketInstance.eth.Contract(
          ScoreVoting.abi,
          deployedNetwork && deployedNetwork.address
        );
        socketContract.events.VotersRegistrationStarted().on('data', () => {
          notifications.show({
            title: 'Voters Registration',
            message: 'Voters registration has started!',
            color: 'blue',
          });
          setVotingStatus(VotingStatus.RegisterVoters);
        });
        socketContract.events.VotingStarted().on('data', () => {
          notifications.show({
            title: 'Voting started',
            message: 'Voting has started!',
            color: 'blue',
          });
          setVotingStatus(VotingStatus.Vote);
        });
        socketContract.events.VotingEnded().on('data', () => {
          notifications.show({
            title: 'Voting ended',
            message: 'Voting has ended!',
            color: 'blue',
          });
          setVotingStatus(VotingStatus.End);
        });
        socketContract.events.VoteSubmitted().on('data', (eventData: any) => {
          // eslint-disable-next-line no-console
          console.log('Vote submitted', eventData);
          // notifications.show({
          //   title: 'Vote submitted',
          //   message: 'Voting has ended!',
          //   color: 'blue',
          // });
        });
        const status = await instance.methods.getVotingStatus().call();
        const statusNr = Number(status);
        setVotingStatus(statusNr as VotingStatus);
        setWeb3(web3Instance);
        const fetchedAccounts: Account[] = ethAccounts.map((name, index) => ({
          name,
          index,
        }));
        setAccounts(fetchedAccounts);
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

  const selectAccount = (name: string | undefined) => {
    if (name === undefined) {
      setSelectedAccount(undefined);
      return;
    }
    const account = accounts.find((acc) => acc.name === name);
    if (account) {
      setSelectedAccount(account);
    }
  };

  return (
    <Web3Context.Provider
      value={{ web3, accounts, contract, selectedAccount, selectAccount, votingStatus }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
