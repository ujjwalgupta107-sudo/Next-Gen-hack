// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title OwnershipRegistry
 * @notice Immutable decentralized registry for digital asset proofs with cryptographic commit-reveal front-running defense.
 */
contract OwnershipRegistry is Ownable, ReentrancyGuard {
    struct Asset {
        bytes32 sha256Hash;
        bytes32 aiFingerprintHash;
        string ipfsCID;
        address owner;
        uint256 timestamp;
    }

    // Commitment timelock parameters (Polygon block times: ~2.1 seconds)
    uint256 public constant MIN_COMMITMENT_AGE = 2; // Minimum blocks before reveal to defeat mempool front-running
    uint256 public constant MAX_COMMITMENT_AGE = 256; // Expiration window for stale commitments

    // Mapping from sha256Hash to Asset
    mapping(bytes32 => Asset) public assets;

    // Commitments: hash => block number when committed
    mapping(bytes32 => uint256) public commitments;

    // Events
    event AssetRegistered(
        bytes32 indexed sha256Hash,
        address indexed owner,
        string ipfsCID,
        uint256 timestamp
    );
    event CommitmentMade(bytes32 indexed commitment, address indexed sender, uint256 blockNumber);

    // Custom errors for gas efficiency and precise auditing
    error AssetAlreadyRegistered(bytes32 sha256Hash);
    error InvalidInput();
    error InvalidCommitment();
    error CommitmentTooRecent(uint256 currentBlock, uint256 commitBlock, uint256 minWait);
    error CommitmentExpired(uint256 currentBlock, uint256 commitBlock, uint256 maxAge);

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Submits a cryptographic commitment to protect against mempool front-running.
     * @param _commitment keccak256(abi.encodePacked(_sha256Hash, _salt, msg.sender))
     */
    function commitAsset(bytes32 _commitment) external {
        if (_commitment == bytes32(0)) revert InvalidInput();
        commitments[_commitment] = block.number;
        emit CommitmentMade(_commitment, msg.sender, block.number);
    }

    /**
     * @notice Registers a new digital asset with validated commit-reveal timelock defense.
     */
    function registerAssetWithCommitment(
        bytes32 _sha256Hash,
        bytes32 _aiFingerprintHash,
        string calldata _ipfsCID,
        bytes32 _salt
    ) external nonReentrant {
        bytes32 expectedCommitment = keccak256(abi.encodePacked(_sha256Hash, _salt, msg.sender));
        uint256 commitBlock = commitments[expectedCommitment];

        if (commitBlock == 0) revert InvalidCommitment();
        if (block.number < commitBlock + MIN_COMMITMENT_AGE) {
            revert CommitmentTooRecent(block.number, commitBlock, MIN_COMMITMENT_AGE);
        }
        if (block.number > commitBlock + MAX_COMMITMENT_AGE) {
            delete commitments[expectedCommitment];
            revert CommitmentExpired(block.number, commitBlock, MAX_COMMITMENT_AGE);
        }

        // Delete commitment immediately to prevent replay attacks
        delete commitments[expectedCommitment];

        _internalRegister(_sha256Hash, _aiFingerprintHash, _ipfsCID);
    }

    /**
     * @notice Direct asset registration (for immediate registration when front-running defense is handled off-chain/private RPC).
     */
    function registerAsset(
        bytes32 _sha256Hash,
        bytes32 _aiFingerprintHash,
        string calldata _ipfsCID
    ) external nonReentrant {
        _internalRegister(_sha256Hash, _aiFingerprintHash, _ipfsCID);
    }

    function _internalRegister(
        bytes32 _sha256Hash,
        bytes32 _aiFingerprintHash,
        string calldata _ipfsCID
    ) internal {
        if (_sha256Hash == bytes32(0)) revert InvalidInput();
        if (bytes(_ipfsCID).length == 0) revert InvalidInput();
        if (assets[_sha256Hash].timestamp != 0) revert AssetAlreadyRegistered(_sha256Hash);

        Asset memory newAsset = Asset({
            sha256Hash: _sha256Hash,
            aiFingerprintHash: _aiFingerprintHash,
            ipfsCID: _ipfsCID,
            owner: msg.sender,
            timestamp: block.timestamp
        });

        assets[_sha256Hash] = newAsset;

        emit AssetRegistered(_sha256Hash, msg.sender, _ipfsCID, block.timestamp);
    }

    /**
     * @notice Checks if an asset is registered.
     */
    function isRegistered(bytes32 _sha256Hash) external view returns (bool) {
        return assets[_sha256Hash].timestamp != 0;
    }

    /**
     * @notice Retrieves the owner of a registered asset.
     */
    function getOwner(bytes32 _sha256Hash) external view returns (address) {
        return assets[_sha256Hash].owner;
    }
}
