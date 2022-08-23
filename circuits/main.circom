pragma circom 2.0.5;

include "./utils/ecdh.circom";
include "./utils/encrypt.circom";
include "./utils/merkle.circom";
include "./utils/pubKeyGen.circom";
include "../node_modules/circomlib/circuits/mimcsponge.circom";

//k size of element arrays
//merkle proof is of depth d
template Pin(d) {
    signal input poolPubKey[2];
    signal input merkleRoot;
    signal input msg;
    signal input ciphertext[2];

    //private inputs
    signal input signerPrivKeyHash;
    signal input signerPubKey[2]; 
    signal input pathElements[d];
    signal input pathIndices[d];

    
    //compute shared secret
    component ecdh = Ecdh();
    ecdh.private_key <== signerPrivKeyHash;
    ecdh.public_key[0] <== poolPubKey[0];
    ecdh.public_key[1] <== poolPubKey[1];

    log(9999999999);


    //constrain ciphertext
    component encrypt = Encrypt();
    encrypt.plaintext <== msg;
    encrypt.shared_key <== ecdh.shared_key;
    ciphertext[0] === encrypt.out[0];
    ciphertext[1] === encrypt.out[1];

    log(8888888);

    //public key in merkle tree of public keys
    component verifyMerkleProof = MerkleTreeChecker(d);

    component hasher = MiMCSponge(2, 220, 1);
    hasher.ins[0] <== signerPubKey[0];
    hasher.ins[1] <== signerPubKey[1];
    hasher.k <== 123;

    log(777777777);

    verifyMerkleProof.leaf <== hasher.outs[0];
    verifyMerkleProof.root <== merkleRoot;
    for (var i = 0; i < d; i++) {
        verifyMerkleProof.pathElements[i] <== pathElements[i];
        verifyMerkleProof.pathIndices[i] <== pathIndices[i];
    }

    log(666666);

    //verify priv, public key relationship
    component derivedPubKey = PrivToPubKey();
    derivedPubKey.privKey <== signerPrivKeyHash;
    derivedPubKey.pubKey[0] === signerPubKey[0];
    derivedPubKey.pubKey[1] === signerPubKey[1];

}

component main { public [poolPubKey, merkleRoot, msg, ciphertext] } = Pin(30);