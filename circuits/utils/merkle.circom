pragma circom 2.0.5;

include "../../node_modules/circomlib/circuits/mimcsponge.circom";

template HashLeftRight() {
    signal input left;
    signal input right;
    signal output hash;

    component hasher = MiMCSponge(2, 220, 1);
    hasher.ins[0] <== left;
    hasher.ins[1] <== right;
    hasher.k <== 123;
    hash <== hasher.outs[0];
}

// if s == 0 returns [in[0], in[1]]
// if s == 1 returns [in[1], in[0]]
template DualMux() {
    signal input in[2];
    signal input s;
    signal output out[2];

    s * (1 - s) === 0;
    out[0] <== (in[1] - in[0])*s + in[0];
    out[1] <== (in[0] - in[1])*s + in[1];
}

// Verifies that merkle proof is correct for given merkle root and a leaf 
// In other words, verifies set membership in a merkle tree (an address is one of n
// NFT holders)
// pathIndices input is an array of 0/1 selectors telling whether given pathElement is on the left or right side of merkle path
// pathElements is the contents of the actual nodes on merkle path (in this case Ethereum addresses)
template MerkleTreeChecker(levels) {
    signal input leaf;
    signal input root;
    signal input pathElements[levels];
    signal input pathIndices[levels];

    component selectors[levels];
    component hashers[levels];

    signal zeroCheckers[levels+1];
    //I think this checks if we have a one-node merkle tree and if the root is the leaf in this case
    zeroCheckers[0] <== leaf - root;

    //note we start from levels with all the leaves i.e. depth = levels
    for (var i = 0; i < levels; i++) {
        selectors[i] = DualMux();
        selectors[i].in[0] <== i == 0 ? leaf : hashers[i - 1].hash;
        selectors[i].in[1] <== pathElements[i];
        selectors[i].s <== pathIndices[i];

        hashers[i] = HashLeftRight();
        hashers[i].left <== selectors[i].out[0];
        hashers[i].right <== selectors[i].out[1];
        //filling it at each level but we only care about performing the constraint at line 48 (at root level)
        //which encapsulates all of the logic for all of the levels
        zeroCheckers[i+1] <== zeroCheckers[i] * (hashers[i].hash - root);
    }

    zeroCheckers[levels] === 0;
}