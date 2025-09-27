const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

function pad32(hex) {
  return "0x" + String(hex).replace(/^0x/, "").padStart(64, "0");
}

app.post("/encrypt-one", (req, res) => {
  const n = 1n;
  res.json({ ciphertext: pad32(n.toString(16)) });
});

app.post("/encrypt-rating", (req, res) => {
  const v = Number((req.body && req.body.value) || 0);
  const n = BigInt(v);
  res.json({
    ciphertext: pad32(n.toString(16)),
    attestation: "0x" + "11".repeat(32),
  });
});

app.post("/decrypt", (req, res) => {
  const arr = (req.body && Array.isArray(req.body.ciphertexts)) ? req.body.ciphertexts : [];
  const values = arr.map((ct) => {
    const h = String(ct).replace(/^0x/, "");
    if (!/^[0-9a-fA-F]+$/.test(h)) return 0;
    try { return Number(BigInt("0x" + h)); } catch { return 0; }
  });
  res.json({ values });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("Relayer listening on http://localhost:" + PORT);
});