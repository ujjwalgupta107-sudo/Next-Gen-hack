// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title OwnershipRegistry
 * @dev Immutable registry for digital asset ownership proofs.
 */
contract OwnershipRegistry is Ownable, ReentrancyGuard {
    struct Asset {
        bytes32 sha256Hash;
        bytes32 aiFingerprintHash;
        string ipfsCID;
        address owner;
        uint256 timestamp;
    }

    // Mapping from sha256Hash to Asset
    mapping(bytes32 => Asset) public assets;

    // Events
    event AssetRegistered(
        bytes32 indexed sha256Hash,
        address indexed owner,
        string ipfsCID,
        uint256 timestamp
    );

    error AssetAlreadyRegistered(bytes32 sha256Hash);
    error InvalidInput();

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Registers a new digital asset.
     * @param _sha256Hash The primary SHA-256 hash of the file.
     * @param _aiFingerprintHash The AI-generated perceptual/embedding hash.
     * @param _ipfsCID The IPFS CID containing asset metadata/encrypted file.
     */
    function registerAsset(
        bytes32 _sha256Hash,
        bytes32 _aiFingerprintHash,
        string calldata _ipfsCID
    ) external nonReentrant {
        if (_sha256Hash == bytes32(0)) revert InvalidInput();
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
     * @param _sha256Hash The SHA-256 hash to check.
     * @return bool True if registered, false otherwise.
     */
    function isRegistered(bytes32 _sha256Hash) external view returns (bool) {
        return assets[_sha256Hash].timestamp != 0;
    }

    /**
     * @notice Retrieves the owner of a registered asset.
     * @param _sha256Hash The SHA-256 hash.
     * @return address The owner's address.
     */
    function getOwner(bytes32 _sha256Hash) external view returns (address) {
        return assets[_sha256Hash].owner;
    }
}
