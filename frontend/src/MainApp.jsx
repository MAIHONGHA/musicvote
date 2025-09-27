import { useState } from "react";
import { ethers } from "ethers";
import ABI from "./abi.json";
import { encryptRating, decryptMany } from "./lib/relayer";

const CONTRACT = import.meta.env.VITE_CONTRACT;
const RPC_URL = import.meta.env.VITE_SEPOLIA_RPC_URL;
const RELAYER = import.meta.env.VITE_RELAYER_URL;
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

function readContract() {
  if (!RPC_URL) throw new Error("Missing VITE_SEPOLIA_RPC_URL");
  if (!CONTRACT) throw new Error("Missing VITE_CONTRACT");
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  return new ethers.Contract(CONTRACT, ABI, provider);
}

async function uploadToPinata(file) {
  if (!PINATA_JWT) throw new Error("Missing VITE_PINATA_JWT");
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: { Authorization: `Bearer ${PINATA_JWT}` },
    body: form,
  });
  if (!res.ok) throw new Error(`Pinata HTTP ${res.status}`);
  const json = await res.json();
  if (!json?.IpfsHash) throw new Error("Pinata: missing IpfsHash");
  return json.IpfsHash;
}

async function readAggregates(trackId) {
  const c = readContract();
  const id = ethers.BigNumber.from(String(trackId));
  const agg = await c.getAggregates(id);
  const [sum, count] = await decryptMany([agg.sum, agg.count]);
  const nSum = Number(sum), nCount = Number(count);
  return { sum: nSum, count: nCount, average: nCount > 0 ? nSum / nCount : 0 };
}

export default function MainApp() {
  const [account, setAccount] = useState("");
  const [wContract, setWc] = useState(null);

  async function connectWallet() {
    try {
      if (!window.ethereum) throw new Error("Install MetaMask");
      const web3 = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await web3.send("eth_requestAccounts", []);
      const signer = web3.getSigner();
      setAccount(accounts[0] || "");
      setWc(new ethers.Contract(CONTRACT, ABI, signer));
    } catch (e) { alert(e?.message || "Connect failed"); }
  }

  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [lastId, setLastId] = useState("");

  async function uploadAndSave() {
    try {
      if (!wContract) throw new Error("Connect wallet first");
      if (!file) throw new Error("Choose an audio file");
      setUploading(true);
      const cid = await uploadToPinata(file);
      const tx = await wContract.addTrack(title || "Untitled", cid);
      const rc = await tx.wait();
      const ev = rc.events?.find(e => e.event === "TrackAdded");
      const id = ev?.args?.id ? ev.args.id.toString() : "";
      setLastId(id);
      alert(`Saved track #${id}`);
    } catch (e) {
      console.error(e); alert(e?.message || "Upload/Save failed");
    } finally { setUploading(false); }
  }

  const [trackId, setTrackId] = useState("");
  const [rating, setRating] = useState(5);
  const [voting, setVoting] = useState(false);
  const [checking, setChecking] = useState(false);
  const [agg, setAgg] = useState(null);

  async function castVote() {
    try {
      if (!wContract) throw new Error("Connect wallet first");
      if (!RELAYER) throw new Error("Missing VITE_RELAYER_URL");
      if (!trackId) throw new Error("Enter track id");
      setVoting(true);
      const { ciphertext, attestation } = await encryptRating(Number(rating), 64);
      const tx = await wContract.vote(
        ethers.BigNumber.from(String(trackId)),
        ciphertext,
        attestation,
        { gasLimit: 900000 }
      );
      await tx.wait();
      alert(`Voted ${rating}★ for #${trackId}`);
    } catch (e) {
      console.error(e); alert(e?.message || "Vote failed");
    } finally { setVoting(false); }
  }

  async function checkResults() {
    try {
      if (!trackId) throw new Error("Enter track id");
      setChecking(true);
      const res = await readAggregates(trackId);
      setAgg(res);
      alert(`Track ${trackId} → sum=${res.sum} count=${res.count} avg=${res.average.toFixed(2)}`);
    } catch (e) {
      console.error(e); alert(e?.message || "Read/decrypt failed");
    } finally { setChecking(false); }
  }

  const wrap = { minHeight:"100vh", background:"linear-gradient(180deg,#0b3b8f,#0a2c6a)", color:"#fff" };
  const container = { maxWidth: 1000, margin:"0 auto", padding:"28px 20px" };
  const logo = { display:"flex", alignItems:"center", gap:10, fontWeight:700, fontSize:22 };
  const logoBadge = { width:28, height:28, borderRadius:8, background:"#fff", color:"#0a3d91",
                      display:"grid", placeItems:"center", fontWeight:800 };
  const hero = { textAlign:"center", margin:"56px 0 28px" };
  const card = { background:"rgba(255,255,255,0.08)", padding:18, borderRadius:18, boxShadow:"0 8px 30px rgba(0,0,0,0.18)" };
  const pillBtn = (bg="#ffd54d", col="#0a3d91") => ({
    background:bg, color:col, border:"none", borderRadius:12, padding:"10px 16px",
    cursor:"pointer", fontWeight:700
  });
  const input = { padding:"10px 12px", borderRadius:10, border:"1px solid rgba(255,255,255,0.25)",
                  background:"rgba(0,0,0,0.25)", color:"#fff" };

  return (
    <div style={wrap}>
      <div style={container}>
        <div style={logo}>
          <div style={logoBadge}>♪</div>
          MusicVote
        </div>

        <div style={hero}>
          <h1 style={{ fontSize:46, lineHeight:1.1, margin:"0 0 8px" }}>
            Private Voting.<br/>Public Trust.
          </h1>
          <div style={{ opacity:0.85 }}>
            Upload tracks, vote anonymously with FHEVM, and see transparent results.
          </div>
        </div>

        <div style={{ ...card, margin:"0 auto", maxWidth:940 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:14 }}>
            <div>
              <div style={{ fontWeight:700, marginBottom:8 }}>1) Connect Wallet</div>
              <button onClick={connectWallet} style={{ ...pillBtn("#243b64","#fff"), width:"100%" }}>
                {account ? `Connected: ${account.slice(0,6)}…${account.slice(-4)}` : "Connect Wallet"}
              </button>
            </div>
            <div>
              <div style={{ fontWeight:700, marginBottom:8 }}>2) Upload a track & Save on chain</div>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                <input placeholder="Track title" value={title} onChange={e=>setTitle(e.target.value)} style={{ ...input, flex:1, minWidth:160 }} />
                <input type="file" accept="audio/*" onChange={e=>setFile(e.target.files?.[0]||null)} style={{ ...input, padding:8 }} />
                <button disabled={!account || uploading} onClick={uploadAndSave} style={pillBtn("#22c55e","#fff")}>
                  {uploading ? "Uploading…" : "Upload & Save"}
                </button>
              </div>
              {lastId && <div style={{ marginTop:6, fontSize:12, opacity:0.85 }}>Saved Track ID: <b>{lastId}</b></div>}
            </div>
          </div>

          <div>
            <div style={{ fontWeight:700, marginBottom:8 }}>3) Vote & Check results</div>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
              <input placeholder="Track ID" value={trackId} onChange={e=>setTrackId(e.target.value)}
                     inputMode="numeric" style={{ ...input, minWidth:120 }} />
              <select value={rating} onChange={e=>setRating(Number(e.target.value))} style={input}>
                {[0,1,2,3,4,5].map(v => <option key={v} value={v}>{v} ★</option>)}
              </select>
              <button disabled={!account || voting} onClick={castVote} style={pillBtn("#3b82f6","#fff")}>
                {voting ? "Voting…" : "Cast Vote"}
              </button>
              <button disabled={checking} onClick={checkResults} style={pillBtn("#10b981","#fff")}>
                {checking ? "Checking…" : "Check Votes"}
              </button>
            </div>
            {agg && (
              <div style={{ marginTop:10, fontSize:14 }}>
                Sum: <b>{agg.sum}</b> &nbsp;|&nbsp; Count: <b>{agg.count}</b> &nbsp;|&nbsp; Avg: <b>{agg.average.toFixed(2)}</b>
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop:16, textAlign:"center", opacity:0.75, fontSize:12 }}>
          RPC: {RPC_URL ? "OK" : "MISSING"} • Relayer: {RELAYER ? "OK" : "MISSING"} • Pinata: {PINATA_JWT ? "OK" : "MISSING"}
        </div>
      </div>
    </div>
  );
}
