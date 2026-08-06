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
 * @dev NFT representation of digital asset ownership.
 */
contract ProofNFT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    IOwnershipRegistry public registry;
    
    // Mapping from NFT token ID to the registered asset hash
    mapping(uint256 => bytes32) public tokenIdToAssetHash;

    event ProofMinted(address indexed owner, uint256 indexed tokenId, bytes32 assetHash);

    constructor(address _registryAddress) ERC721("ProofVault Asset", "PROOF") Ownable(msg.sender) {
        registry = IOwnershipRegistry(_registryAddress);
    }

    /**
     * @notice Mints a new Proof-of-Ownership NFT.
     * @param to The address receiving the NFT.
     * @param assetHash The SHA-256 hash from the OwnershipRegistry.
     * @param uri The IPFS URI for the NFT metadata.
     */
    function mintProof(address to, bytes32 assetHash, string calldata uri) external returns (uint256) {
        require(registry.isRegistered(assetHash), "Asset not registered");
        require(registry.getOwner(assetHash) == msg.sender, "Not the asset owner");
        
        uint256 tokenId = _nextTokenId++;
        _mint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        tokenIdToAssetHash[tokenId] = assetHash;
        
        emit ProofMinted(to, tokenId, assetHash);
        
        return tokenId;
    }
}
