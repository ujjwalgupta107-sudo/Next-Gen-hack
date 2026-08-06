// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IOwnershipRegistry {
    function getOwner(bytes32 _sha256Hash) external view returns (address);
    function isRegistered(bytes32 _sha256Hash) external view returns (bool);
}

/**
 * @title Licensing
 * @dev Manages the purchasing of licenses for registered assets.
 */
contract Licensing is Ownable, ReentrancyGuard {
    IOwnershipRegistry public registry;

    enum LicenseType { Personal, Commercial, Exclusive }

    struct LicenseTerms {
        uint256 personalPrice;
        uint256 commercialPrice;
        uint256 exclusivePrice;
        bool isExclusiveSold;
    }

    struct LicenseRecord {
        LicenseType lType;
        address licensee;
        uint256 timestamp;
    }

    // Asset Hash => License Terms
    mapping(bytes32 => LicenseTerms) public terms;
    // Asset Hash => Licensee Address => License Record
    mapping(bytes32 => mapping(address => LicenseRecord)) public licenses;

    // Creator Address => Pending Withdrawal Amount
    mapping(address => uint256) public pendingWithdrawals;

    event TermsSet(bytes32 indexed assetHash, uint256 pPrice, uint256 cPrice, uint256 ePrice);
    event LicensePurchased(bytes32 indexed assetHash, address indexed buyer, LicenseType lType, uint256 price);
    event FundsWithdrawn(address indexed creator, uint256 amount);

    error NotOwner();
    error AssetNotRegistered();
    error InvalidPayment();
    error ExclusiveAlreadySold();
    error LicenseAlreadyOwned();
    error NoFundsToWithdraw();

    constructor(address _registryAddress) Ownable(msg.sender) {
        registry = IOwnershipRegistry(_registryAddress);
    }

    /**
     * @notice Sets the license terms for an asset. Only callable by the asset owner.
     */
    function setLicenseTerms(
        bytes32 assetHash,
        uint256 _personalPrice,
        uint256 _commercialPrice,
        uint256 _exclusivePrice
    ) external {
        if (!registry.isRegistered(assetHash)) revert AssetNotRegistered();
        if (registry.getOwner(assetHash) != msg.sender) revert NotOwner();

        terms[assetHash] = LicenseTerms({
            personalPrice: _personalPrice,
            commercialPrice: _commercialPrice,
            exclusivePrice: _exclusivePrice,
            isExclusiveSold: terms[assetHash].isExclusiveSold
        });

        emit TermsSet(assetHash, _personalPrice, _commercialPrice, _exclusivePrice);
    }

    /**
     * @notice Purchases a license for a registered asset.
     */
    function purchaseLicense(bytes32 assetHash, LicenseType lType) external payable nonReentrant {
        if (!registry.isRegistered(assetHash)) revert AssetNotRegistered();
        
        LicenseTerms storage assetTerms = terms[assetHash];
        if (assetTerms.isExclusiveSold) revert ExclusiveAlreadySold();

        // Check if already owns a license (simplified: one license per address per asset)
        if (licenses[assetHash][msg.sender].timestamp != 0) revert LicenseAlreadyOwned();

        uint256 requiredPrice;
        if (lType == LicenseType.Personal) requiredPrice = assetTerms.personalPrice;
        else if (lType == LicenseType.Commercial) requiredPrice = assetTerms.commercialPrice;
        else if (lType == LicenseType.Exclusive) requiredPrice = assetTerms.exclusivePrice;

        if (msg.value < requiredPrice) revert InvalidPayment();

        if (lType == LicenseType.Exclusive) {
            assetTerms.isExclusiveSold = true;
        }

        // Record the license
        licenses[assetHash][msg.sender] = LicenseRecord({
            lType: lType,
            licensee: msg.sender,
            timestamp: block.timestamp
        });

        // Add to creator's pending withdrawals (Pull over Push)
        address creator = registry.getOwner(assetHash);
        pendingWithdrawals[creator] += msg.value;

        emit LicensePurchased(assetHash, msg.sender, lType, msg.value);
    }

    /**
     * @notice Withdraws accumulated funds for a creator.
     */
    function withdrawFunds() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        if (amount == 0) revert NoFundsToWithdraw();
        
        pendingWithdrawals[msg.sender] = 0;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit FundsWithdrawn(msg.sender, amount);
    }
}
