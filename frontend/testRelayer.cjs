const axios = require("axios");
require("dotenv").config();

const RELAYER = process.env.VITE_RELAYER_URL;

async function run() {
  try {
    console.log("Relayer URL:", RELAYER);

    // 1) encrypt-one
    const enc = await axios.post(${RELAYER}/encrypt-one, { bits: 64 });
    console.log("Encrypt result:", enc.data);

    // 2) decrypt
    const dec = await axios.post(${RELAYER}/decrypt, { ciphertexts: ["0x00"] });
    console.log("Decrypt result:", dec.data);

  } catch (e) {
    console.error("Error:", e.message);
  }
}

run();