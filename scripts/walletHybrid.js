// scripts/walletHybrid.js
import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js";
import { WalletConnectModal } from "https://unpkg.com/@walletconnect/modal@2.6.2/dist/index.esm.js";

export async function initWallet() {
  const BASE_RPC = "https://mainnet.base.org";
  const CHAIN_ID_HEX = "0x2105"; // Base mainnet
  const wc = new WalletConnectModal({
    projectId: "6104d969b4ed13800dc8853d01b83d53",
    themeMode: "light",
  });

  let provider, signer, account;

  async function ensureBase(eth) {
    const chainId = await eth.request({ method: "eth_chainId" });
    if (chainId !== CHAIN_ID_HEX) {
      try {
        await eth.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: CHAIN_ID_HEX }],
        });
      } catch (err) {
        if (err.code === 4902) {
          await eth.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: CHAIN_ID_HEX,
              chainName: "Base",
              rpcUrls: [BASE_RPC],
              nativeCurrency: { name: "Base Ether", symbol: "ETH", decimals: 18 },
              blockExplorerUrls: ["https://basescan.org"]
            }],
          });
        }
      }
    }
  }

  async function connect() {
    let eth =
      window.ethereum ||
      window.okxwallet ||
      (window.bitkeep && window.bitkeep.ethereum) ||
      window.bitgetwallet;

    // ✅ 1️⃣ kalau wallet injected (dApp browser)
    if (eth) {
      await ensureBase(eth);
      provider = new ethers.providers.Web3Provider(eth, "any");
      await provider.send("eth_requestAccounts", []);
      signer = provider.getSigner();
      account = await signer.getAddress();
      return { provider, signer, account, type: "injected" };
    }

    // ✅ 2️⃣ fallback → WalletConnect modal (Chrome / Farcaster)
    const session = await wc.openModal();
    if (session) {
      provider = new ethers.providers.JsonRpcProvider(BASE_RPC);
      account = session.namespaces?.eip155?.accounts?.[0]?.split(":").pop();
      return { provider, signer: null, account, type: "walletconnect" };
    } else {
      throw new Error("Wallet connection cancelled or failed");
    }
  }

  return { connect };
            }
