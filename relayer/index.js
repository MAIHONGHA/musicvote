import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3001;
const FHE_RPC = process.env.FHE_RPC || 'https://fhevm.zama.ai';

app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/encrypt-one', async (req, res) => {
  try {
    const bits = req.body?.bits ?? 64;
    const { data } = await axios.post(${FHE_RPC}/encrypt-one, { bits });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'encrypt-one failed' });
  }
});

app.post('/rpc', async (req, res) => {
  try {
    const { data } = await axios.post(FHE_RPC, req.body, {
      headers: { 'Content-Type': 'application/json' },
    });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'rpc proxy failed' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(Relayer listening on 0.0.0.0:${PORT});
});