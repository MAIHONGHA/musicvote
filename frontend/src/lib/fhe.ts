import { createInstance, SepoliaConfig } from "@zama-fhe/relayer-sdk";

let _i: Awaited<ReturnType<typeof createInstance>> | undefined;

export async function relayer() {
  return _i ?? (_i = await createInstance(SepoliaConfig));
}