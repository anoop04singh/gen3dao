import { WagmiProvider, createConfig, http } from 'wagmi'
import { mainnet, sepolia, polygon, arbitrumSepolia, baseSepolia, optimismSepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const flowEvmTestnet = {
  id: 545,
  name: 'Flow EVM Testnet',
  nativeCurrency: { name: 'Flow', symbol: 'FLOW', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet.evm.nodes.onflow.org'] },
  },
  blockExplorers: {
    default: { name: 'Flowscan', url: 'https://evm-testnet.flowscan.io' },
  },
  testnet: true,
};

const alchemyApiKey = import.meta.env.VITE_ALCHEMY_API_KEY;
if (!alchemyApiKey) {
  console.warn("VITE_ALCHEMY_API_KEY is not set. Falling back to public RPC. For better performance and reliability, please add your Alchemy API key to your .env file.");
}

const config = createConfig({
  chains: [flowEvmTestnet, mainnet, sepolia, polygon, arbitrumSepolia, baseSepolia, optimismSepolia],
  connectors: [
    injected(),
  ],
  transports: {
    [flowEvmTestnet.id]: http(),
    [mainnet.id]: http(alchemyApiKey ? `https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}` : undefined),
    [sepolia.id]: http(alchemyApiKey ? `https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}` : undefined),
    [polygon.id]: http(alchemyApiKey ? `https://polygon-mainnet.g.alchemy.com/v2/${alchemyApiKey}` : undefined),
    [arbitrumSepolia.id]: http(alchemyApiKey ? `https://arb-sepolia.g.alchemy.com/v2/${alchemyApiKey}` : undefined),
    [baseSepolia.id]: http(alchemyApiKey ? `https://base-sepolia.g.alchemy.com/v2/${alchemyApiKey}` : undefined),
    [optimismSepolia.id]: http(alchemyApiKey ? `https://opt-sepolia.g.alchemy.com/v2/${alchemyApiKey}` : undefined),
  },
})

const queryClient = new QueryClient()

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}