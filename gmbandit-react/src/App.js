import React, { useState, useEffect } from "react";
import { WagmiConfig } from "wagmi";
import { config } from "./wagmi";
import ConnectWallet from "./components/ConnectWallet";
import { useAccount } from "wagmi";
import { ethers } from "ethers";

// ==== CONTRACT INFO ====
const CONTRACT = "0x725Ccb4ddCB715f468b301395Dfd1b1efDb5308A";
const ABI = [
  "function performRitual(string calldata newMessage) external payable",
  "function fee() view returns (uint256)"
];

export default function App() {
  return (
    <WagmiConfig config={config}>
      <GMbanditApp />
    </WagmiConfig>
  );
}

function GMbanditApp() {
  const { address, isConnected } = useAccount();

  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);

  // Format address short
  const short = (a) => (a ? a.slice(0, 6) + "…" + a.slice(-4) : "");

  // Cooldown helpers
  const key = (type) => `cool_${type}_${address}`;
  const today = () => new Date().toISOString().slice(0, 10);

  const checkCooldown = (type) => {
    if (!address) return true;
    const saved = localStorage.getItem(key(type));
    return saved === today();
  };

  const mark = (type) => {
    localStorage.setItem(key(type), today());
  };

  // Load signer when wallet connected
  useEffect(() => {
    async function loadSigner() {
      if (!isConnected) return;

      const p = new ethers.BrowserProvider(window.ethereum);
      const s = await p.getSigner();

      setProvider(p);
      setSigner(s);
    }
    loadSigner();
  }, [isConnected]);

  // Ensure Base chain
  async function ensureBase() {
    if (!window.ethereum) throw new Error("No wallet");

    const chain = await window.ethereum.request({ method: "eth_chainId" });

    if (chain === "0x2105") return; // Base

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x2105" }]
      });
    } catch (e) {
      if (e.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x2105",
              chainName: "Base",
              rpcUrls: ["https://mainnet.base.org"],
              nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
              blockExplorerUrls: ["https://basescan.org"]
            }
          ]
        });
      } else {
        throw e;
      }
    }
  }

  // Ritual handler
  async function ritual(type, message) {
    if (checkCooldown(type)) {
      alert(`You already did ${type} today!`);
      return;
    }

    try {
      await ensureBase();

      const contract = new ethers.Contract(CONTRACT, ABI, signer);
      const fee = await contract.fee();

      const tx = await contract.performRitual(message, { value: fee });

      alert("Transaction sent… waiting confirmation");
      await tx.wait();

      mark(type);
      alert(`${type} Ritual completed! 🎉`);
    } catch (err) {
      console.error(err);
      alert("Ritual failed ❌");
    }
  }

  // Button style helper
  const btn = (bg) => ({
    background: bg,
    color: "#fff",
    border: 0,
    borderRadius: "12px",
    padding: "14px 18px",
    minWidth: "200px",
    cursor: "pointer",
    fontWeight: "600",
  });

  return (
    <div
      style={{
        background:
          "linear-gradient(180deg, #1E3A8A 0%, #60A5FA 50%, #ffffff 100%)",
        minHeight: "100vh",
        padding: "20px",
        textAlign: "center",
        color: "#e9eefb",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{ maxWidth: "880px", margin: "0 auto" }}>
        {/* Banner */}
        <img
          src="/gmbandit.jpg"
          alt="GMbandit Banner"
          style={{
            maxWidth: "100%",
            borderRadius: "12px",
            marginBottom: "12px",
          }}
        />

        <div
          style={{
            color: "#1e3a8a",
            fontSize: "14px",
            marginBottom: "28px",
          }}
        >
          This ritual costs only <strong>0.00000033 ETH</strong>.
          <br />
          Cheaper than your morning coffee, but blessed by the onchain gods.
        </div>

        <h1 style={{ fontSize: "38px", marginBottom: "6px" }}>
          GM Ritual Dashboard
        </h1>
        <div style={{ color: "#1f2937", marginBottom: "32px" }}>
          Connect → Choose Ritual → Confirm TX (Base Chain 8453)
        </div>

        {/* Card */}
        <div
          style={{
            background: "rgba(22, 26, 34, 0.85)",
            borderRadius: "16px",
            padding: "24px",
            border: "1px solid #1f2430",
          }}
        >
          {/* CONNECT COMPONENT */}
          <ConnectWallet />

          {/* Address */}
          {isConnected && (
            <div style={{ marginBottom: "16px" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "#0b1324",
                  border: "1px solid #1f2a44",
                  padding: "10px 12px",
                  borderRadius: "12px",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#16a34a",
                  }}
                />
                {short(address)}
              </span>
            </div>
          )}

          {/* Ritual Buttons */}
          {isConnected && (
            <div
              style={{
                display: "flex",
                gap: "14px",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <button
                style={btn("#1d4ed8")}
                disabled={checkCooldown("GM")}
                onClick={() => ritual("GM", "GM ⚡")}
              >
                GM Ritual 🌞
              </button>

              <button
                style={btn("#6d28d9")}
                disabled={checkCooldown("GN")}
                onClick={() => ritual("GN", "GN 🌙")}
              >
                GN Ritual 🌙
              </button>

              <button
                style={btn("#374151")}
                disabled={checkCooldown("SLEEP")}
                onClick={() => ritual("SLEEP", "GoSleep 😴")}
              >
                GoSleep 😴
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
