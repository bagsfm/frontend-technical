export interface TokenInfo {
  mint: string;
  decimals: number;
  name: string;
}

export const TOKENS: TokenInfo[] = [
  {
    mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    decimals: 5,
    name: 'BONK',
  },
  {
    mint: '21AErpiB8uSb94oQKRcwuHqyHF93njAxBSbdUrpupump',
    decimals: 6,
    name: 'WIF',
  },
];

export const RPC_URL = 'https://gene-v4mswe-fast-mainnet.helius-rpc.com';

export const WALLET_ADDRESS = '5QRZKZ65CuQPu3XwKaNnK9L2ASuzvrz4NGpAUrWEDoQm';
