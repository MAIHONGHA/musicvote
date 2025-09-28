import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();

const PORT        = process.env.PORT || 3001;
const RPC_URL     = process.env.RPC_URL || 'https://eth-sepolia.public.blastapi.io';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/rpc', async (req, res) => {
  try {
    const { data } = await axios.post(RPC_URL, req.body, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    });
    res.json(data);
  } catch (err) {
    console.error('rpc error:', err.response?.status, err.response?.data || err.message);
    res.status(502).json({ error: 'rpc failed' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(Relayer listening on 0.0.0.0:${PORT});
});