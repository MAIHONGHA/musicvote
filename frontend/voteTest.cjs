const { ethers } = require("ethers");
const axios = require("axios");
require("dotenv").config();

// ── ENV ───────────────────────────────────────────────────────────────────────
const RPC = process.env.SEPOLIA_RPC_URL;
const CONTRACT = process.env.VITE_CONTRACT;
const PRIV_KEY = process.env.PRIVATE_KEY;
const RELAYER = process.env.VITE_RELAYER_URL;

const VOTE_ID = Number(process.env.VOTE_ID || 1);
const MAKE_PUBLIC = String(process.env.MAKE_PUBLIC || "0") === "1"; // owner-only
const CHECK_ADDRESS = process.env.CHECK_ADDRESS || ""; // for hasVoted(id, addr)

// ── BASIC CHECKS ─────────────────────────────────────────────────────────────
if (!(RPC && CONTRACT && PRIV_KEY)) {
  console.error("Missing one of: SEPOLIA_RPC_URL, VITE_CONTRACT, PRIVATE_KEY in .env");
  process.exit(1);
}

// ABI path must match your project
const ABI = require("./src/abi.json");

// ── RELAYER HELPERS ──────────────────────────────────────────────────────────
// Try to get {ciphertext, attestation}; fallback to {ciphertext} only.
async function getEncryptedOne(relayer) {
  if (!relayer) throw new Error("Missing VITE_RELAYER_URL in .env");

  // Preferred: endpoint returning both ciphertext + attestation
  try {
    const { data } = await axios.post(`${relayer}/encrypt-one-attested`, { bits: 64 });
    if (data && data.ciphertext && data.attestation) {
      return { ciphertext: data.ciphertext, attestation: data.attestation };
    }
  } catch (_) {
    // ignore and fallback
  }

  // Fallback: only ciphertext
  const { data } = await axios.post(`${relayer}/encrypt-one`, { bits: 64 });
  if (!data || !data.ciphertext) throw new Error("Relayer encrypt-one failed");
  return { ciphertext: data.ciphertext, attestation: "0x" };
}

async function decryptMany(relayer, ciphertexts) {
  if (!relayer) throw new Error("Missing VITE_RELAYER_URL in .env");
  const { data } = await axios.post(`${relayer}/decrypt`, { ciphertexts });
  if (!Array.isArray(data?.values)) throw new Error("Relayer decrypt failed");
  return data.values;
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  const provider = new ethers.JsonRpcProvider(RPC);
  const wallet = new ethers.Wallet(PRIV_KEY, provider);
  const contract = new ethers.Contract(CONTRACT, ABI, wallet);

  console.log("RPC:", RPC);
  console.log("Account:", await wallet.getAddress());

  // Verify contract exists
  const code = await provider.getCode(CONTRACT);
  if (!code || code === "0x") throw new Error("No contract code at VITE_CONTRACT on this RPC");

  // Optional: show tracksCount (if function exists)
  if (typeof contract.tracksCount === "function") {
    try {
      const n = await contract.tracksCount();
      console.log("tracksCount:", n.toString());
    } catch (e) {
      console.log("tracksCount() call failed (not critical):", e.message || e);
    }
  }

  // Optional: hasVoted(id, address)
  if (CHECK_ADDRESS && typeof contract.hasVoted === "function") {
    try {
      const hv = await contract.hasVoted(VOTE_ID, CHECK_ADDRESS);
      console.log(`hasVoted(id=${VOTE_ID}, addr=${CHECK_ADDRESS}):`, hv);
    } catch (e) {
      console.log("hasVoted() call failed (not critical):", e.message || e);
    }
  }

  // Vote: need encrypted euint64 (bytes32) + attestation (bytes)
  const { ciphertext, attestation } = await getEncryptedOne(RELAYER);
  console.log("Relayer provided:", {
    ciphertext: `${ciphertext.slice(0,10)}...`,
    attestation: attestation === "0x" ? "(empty)" : "(present)"
  });

  console.log(`Sending vote on id=${VOTE_ID} …`);
  const tx = await contract.vote(VOTE_ID, ciphertext, attestation);
  console.log("tx hash:", tx.hash);
  const rc = await tx.wait();
  console.log("mined in block:", rc.blockNumber);

  // Read aggregates (encrypted) and try to decrypt
  if (typeof contract.getAggregates === "function") {
    try {
      const aggr = await contract.getAggregates(VOTE_ID);
      // getAggregates might return a struct or tuple; normalize to array of bytes32
      const ciphers = Array.isArray(aggr) ? aggr : Object.values(aggr);
      console.log("Encrypted aggregates:", ciphers);

      try {
        const vals = await decryptMany(RELAYER, ciphers);
        console.log("Decrypted aggregates:", vals);
      } catch (e) {
        console.log("Decrypt via relayer failed (you may need proper permissions):", e.message || e);
      }
    } catch (e) {
      console.log("getAggregates() call failed:", e.message || e);
    }
  } else {
    console.log("No getAggregates() in ABI");
  }

  // Owner-only (optional): makeTallyPublic(id)
  if (MAKE_PUBLIC && typeof contract.makeTallyPublic === "function") {
    try {
      const tx2 = await contract.makeTallyPublic(VOTE_ID);
      console.log("makeTallyPublic tx:", tx2.hash);
      await tx2.wait();
      console.log("makeTallyPublic done.");
    } catch (e) {
      console.log("makeTallyPublic failed (are you the owner?):", e.message || e);
    }
  }
}

main().catch((e) => {
  console.error("Error:", e.message || e);
  process.exit(1);
});
