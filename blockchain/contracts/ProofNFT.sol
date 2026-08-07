// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IOwnershipRegistry {
    function getOwner(bytes32 _sha256Hash) external view returns (address);
    function isRegistered(bytes32 _sha256Hash) external view returns (bool);
}

/**
 * @title ProofNFT
 * @notice ERC-721 Proof-of-Ownership Token tied to immutable hash registry records.
 * @dev Enforces 1-to-1 unique minting per registered asset hash to prevent duplicate supply dilution.
 */
contract ProofNFT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    IOwnershipRegistry public immutable registry;
    
    // Mapping from NFT token ID to the registered asset hash
    mapping(uint256 => bytes32) public tokenIdToAssetHash;
    // Mapping to guarantee exactly one Proof NFT per unique asset hash
    mapping(bytes32 => bool) public isAssetMinted;
    mapping(bytes32 => uint256) public assetHashToTokenId;

    event ProofMinted(address indexed owner, uint256 indexed tokenId, bytes32 indexed assetHash);

    error AssetNotRegistered();
    error NotAssetOwner();
    error NFTAlreadyMinted(bytes32 assetHash, uint256 existingTokenId);

    constructor(address _registryAddress) ERC721("ProofVault Asset", "PROOF") Ownable(msg.sender) {
        require(_registryAddress != address(0), "Invalid registry address");
        registry = IOwnershipRegistry(_registryAddress);
    }

    /**
     * @notice Mints a unique Proof-of-Ownership NFT for a registered asset.
     * @param to The address receiving the NFT.
     * @param assetHash The SHA-256 hash from the OwnershipRegistry.
     * @param uri The IPFS URI for the token metadata standard.
     */
    function mintProof(address to, bytes32 assetHash, string calldata uri) external returns (uint256) {
        if (!registry.isRegistered(assetHash)) revert AssetNotRegistered();
        if (registry.getOwner(assetHash) != msg.sender) revert NotAssetOwner();
        if (isAssetMinted[assetHash]) revert NFTAlreadyMinted(assetHash, assetHashToTokenId[assetHash]);

        uint256 tokenId = _nextTokenId++;
        isAssetMinted[assetHash] = true;
        assetHashToTokenId[assetHash] = tokenId;
        tokenIdToAssetHash[tokenId] = assetHash;

        _mint(to, tokenId);
        _setTokenURI(tokenId, uri);

        emit ProofMinted(to, tokenId, assetHash);

        return tokenId;
    }
}
