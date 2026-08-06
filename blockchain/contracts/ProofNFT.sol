// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ProofNFT
 * @dev NFT representation of digital asset ownership.
 */
contract ProofNFT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    
    // Mapping from NFT token ID to the registered asset hash
    mapping(uint256 => bytes32) public tokenIdToAssetHash;

    event ProofMinted(address indexed owner, uint256 indexed tokenId, bytes32 assetHash);

    constructor() ERC721("ProofVault Asset", "PROOF") Ownable(msg.sender) {}

    /**
     * @notice Mints a new Proof-of-Ownership NFT.
     * @param to The address receiving the NFT.
     * @param assetHash The SHA-256 hash from the OwnershipRegistry.
     * @param uri The IPFS URI for the NFT metadata.
     */
    function mintProof(address to, bytes32 assetHash, string calldata uri) external returns (uint256) {
        // In a full integration, this could be restricted to the OwnershipRegistry contract
        // or check that the sender is the registered owner.
        
        uint256 tokenId = _nextTokenId++;
        _mint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        tokenIdToAssetHash[tokenId] = assetHash;
        
        emit ProofMinted(to, tokenId, assetHash);
        
        return tokenId;
    }
}
