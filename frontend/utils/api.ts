import { Keypair } from "maci-domainobjs";
import { serializePubKey } from "./crypto";
import { addSignerDataToCache } from "./dexie";

export async function updateUserPublicKey(id: string, publicKey: string) {
  const body = {
    id,
    publicKey,
  };
  return await fetch(`/api/setPubKey`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function getUserPublicKey(id: string) {
  return fetch(`/api/getPubKey?id=${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
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

export async function revealCommitmentPool(
  commitmentPoolId: string,
  revealedSigners: string[]
) {
  const body = {
    id: commitmentPoolId,
    revealedSigners: revealedSigners,
  };
  return fetch(`/api/revealCommitmentPool`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// TODO: pass in a loading
export const checkCachedSignerData = (
  cachedSigner: { publicKey: string; privateKey: any } | undefined, // TODO: fix type
  session: any,
  toast: any
) => {
  //TODO: hacky fix to use globalComittmentPool
  //TODO: make more secure or encrypt or ask to store offline
  if (session || !cachedSigner) {
    const newPair = new Keypair();
    const pubKey = serializePubKey(newPair);
    const privKey = newPair.privKey.rawPrivKey.toString();
    //@ts-ignore TODO:
    updateUserPublicKey(session.user.id, pubKey).then((res) => {
      if (res.status === 200) {
        //@ts-ignore TODO:
        addSignerDataToCache(session.user.id, pubKey, privKey);
        toast({
          title:
            "Great! Issued a new private key. Please save this: " + privKey,
          status: "success",
          duration: 100000,
          isClosable: true,
        });
      } else if (res.status === 409) {
        // server already has a public key, out of sync
        res.json().then((body) => {
          console.log("server's pub key", body.publicKey);
        });
      }
    });
  } else if (session?.user && cachedSigner?.publicKey) {
    //@ts-ignore TODO:
    updateUserPublicKey(session.user.id, cachedSigner?.publicKey).then(
      (res) => {
        if (res.status === 409) {
          res.json().then((body) => {
            console.log("status 409, sync server pubkey", body.publicKey);
            console.log(
              "signer has pub key",
              cachedSigner.publicKey,
              body.publicKey
            );
            if (body.publicKey !== cachedSigner.publicKey) {
              // public key in server does not match local
              toast({
                title:
                  "Uh oh do you have your signer key pair? We seem out of sync",
                status: "error",
                duration: 3000,
                isClosable: true,
              });
            }
          });
        }
      }
    );
    // TODO: this case should not be needed
  } else if (session?.user && !cachedSigner?.publicKey) {
    const newPair = new Keypair();
    const pubKey = serializePubKey(newPair);
    const privKey = newPair.privKey.rawPrivKey.toString();
    //@ts-ignore TODO:
    updateUserPublicKey(session.user.id, pubKey).then((res) => {
      if (res.status === 200) {
        //@ts-ignore TODO:
        addSignerDataToCache(session.user.id, pubKey, privKey);
      } else if (res.status === 409) {
        // server already has a public key, out of sync
        toast({
          title: "Uh oh do you have your signer key pair? We seem out of sync",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    });
  } else if (session?.user && !cachedSigner?.privateKey) {
    toast({
      title:
        "Uh oh something went wrong, can you try again? Software sucks sorry",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  }
};
