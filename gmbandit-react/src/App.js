import React, { useState, useEffect } from "react";
import { WagmiConfig } from "wagmi";
import { config } from "./wagmi";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { ethers } from "ethers";

const CONTRACT = "0x725Ccb4ddCB715f468b301395Dfd1b1efDb5308A";
const ABI = [
  "function performRitual(string calldata newMessage) external payable",
  "function fee() view returns (uint256)"
];

export default function App() {
  return (
    <WagmiConfig config={config}>
      <GMApp />
    </WagmiConfig>
  );
}

function GMApp() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);

  // cooldown tracking
  function short(a) {
    return a ? a.slice(0, 6) + "…" + a.slice(-4) : "";
  }

  function cooldownKey(type, addr) {
    return "cool_" + type + "_" + addr;
  }

  function checkCooldown(type) {
    if (!address) return true;
    const saved = localStorage.getItem(cooldownKey(type, address));
    if (!saved) return false;
    const today = new Date().toISOString().slice(0, 10);
    return saved === today;
  }

  function mark(type) {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem(cooldownKey(type, address), today);
  }

  // On connect: create ethers signer
  useEffect(() => {
    async function loadSigner() {
      if (isConnected) {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const s = await browserProvider.getSigner();
        setProvider(browserProvider);
        setSigner(s);
      }
    }
    loadSigner();
  }, [isConnected]);

  async function ensureBaseChain() {
    if (!window.ethereum) {
      alert("No wallet detected.");
      throw new Error("No wallet");
    }
    const chainId = await window.ethereum.request({ method: "eth_chainId" });

    if (chainId === "0x2105") return; // Base chain
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x2105" }],
      });
    } catch (e) {
      if (e.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: "0x2105",
            chainName: "Base",
            rpcUrls: ["https://mainnet.base.org"],
            nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
            blockExplorerUrls: ["https://basescan.org"]
          }]
        });
      } else {
        throw e;
      }
    }
  }

  // Ritual handler
  async function ritual(type, message) {
    if (checkCooldown(type)) {
      alert("You already did " + type + " today!");
      return;
    }
    try {
      await ensureBaseChain();

      const contract = new ethers.Contract(CONTRACT, ABI, signer);
      const fee = await contract.fee();
      const tx = await contract.performRitual(message, { value: fee });

      alert("TX sent… waiting confirmation");
      await tx.wait();
      mark(type);
      alert(type + " ritual complete!");
    } catch (err) {
      console.error(err);
      alert("Ritual failed ❌");
    }
  }

  return (
    <div
      style={{
        fontFamily: "Inter, sans-serif",
        background: "linear-gradient(180deg, #1E3A8A 0%, #60A5FA 50%, #ffffff 100%)",
        minHeight: "100vh",
        margin: 0,
        padding: "20px",
        color: "#e9eefb",
        textAlign: "center"
      }}
    >
      <div style={{ maxWidth: "880px", margin: "0 auto" }}>
        {/* Banner */}
        <img
          src="/gmbandit.jpg"
          alt="GMbandit Banner"
          style={{ maxWidth: "100%", borderRadius: "12px", marginBottom: "12px" }}
        />

        <div style={{ color: "#1e3a8a", fontSize: "14px", marginBottom: "28px" }}>
          This ritual costs only <strong>0.00000033 ETH</strong>.<br />
          Cheaper than your morning coffee, but blessed by the onchain gods.
        </div>

        <h1 style={{ fontSize: "38px", marginBottom: "6px" }}>GM Ritual Dashboard</h1>
        <div style={{ color: "#1f2937", marginBottom: "32px" }}>
          Connect → Choose Ritual → Confirm TX (Base Chain 8453)
        </div>

        {/* Card */}
        <div
          style={{
            background: "rgba(22, 26, 34, 0.85)",
            padding: "24px",
            borderRadius: "16px",
            border: "1px solid #1f2430"
          }}
        >
          {/* Connect Section */}
          <div style={{ display: "flex", gap: "14px", justifyContent: "center" }}>
            {!isConnected &&
              connectors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => connect({ connector: c })}
                  style={btnStyle("#2563eb")}
                >
                  Connect with {c.name}
                </button>
              ))}

            {isConnected && (
              <>
                <button style={btnStyle("#ef4444")} onClick={() => disconnect()}>
                  Disconnect
                </button>
              </>
            )}
          </div>

          {/* Address Bar */}
          {isConnected && (
            <div style={{ marginTop: "16px", marginBottom: "16px" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "#0b1324",
                  border: "1px solid #1f2a44",
                  padding: "10px 12px",
                  borderRadius: "12px"
                }}
              >
                <span style={{ background: "#16a34a", width: "8px", height: "8px", borderRadius: "50%" }}></span>
                {short(address)}
              </span>
            </div>
          )}

          {/* Ritual Buttons */}
          {isConnected && (
            <div style={{ display: "flex", gap: "14px", justifyContent: "center" }}>
              <button
                style={btnStyle("#1d4ed8")}
                disabled={checkCooldown("GM")}
                onClick={() => ritual("GM", "GM ⚡")}
              >
                GM Ritual 🌞
              </button>

              <button
                style={btnStyle("#6d28d9")}
                disabled={checkCooldown("GN")}
                onClick={() => ritual("GN", "GN 🌙")}
              >
                GN Ritual 🌙
              </button>

              <button
                style={btnStyle("#374151")}
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

// simple button style
function btnStyle(color) {
  return {
    background: color,
    color: "#fff",
    border: 0,
    borderRadius: "12px",
    padding: "14px 18px",
    minWidth: "200px",
    cursor: "pointer",
    fontWeight: "600",
  };
}
