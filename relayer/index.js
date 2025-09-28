require("dotenv/config");
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT        = process.env.PORT || 3001;
const RPC_URL     = process.env.RPC_URL || "https://eth-sepolia.public.blastapi.io";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

app.get("/health", function (req, res) {
  res.json({ ok: true });
});

app.post("/rpc", function (req, res) {
  axios.post(RPC_URL, req.body, {
    headers: { "Content-Type": "application/json" },
    timeout: 30000
  })
  .then(r => res.json(r.data))
  .catch(err => {
    console.error("rpc error:",
      (err.response && err.response.status) || "",
      (err.response && err.response.data) || err.message
    );
    res.status(502).json({ error: "rpc failed" });
  });
});

app.listen(PORT, "0.0.0.0", function () {
  console.log("Relayer listening on 0.0.0.0:" + PORT);
});