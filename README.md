# zkPIN (power in numbers) - commitment pools with zkSNARKs

A project by [Jaclyn](https://twitter.com/straightupjac) and [Amir](https://twitter.com/amirbolous).

### Intro

**zkPIN is a new coordination mechanism built with zkSNARKs**. Vitalik has talked about the idea of [commitment pools](https://vitalik.ca/general/2022/06/12/nonfin.html) before, the problem is simple: you want to sign or endorse some idea, but you're only comfortable doing it publicly if enough other people also do so. Maybe it's some cancelable take, like "based is an annoying word shouldn't be used" (it's not, it's a great word, but you can imagine for things that are unpopular or more controversial people would only be comfortable sharing their endorsement if enough other people also do so), or something you don't feel comfortable initially sharing the idea of etc.

**How do we do this in a trust-minimized way**?

zkPIN is a basic implemention of this with snarks: users create commitment pools (call them the operator), anyone can then sign it and generate a zkSNARK proof (that attests to certain properties we'll elaborate on below), **but their affiliation remains anonymous to the server, operator, and public until the threshold is reached** (hence the name zkPIN or power in numbers). Note that by design, zkPIN only requires an **honest minority trust assumption between the operator and the server**. We'll elaborate on this construction more below, but both the server and the operator have to collude in order to dox signatures of people before a threshold for a commitment pool has been reached. Assuming one party is honest, this is effectively not possible (more details in the better guarantees section) i.e. the server has no knowledge of who signed it and neither does the operator until the threshold is reached.

### Basic flow and demo

Home page shows a list of commitment pools.

-   To interact with one or create your own, you need to log in.
-   When you log in, a new private, public keypair is generated for you, and your private key is stored in local storage. No private key ever touches our server, only the public keys are stored on our end.
-   Once you log in, you can create a commitment pool (this will generate a new operator private, public keypair which is stored in local storage) and set the threshold of signers required to reveal all endorsements.
-   Anyone who wants to sign a commitment pool can navigate to the pool on the home page, click it, then sign it. When you sign it, a new zkSNARK proof is generated that enforces some conditions which we describe below to ensure your attestation is valid.
-   Once enough signatures have accumalated (past the the size of the threshold), the operator will when they navigate back to the commitment pool see a "Reveal" button which they can now click to reveal all affiliations (note as a result, this does assume the operator is live for the full process to work, although there is no time limit for when the reveal needs to happen currently).

Full video of the demo is here:

https://user-images.githubusercontent.com/7995105/187604173-e4f961f6-7c5d-4d5f-8d9e-41754c03a7e8.mp4

### Important notices about the construction

In order to distribute the trust assumption before the threshold of signatures is reached, we designed the app in a trust-minimzed way, taking advantage of zkSNARKs to do so. The rough idea is that when we generate a signature, we create a SNARK proof that attests this signature was valid, keeping all revealing inputs private, **but allowing the operator + server to work together to derive the original signer after the threshold is reached**. When a user signs a commitment pool, we generate a zkSNARK proof and a ciphertext that is the symmetric encryption of the message (the commitment pool id) and a shared secret (between the operator and the signer). We'll explain some of this in more detail in the zkSNARK construction, but for now, we just need to know that the act of "signing" a commitment pool creates a zkSNARK proof (which we store on IPFS) and a ciphertext, which we store on our server.

The reason this app is **trust-minimized** by design, is that **neither the server nor the operator can alone figure out at any point in time before the threshold is reached who has signed a commitment pool without both colluding**. The reason is because the ciphertexts are stored on the server, but the server has no knowledge of the operator's private key. Similarly, the operator can decrypt the ciphertexts and find out who has signed it, but the operator has no knowledge of what the ciphertexts are nor the range of possible people who could have signed it. So the short summary is that we have two parts of data that both need to be used together to figure out who has signed a commitment pool, but each part is kept separate from the other until the threshold is reached. **Thus zkPIN has an honest minority trust assumption between the operator and the server**. Assuming one is honest, it's impossible to dox who has signed a commitment pool, both must collude in order to do so.

Note as a small point of nuance, the app will know once the threshold is reached by counting the number of ciphertexts i.e. for a new incoming signature before threshold is reached, the server checks if the list of ciphertexts is now equal to the

### zkSNARK Circuit Construction

The exact construction of this circuit is shown below.

```
I generate a snark proof that:

private input my_priv, my_pub, c
public inputs pool_pub, merkle_root, msg, chash

shared_secret = ecdh(my_priv, pool_pub)
c = sym_enc(msg, shared_secret)
my_pub in merkle_root
my_pub = pubkeygen(my_priv)
chash = hash(c)
```

The high level idea is as follows:

-   for every commitment pool, the creator of the pool is designated as the "operator" and a new private, public keypair is generated for that pool
-   for a signer coming in to sign this commitment pool, we generate a shared secret between their key and the operator's key with [Diffie-Hellman](https://en.wikipedia.org/wiki/Diffie%E2%80%93Hellman_key_exchange)
-   to provide some weak sybil resistance, we verify that the signer's public key is in a merkle root of all known "sybil-resistant" public keys. These are public keys which have
    verified their account by logging into Twitter (when you log in with Twitter for the first time, we add your generated public key to a merkle root of these "sybil-resistant" addresses we've lossely verified)
-   we verify the relationship between your private key and your public key (that the public key is in fact correctly derived from the private key)
-   finally, we verify the ciphertext hash provided is mapped correctly to the ciphertext
    -   note the resaon we do this as opposed to just providing the ciphertext as a public input is because proofs are stored on IPFS, so if an operator was able to access these proofs before the threshold was reached (if we wanted to have some more complex escrow scheme with better properties below), they'd be able to learn the ciphertexts themselves and "dox" the signers from the public signals. So instead the hash of the cihertext is a public input and the ciphertext is a private input

### Better guarantees

zkPIN has as we've discussed before, an honest minority trust assumption between the server and the operator, but implements no censorship-resistance. There are two ways we can get better guarantees

-   some escrow style system which requires staking and slashes the server/operator if they don't reveal their part of the data when the threshold is reached.
    -   currently, a malicious operator may choose to never reveal their private key when the threshold is reached or vice versa with the server and the ciphertexts, preventing us from "revealing" the commitment pool. Implementing a basic contract which requires operators and the server to stake some money and then slashes them if they don't provide the data (within some time frame) would provide a better economic incentive for censorship-resistance. Some brief explorations for this can be found under `commit_reveal` but these are currently incomplete (although very possible and feasible to implement).
-   to remove the need for an operator entirely, the gold standard would be having [threshold encryption](https://en.wikipedia.org/wiki/Threshold_cryptosystem) inside of a SNARK, that way we minimize trust at the lowest cryptography level, without the need for an operator.

### Disclaimer

Note this app is provided as a proof of concept, it has not been formally audited and as such there can be no assurance they will work as intended, and users may experience delays, failures, errors, omissions or loss of transmitted information. Authors are not liable for any of the foregoing. Users should proceed with caution and use at their own risk.

If you see any issues or have ideas for improvements, we welcome PRs!

### Credits

Thanks to [EthDataMarketplace](https://github.com/nulven/EthDataMarketplace/) and [maci](https://github.com/privacy-scaling-explorations/maci/tree/master/crypto) for initial inspirations behind the ZK construction. Thanks to [gubsheep](https://twitter.com/gubsheep), [Uma](https://twitter.com/pumatheuma), and many of the other Hack Lodge participants and mentors for help brainstorming.

_Created at HackLodge Crypto Edition 2022 (Sponsored by 0xParc)_
