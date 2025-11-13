import { createConfig, http } from 'wagmi'
import { base } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'
import { walletConnect } from 'wagmi/connectors'

export const config = createConfig({
  chains: [base],
  connectors: [
    injected(),
    walletConnect({
      projectId: process.env.REACT_APP_PROJECT_ID,
      metadata: {
        name: "GMbandit",
        description: "GMbandit Ritual App",
        url: "https://gm-bandit.vercel.app",
        icons: ["https://gm-bandit.vercel.app/icon.png"]
      }
    })
  ],
  transports: {
    [base.id]: http("https://mainnet.base.org"),
  },
});
