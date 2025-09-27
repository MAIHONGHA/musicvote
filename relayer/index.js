import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || process.env.RELAYER_PORT || 3001;
const FHE_RPC = process.env.FHE_RPC || 'https://fhevm.zama.ai';

app.get('/', (_req, res) => res.send('Relayer is running!'));
app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/encrypt-one', async (req, res) => {
  try {
    const bits = req.body.bits || 64;
    const { data } = await axios.post(`${FHE_RPC}/encrypt-one`, { bits });
    res.json(data);
  } catch (err) {
    console.error('Error at /encrypt-one:', err.message);
    res.status(500).json({ error: 'Relayer failed at encrypt-one' });
  }
});

app.post('/rpc', async (req, res) => {
  try {
    const { data } = await axios.post(FHE_RPC, req.body, {
      headers: { 'Content-Type': 'application/json' },
    });
    res.json(data);
  } catch (err) {
    console.error('Error at /rpc:', err.message);
    res.status(500).json({ error: 'Relayer failed at /rpc' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Relayer listening on 0.0.0.0:${PORT}`);
});
