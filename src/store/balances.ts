import { create } from 'zustand';
import { LAMPORTS_PER_SOL, Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { TOKENS, RPC_URL, WALLET_ADDRESS, TokenInfo } from './constants';

const connection = new Connection(RPC_URL);

const walletPubkey = new PublicKey(WALLET_ADDRESS);

interface TokenBalance {
  name: string;
  balance: number;
}

interface BalanceState {
  sol: number | null;
  tokens: Record<string, TokenBalance>;
  isLoading: boolean;
  subscriptionIds: number[];
  setSol: (sol: number) => void;
  setToken: (token: TokenInfo, balance: number) => void;
  setLoading: (loading: boolean) => void;
  subscribe: () => void;
  unsubscribe: () => void;
}

export default create<BalanceState>((set, get) => ({
  sol: null,
  tokens: {},
  isLoading: true,
  subscriptionIds: [],
  setSol: (sol) => set({ sol }),
  setToken: (token, balance) =>
    set((state) => ({
      tokens: { ...state.tokens, [token.mint]: { name: token.name, balance } },
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  subscribe: async () => {
    const { subscriptionIds, setSol, setToken, setLoading } = get();

    if (subscriptionIds.length > 0) return;

    const ids: number[] = [];
    setLoading(true);

    try {
      // SOL balance subscription
      const solId = connection.onAccountChange(
        walletPubkey,
        ({ lamports }) => {
          setSol(lamports / LAMPORTS_PER_SOL);
        },
        { commitment: 'processed' }
      );
      ids.push(solId);

      // Token subscriptions in parallel
      const tokenPromises = TOKENS.map(async (token) => {
        const { mint, decimals } = token;
        try {
          const ata = await getAssociatedTokenAddress(
            new PublicKey(mint),
            walletPubkey
          );

          const subId = connection.onAccountChange(
            ata,
            ({ data }) => {
              if (data.length === 165 || data.length === 182) {
                const low = data.readUInt32LE(64);
                const high = data.readUInt32LE(68);
                const raw = high * 2 ** 32 + low;
                const balance = raw / 10 ** decimals;
                setToken(token, balance);
              }
            },
            { commitment: 'processed' }
          );
          return subId;
        } catch (err) {
          return null;
        }
      });

      const tokenIds = await Promise.all(tokenPromises);
      ids.push(...tokenIds.filter((id) => id !== null));

      set({ subscriptionIds: ids, isLoading: false });
    } catch (err) {
      setLoading(false);
    }
  },
  unsubscribe: () => {
    const { subscriptionIds } = get();
    subscriptionIds.forEach((id) => connection.removeAccountChangeListener(id));
    set({ subscriptionIds: [], isLoading: true });
  },
}));
