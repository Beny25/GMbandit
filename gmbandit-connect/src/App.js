
import React, { useState, useEffect } from "react";
import { SignClient } from "@walletconnect/sign-client";
import { ethers } from "ethers";

function App() {
  const [signClient, setSignClient] = useState(null);
  const [session, setSession] = useState(null);
  const [connected, setConnected] = useState(false);

  const projectId = process.env.REACT_APP_PROJECT_ID;

  useEffect(() => {
    const initClient = async () => {
      try {
        const client = await SignClient.init({
          projectId,
          metadata: {
            name: "GMbandit WalletConnect",
            description: "Connect wallet for Base GM Ritual",
            url: "https://gm-bandit.vercel.app",
            icons: ["https://gm-bandit.vercel.app/icon.png"],
          },
        });
        setSignClient(client);
      } catch (e) {
        console.error("Init error:", e);
      }
    };
    initClient();
  }, [projectId]);

  const connectWallet = async () => {
    if (!signClient) return alert("Client not ready yet");

    try {
      const { uri, approval } = await signClient.connect({
        requiredNamespaces: {
          eip155: {
            methods: ["eth_sendTransaction", "personal_sign"],
            chains: ["eip155:8453"],
            events: ["chainChanged", "accountsChanged"],
          },
        },
      });

      if (uri) {
        const qr = window.open(`https://walletconnect.com/wc?uri=${encodeURIComponent(uri)}`);
        const sess = await approval();
        setSession(sess);
        setConnected(true);
        qr.close();
      }
    } catch (err) {
      console.error("Connect error:", err);
    }
  };

  const disconnect = async () => {
    if (signClient && session) {
      await signClient.disconnect({
        topic: session.topic,
        reason: { code: 6000, message: "User disconnected" },
      });
      setConnected(false);
      setSession(null);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "60px" }}>
      <h1>GMbandit WalletConnect 🚀</h1>
      {!connected ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <button onClick={disconnect}>Disconnect</button>
      )}
      <p>Status: {connected ? "✅ Connected" : "❌ Disconnected"}</p>
    </div>
  );
}

export default App;
