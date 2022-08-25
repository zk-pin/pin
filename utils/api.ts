export async function updateUserPublicKey(id: string, publicKey: string) {
  const body = {
    id,
    publicKey,
  };
  return fetch(`/api/setPubKey`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function setSignature(
  proof: any,
  publicSignals: any,
  ciphertext: any,
  commitmentPoolId: string
) {
  const body = {
    proof,
    publicSignals,
    ciphertext,
    commitmentPoolId,
  };

  return fetch(`/api/setSignature`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
