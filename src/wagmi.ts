import { createConfig, http } from 'wagmi'
import { base } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'
import { walletConnect } from 'wagmi/connectors'

export const config = createConfig({
  chains: [base],
  connectors: [
    injected(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID!,
      metadata: {
        name: "VibeBadge",
        description: "VibeBadge Minting App",
        url: "https://gm-bandit.vercel.app",
        icons: ["https://gm-bandit.vercel.app/icon.png"]
      }
    })
  ],
  transports: {
    [base.id]: http("https://mainnet.base.org"),
  },
});

