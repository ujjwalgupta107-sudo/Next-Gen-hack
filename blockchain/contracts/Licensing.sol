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
 * @notice Production-grade decentralized multi-tier licensing and pull-withdrawal contract.
 * @dev Protects against zero-price front-running theft, overpayment swallowing, and reentrancy attacks.
 */
contract Licensing is Ownable, ReentrancyGuard {
    IOwnershipRegistry public immutable registry;

    enum LicenseType { Personal, Commercial, Exclusive }

    struct LicenseTerms {
        uint256 personalPrice;
        uint256 commercialPrice;
        uint256 exclusivePrice;
        bool isExclusiveSold;
        bool isInitialized;
    }

    struct LicenseRecord {
        LicenseType lType;
        address licensee;
        uint256 timestamp;
        uint256 pricePaid;
    }

    // Asset Hash => License Terms
    mapping(bytes32 => LicenseTerms) public terms;
    // Asset Hash => Licensee Address => License Record
    mapping(bytes32 => mapping(address => LicenseRecord)) public licenses;

    // Creator Address => Pending Withdrawal Balance (Pull over Push)
    mapping(address => uint256) public pendingWithdrawals;

    event TermsSet(bytes32 indexed assetHash, uint256 pPrice, uint256 cPrice, uint256 ePrice);
    event LicensePurchased(bytes32 indexed assetHash, address indexed buyer, LicenseType lType, uint256 price);
    event OverpaymentRefunded(address indexed buyer, uint256 refundAmount);
    event FundsWithdrawn(address indexed creator, uint256 amount);

    error NotOwner();
    error AssetNotRegistered();
    error TermsNotConfigured();
    error InsufficientPayment(uint256 provided, uint256 required);
    error ExclusiveAlreadySold();
    error LicenseAlreadyOwned();
    error NoFundsToWithdraw();
    error RefundFailed();
    error WithdrawalFailed();

    constructor(address _registryAddress) Ownable(msg.sender) {
        require(_registryAddress != address(0), "Invalid registry address");
        registry = IOwnershipRegistry(_registryAddress);
    }

    /**
     * @notice Sets the license terms for an asset. Only callable by the verified asset owner.
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
            isExclusiveSold: terms[assetHash].isExclusiveSold,
            isInitialized: true
        });

        emit TermsSet(assetHash, _personalPrice, _commercialPrice, _exclusivePrice);
    }

    /**
     * @notice Purchases a license for a registered asset with automatic overpayment refund.
     */
    function purchaseLicense(bytes32 assetHash, LicenseType lType) external payable nonReentrant {
        if (!registry.isRegistered(assetHash)) revert AssetNotRegistered();
        
        LicenseTerms storage assetTerms = terms[assetHash];
        // Prevent zero-price front-running before creator sets terms
        if (!assetTerms.isInitialized) revert TermsNotConfigured();
        if (assetTerms.isExclusiveSold) revert ExclusiveAlreadySold();

        // Check if address already owns a license for this asset
        if (licenses[assetHash][msg.sender].timestamp != 0) revert LicenseAlreadyOwned();

        uint256 requiredPrice;
        if (lType == LicenseType.Personal) requiredPrice = assetTerms.personalPrice;
        else if (lType == LicenseType.Commercial) requiredPrice = assetTerms.commercialPrice;
        else if (lType == LicenseType.Exclusive) requiredPrice = assetTerms.exclusivePrice;

        if (msg.value < requiredPrice) revert InsufficientPayment(msg.value, requiredPrice);

        if (lType == LicenseType.Exclusive) {
            assetTerms.isExclusiveSold = true;
        }

        // Record license issuance
        licenses[assetHash][msg.sender] = LicenseRecord({
            lType: lType,
            licensee: msg.sender,
            timestamp: block.timestamp,
            pricePaid: requiredPrice
        });

        // Credit creator balance
        address creator = registry.getOwner(assetHash);
        pendingWithdrawals[creator] += requiredPrice;

        emit LicensePurchased(assetHash, msg.sender, lType, requiredPrice);

        // Immediate automatic refund of any overpaid amount
        uint256 excess = msg.value - requiredPrice;
        if (excess > 0) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: excess}("");
            if (!refundSuccess) revert RefundFailed();
            emit OverpaymentRefunded(msg.sender, excess);
        }
    }

    /**
     * @notice Withdraws accumulated licensing revenue for a creator (Pull payment pattern).
     */
    function withdrawFunds() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        if (amount == 0) revert NoFundsToWithdraw();
        
        // Zero out balance before external transfer (Checks-Effects-Interactions)
        pendingWithdrawals[msg.sender] = 0;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) {
            pendingWithdrawals[msg.sender] = amount; // Restore state on failure
            revert WithdrawalFailed();
        }
        
        emit FundsWithdrawn(msg.sender, amount);
    }
}
