import { useState } from "react";
import { ethers } from "ethers";
import contractJson from "./abi/ConfidentialVoting.json";
import { createInstance } from "@zama-fhe/relayer-sdk/web";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

function App() {
  const [account, setAccount] = useState(null);
  const [status, setStatus] = useState("");

  // Kết nối ví Metamask
  async function connectWallet() {
    if (!window.ethereum) {
      alert("Bạn cần cài Metamask!");
      return;
    }
    try {
      const [selected] = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(selected);
      setStatus("✅ Ví đã kết nối: " + selected);
    } catch (err) {
      setStatus("❌ Lỗi: " + (err && err.message ? err.message : err.toString()));
    }
  }

  // Gửi 1 phiếu bầu (ví dụ vote = 1)
  async function sendVote() {
    if (!window.ethereum) {
      alert("Cần Metamask");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        contractJson.abi,
        signer
      );

      const tx = await contract.vote(1);
      await tx.wait();
      setStatus("✅ Gửi phiếu bầu thành công!");
    } catch (err) {
      setStatus("❌ Lỗi: " + (err && err.message ? err.message : err.toString()));
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>🗳 Confidential Voting dApp</h2>
      <p>{status}</p>

      {!account && (
        <button onClick={connectWallet}>Kết nối ví</button>
      )}

      {account && (
        <button onClick={sendVote}>Bầu chọn</button>
      )}
    </div>
  );
}

export default App;