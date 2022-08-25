// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

// import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract CommitReveal {
  uint256 public constant STAKE_PRICE = 0.07 ether; // stake price

  struct PoolData {
    string operatorPublicKey;
    string cipherTextCid; // points to IPFS cipher text proof
    // hashed off-chain with SHA256
    bytes32 operatorPrivateKeyHash;
    bytes32 cipherTextHash; // hash of cipher text array
  }

  mapping(uint256 => PoolData) public poolData; // map of commitmentPoolId -> PoolData

  constructor() {}

  /* MODFIERS */
  modifier isCorrectAmount() {
    require(msg.value == STAKE_PRICE, "incorrect ETH value sent");
    _;
  }

  // require that required hashes and information are all committed
  modifier readyToReveal(uint256 poolId) {
    require(
      bytes(poolData[poolId].operatorPublicKey).length != 0,
      "operator has not committed public key"
    );
    // comparing bytes32
    require(
      poolData[poolId].operatorPrivateKeyHash[0] != 0,
      "operator has not committed private key hash"
    );
    // comparing bytes32
    require(
      poolData[poolId].cipherTextHash[0] != 0,
      "server has not commited cipher hash"
    );
    require(
      bytes(poolData[poolId].cipherTextCid).length != 0,
      "server has not commited cipher cid"
    );
    _;
  }

  /* ACTIONS */
  /**
   * @dev
   */
  function commitOperator(
    uint256 poolId,
    string calldata _operatorPublicKey,
    bytes32 _operatorPrivateKeyHash
  ) external payable isCorrectAmount {
    poolData[poolId].operatorPublicKey = _operatorPublicKey;
    poolData[poolId].operatorPrivateKeyHash = _operatorPrivateKeyHash;
  }

  function commitCipher(
    uint256 poolId,
    bytes32 _cipherTextHash,
    string calldata _cipherTextCid
  ) external payable isCorrectAmount {
    poolData[poolId].cipherTextHash = _cipherTextHash;
    poolData[poolId].cipherTextCid = _cipherTextCid;
  }

  // withdraws stake upon reveal of private key
  function revealOperator(uint256 poolId, string calldata privateKey)
    external
    readyToReveal(poolId)
  {
    require(
      poolData[poolId].operatorPrivateKeyHash == sha256(abi.encode(privateKey)),
      "private key hash does not match"
    );
    payable(msg.sender).transfer(STAKE_PRICE ether);
  }

  // withdraws stake upon reveal of cipher text
  function revealCipher(uint256 poolId, bytes[] calldata cipherText)
    external
    readyToReveal(poolId)
  {
    require(
      poolData[poolId].cipherTextHash == sha256(abi.encode(cipherText)),
      "cipher text hash does not match"
    );
    payable(msg.sender).transfer(STAKE_PRICE ether);
  }
}
