import { useWeb3 } from '@/contexts/Web3Context';

export default function HomePage() {
  const { web3, accounts, contract } = useWeb3();
  return <>{accounts?.map((acc) => <div key={acc}>{acc}</div>)}</>;
}
