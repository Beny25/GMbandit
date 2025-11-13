import { useAccount, useConnect, useDisconnect } from 'wagmi'

export default function ConnectWallet() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected) {
    return (
      <button className="btn connected" onClick={() => disconnect()}>
        Disconnect ({address.slice(0,6)}...{address.slice(-4)})
      </button>
    )
  }

  return (
    <div>
      {connectors.map((c) => (
        <button className="btn primary" key={c.id} onClick={() => connect({ connector: c })}>
          Connect with {c.name}
        </button>
      ))}
    </div>
  )
}
