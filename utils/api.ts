import axios from "axios";

export async function updateUserPublicKey(id: string, publicKey: string) {
  await axios.put("/api/setPubKey", {
    id,
    publicKey,
  });
}
