import { Keypair } from "maci-domainobjs";
import CommitmentPool from "pages/pool/[id]";
import { serializePubKey } from "./crypto";
import { addSignerDataToCache } from "./dexie";
import { IDecryptedSigners, IRevealedSigners } from "./types";

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
  revealedSigners: IDecryptedSigners[]
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
  cachedSigner: { publicKey: string; privateKey: string } | undefined,
  session: any,
  toast: any
): boolean | undefined => {
  if (session || !cachedSigner) {
    const newPair = new Keypair();
    const pubKey = serializePubKey(newPair);
    const privKey = newPair.privKey.rawPrivKey.toString();
    console.log("Attempting to update user public key.");
    //@ts-ignore TODO:
    updateUserPublicKey(session.user.id, pubKey).then((res) => {
      if (res.status === 200) {
        //@ts-ignore TODO:
        addSignerDataToCache(session.user.id, pubKey, privKey);
        console.log("successfully updated user public key");
        toast({
          title:
            "Great! Issued a new private key. Please save this: " + privKey,
          status: "success",
          duration: 100000,
          isClosable: true,
        });
        return true;
      } else if (res.status === 409) {
        // server already has a public key, out of sync
        res.json().then((body) => {
          console.log(
            "this is the server's pub key we have on file",
            body.publicKey
          );
        });
      }
    });
  } else if (session?.user && cachedSigner?.publicKey) {
    //@ts-ignore TODO:
    updateUserPublicKey(session.user.id, cachedSigner?.publicKey).then(
      (res) => {
        if (res.status === 409) {
          res.json().then((body) => {
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
        return true;
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

  console.log("all done with updates");
  return false;
};

export const addRevealedSigner = async (
  commitmentPoolId: string,
  revealedPublicKeys: IRevealedSigners[],
  userId: string
) => {
  const body = {
    // appending all userIds
    newRevealedSigners: [...revealedPublicKeys.map((el) => el.user.id), userId],
    commitmentPoolId: commitmentPoolId,
  };
  return await fetch(`/api/addRevealedSigner`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
};
