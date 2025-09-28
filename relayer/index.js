import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();

const PORT       = process.env.PORT || 3001;
const RPC_URL    = process.env.RPC_URL    || 'https://fhevm.zama.ai';
const CRYPTO_URL = process.env.CRYPTO_URL || 'https://relayer.testnet.zama.cloud';

app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

// Forward to Zama Crypto relayer: POST /v1/encrypt  (expects {bits})
app.post('/encrypt-one', async (req, res) => {
  try {
    const bits = req.body?.bits ?? 64;
    const { data } = await axios.post(
      ${CRYPTO_URL}/v1/encrypt,
      { bits },
      { timeout: 30000 }
    );
    res.json(data);
  } catch (err) {
    console.error('encrypt-one error:', err.response?.status, err.response?.data || err.message);
    res.status(500).json({ error: 'encrypt-one failed' });
  }
});

// Optional: forward user decrypt to Zama: POST /v1/user-decrypt  (expects {ciphertexts:[...]})
app.post('/user-decrypt', async (req, res) => {
  try {
    const { data } = await axios.post(
      ${CRYPTO_URL}/v1/user-decrypt,
      req.body,
      { timeout: 30000 }
    );
    res.json(data);
  } catch (err) {
    console.error('user-decrypt error:', err.response?.status, err.response?.data || err.message);
    res.status(500).json({ error: 'user-decrypt failed' });
  }
});

// JSON-RPC passthrough to RPC_URL
app.post('/rpc', async (req, res) => {
  try {
    const { data } = await axios.post(RPC_URL, req.body, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    });
    res.json(data);
  } catch (err) {
    console.error('rpc error:', err.response?.status, err.response?.data || err.message);
    res.status(500).json({ error: 'rpc failed' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(Relayer listening on 0.0.0.0:${PORT});
});