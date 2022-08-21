include "./utils/ecdh.circom";
include "./utils/encrypt.circom";
include "./utils/merkle.circom";
include "./utils/pubKeyGen.circom";

//k size of element arrays
//merkle proof is of depth d
template Pin(k, d) {
    assert(k >= 2);
    assert(k <= 100);

    signal input poolPubKey;
    signal input merkleRoot;
    signal input msg;
    signal input cyphertext[k];

    //private inputs
    signal input signerPrivKeyHash;
    signal input signerPubKey[k]; 
    signal input pathElements[d];
    signal input pathIndices[d];

    //compute shared secret
    component ecdh = Ecdh();
    ecdh.private_key <== signerPrivKeyHash;
    ecdh.public_key[0] <== signerPubKey[0];
    ecdh.public_key[1] <== signerPubKey[1];


    //constrain cyphertext
    component encrypt = Encrypt();
    encrypt.plaintext <== msg;
    encrypt.shared_key <== ecdh.shared_key;
    cyphertext[0] <== encrypt.out[0];
    cyphertext[1] <== encrypt.out[1];

    //public key in merkle tree of public keys
    component verifyMerkleProof = MerkleTreeChecker(d);
    //TODO: FIX
    verifyMerkleProof.leaf <== signerPubKey;
    verifyMerkleProof.root <== merkleRoot;
    for (var i = 0; i < d; i++) {
        verifyMerkleProof.pathElements[i] <== pathElements[i];
        verifyMerkleProof.pathIndices[i] <== pathIndices[i];
    }

    //verify priv, public key relationship
    component derivedPubKey = PrivToPubKey();
    derivedPubKey.privKey <== signerPrivKeyHash;
    derivedPubKey.pubKey[0] === signerPubKey[0];
    derivedPubKey.pubKey[1] === signerPubKey[1];

}

component main { public [poolPubKey, merkleRoot, msg, cyphertext] } = Pin(2, 30);