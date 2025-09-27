import axios from "axios";

const RAW_URL = import.meta.env.VITE_RELAYER_URL ?? "";
const RELAYER_URL = RAW_URL.replace(/\/+$/, "");

export async function encryptRating(value, bits = 64) {
  if (!RELAYER_URL) throw new Error("Missing VITE_RELAYER_URL in .env");
  const { data } = await axios.post(`${RELAYER_URL}/encrypt-rating`, { value, bits });
  if (!data || typeof data.ciphertext !== "string" || typeof data.attestation !== "string") {
    throw new Error("encrypt-rating: bad response");
  }
  return { ciphertext: data.ciphertext, attestation: data.attestation };
}

export async function decryptMany(ciphertexts) {
  if (!RELAYER_URL) throw new Error("Missing VITE_RELAYER_URL in .env");
  if (!Array.isArray(ciphertexts) || ciphertexts.length === 0) {
    throw new Error("decryptMany: ciphertexts must be a non-empty array");
  }
  const { data } = await axios.post(`${RELAYER_URL}/decrypt`, { ciphertexts });
  if (!data || !Array.isArray(data.values)) throw new Error("decrypt: bad response");
  return data.values.map(Number);
}
