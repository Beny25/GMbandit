import React from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

export default function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isConnecting } = useConnect();
  const { disconnect } = useDisconnect();

  // shorten address
  const short = (a) => a.slice(0, 6) + "…" + a.slice(-4);

  // ----- IF CONNECTED -----
  if (isConnected) {
    return (
      <div style={{ marginBottom: "16px" }}>
        <button
          onClick={() => disconnect()}
          style={{
            background: "#ef4444",
            color: "#fff",
            border: 0,
            borderRadius: "12px",
            padding: "14px 18px",
            minWidth: "220px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Disconnect ({short(address)})
        </button>
      </div>
    );
  }

  // ----- IF DISCONNECTED -----
  return (
    <div style={{ marginBottom: "16px" }}>
      {connectors.map((c) => (
        <button
          key={c.id}
          onClick={() => connect({ connector: c })}
          disabled={isConnecting}
          style={{
            display: "block",
            background: "#2563eb",
            color: "#fff",
            border: 0,
            borderRadius: "12px",
            padding: "14px 18px",
            marginBottom: "12px",
            minWidth: "220px",
            cursor: "pointer",
            fontWeight: "600",
            width: "100%",
          }}
        >
          {isConnecting ? "Connecting..." : `Connect with ${c.name}`}
        </button>
      ))}
    </div>
  );
}

