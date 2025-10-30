import { useEffect } from 'react';
import useBalances from '../store/balances';
import Asset from '../components/Asset';

function Home() {
  const sol = useBalances((state) => state.sol);
  // NOTE: We use selectors from zustand to token values as we don't want to re-render
  // the app on every state change, only when relevant parts change.
  // This can be used to subscribe to specific data like token (Mint Address) balances if needed.
  // Eg: const usdc = useBalances((state) => state.tokens['<USDC_MINT_ADDRESS>']?.balance);
  // For simplicity, we get all tokens here.
  const tokens = useBalances((state) => state.tokens);
  const isLoading = useBalances((state) => state.isLoading);
  const subscribe = useBalances((state) => state.subscribe);
  const unsubscribe = useBalances((state) => state.unsubscribe);

  useEffect(() => {
    subscribe();
    return () => unsubscribe();
  }, [subscribe, unsubscribe]);

  if (isLoading) {
    return (
      <div>
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div>
      <h1>Wallet Balances</h1>
      <Asset label="SOL" value={sol} />
      {Object.entries(tokens).map(([mintAddress, tokenData]) => (
        <Asset
          key={mintAddress}
          label={tokenData.name}
          value={tokenData.balance}
        />
      ))}
    </div>
  );
}

export default Home;
