import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();

const PORT         = process.env.PORT  process.env.RELAYER_PORT  3001;
const FHE_RPC      = process.env.FHE_RPC || 'https://fhevm.zama.ai';
const CORS_ORIGIN  = process.env.CORS_ORIGIN || '*';

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

app.get('/', (_req, res) => res.send('Relayer is running!'));
app.get('/health', (_req, res) => res.json({ ok: true }));

// Forward JSON-RPC requests to FHEVM
app.post('/rpc', async (req, res) => {
  try {
    const { data } = await axios.post(FHE_RPC, req.body, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'rpc failed', detail: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(Relayer listening on 0.0.0.0:${PORT});
});