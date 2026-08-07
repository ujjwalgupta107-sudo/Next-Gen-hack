const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ProofVault Smart Contracts Production Security Suite", function () {
  let registry;
  let proofNFT;
  let licensing;
  let owner;
  let creator;
  let buyer;

  const sampleSha256 = ethers.keccak256(ethers.toUtf8Bytes("sample_image_content"));
  const sampleAiHash = ethers.keccak256(ethers.toUtf8Bytes("sample_ai_fingerprint"));
  const sampleIpfsCID = "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco";

  beforeEach(async function () {
    [owner, creator, buyer] = await ethers.getSigners();

    // Deploy OwnershipRegistry
    const RegistryFactory = await ethers.getContractFactory("OwnershipRegistry");
    registry = await RegistryFactory.deploy();
    await registry.waitForDeployment();
    const registryAddress = await registry.getAddress();

    // Deploy ProofNFT
    const ProofNFTFactory = await ethers.getContractFactory("ProofNFT");
    proofNFT = await ProofNFTFactory.deploy(registryAddress);
    await proofNFT.waitForDeployment();

    // Deploy Licensing
    const LicensingFactory = await ethers.getContractFactory("Licensing");
    licensing = await LicensingFactory.deploy(registryAddress);
    await licensing.waitForDeployment();
  });

  describe("OwnershipRegistry Contract", function () {
    it("should allow a creator to directly register an asset", async function () {
      await expect(registry.connect(creator).registerAsset(sampleSha256, sampleAiHash, sampleIpfsCID))
        .to.emit(registry, "AssetRegistered");

      expect(await registry.isRegistered(sampleSha256)).to.equal(true);
      expect(await registry.getOwner(sampleSha256)).to.equal(creator.address);
    });

    it("should prevent duplicate registration of the same sha256 hash", async function () {
      await registry.connect(creator).registerAsset(sampleSha256, sampleAiHash, sampleIpfsCID);
      await expect(
        registry.connect(buyer).registerAsset(sampleSha256, sampleAiHash, sampleIpfsCID)
      ).to.be.revertedWithCustomError(registry, "AssetAlreadyRegistered");
    });

    it("should revert if empty sha256 hash or empty IPFS CID is provided", async function () {
      await expect(
        registry.connect(creator).registerAsset(ethers.ZeroHash, sampleAiHash, sampleIpfsCID)
      ).to.be.revertedWithCustomError(registry, "InvalidInput");

      await expect(
        registry.connect(creator).registerAsset(sampleSha256, sampleAiHash, "")
      ).to.be.revertedWithCustomError(registry, "InvalidInput");
    });

    it("should enforce timelock on commit-reveal anti-frontrunning registration", async function () {
      const salt = ethers.keccak256(ethers.toUtf8Bytes("random_salt_123"));
      const commitment = ethers.solidityPackedKeccak256(
        ["bytes32", "bytes32", "address"],
        [sampleSha256, salt, creator.address]
      );

      await expect(registry.connect(creator).commitAsset(commitment))
        .to.emit(registry, "CommitmentMade");

      // Attempt immediate reveal in same block must revert due to MIN_COMMITMENT_AGE
      await expect(
        registry.connect(creator).registerAssetWithCommitment(sampleSha256, sampleAiHash, sampleIpfsCID, salt)
      ).to.be.revertedWithCustomError(registry, "CommitmentTooRecent");

      // Advance blocks
      await ethers.provider.send("evm_mine");
      await ethers.provider.send("evm_mine");

      // Successful reveal after timelock
      await expect(
        registry.connect(creator).registerAssetWithCommitment(sampleSha256, sampleAiHash, sampleIpfsCID, salt)
      ).to.emit(registry, "AssetRegistered");

      expect(await registry.isRegistered(sampleSha256)).to.equal(true);
    });
  });

  describe("ProofNFT Contract", function () {
    beforeEach(async function () {
      await registry.connect(creator).registerAsset(sampleSha256, sampleAiHash, sampleIpfsCID);
    });

    it("should allow creator to mint an NFT for registered asset", async function () {
      const nftUri = `ipfs://${sampleIpfsCID}/nft.json`;
      await expect(proofNFT.connect(creator).mintProof(creator.address, sampleSha256, nftUri))
        .to.emit(proofNFT, "ProofMinted")
        .withArgs(creator.address, 0, sampleSha256);

      expect(await proofNFT.ownerOf(0)).to.equal(creator.address);
      expect(await proofNFT.tokenURI(0)).to.equal(nftUri);
      expect(await proofNFT.tokenIdToAssetHash(0)).to.equal(sampleSha256);
      expect(await proofNFT.isAssetMinted(sampleSha256)).to.equal(true);
    });

    it("should prevent duplicate minting of NFT for the same asset hash", async function () {
      const nftUri = `ipfs://${sampleIpfsCID}/nft.json`;
      await proofNFT.connect(creator).mintProof(creator.address, sampleSha256, nftUri);

      await expect(
        proofNFT.connect(creator).mintProof(creator.address, sampleSha256, nftUri)
      ).to.be.revertedWithCustomError(proofNFT, "NFTAlreadyMinted");
    });

    it("should prevent non-owner from minting NFT for an asset", async function () {
      const nftUri = `ipfs://${sampleIpfsCID}/nft.json`;
      await expect(
        proofNFT.connect(buyer).mintProof(buyer.address, sampleSha256, nftUri)
      ).to.be.revertedWithCustomError(proofNFT, "NotAssetOwner");
    });
  });

  describe("Licensing Contract Security", function () {
    const pPrice = ethers.parseEther("0.01");
    const cPrice = ethers.parseEther("0.05");
    const ePrice = ethers.parseEther("0.2");

    beforeEach(async function () {
      await registry.connect(creator).registerAsset(sampleSha256, sampleAiHash, sampleIpfsCID);
    });

    it("should prevent zero-price frontrunning before creator sets terms", async function () {
      // Attempting to buy before setLicenseTerms must fail
      await expect(
        licensing.connect(buyer).purchaseLicense(sampleSha256, 2, { value: 0 })
      ).to.be.revertedWithCustomError(licensing, "TermsNotConfigured");
    });

    it("should allow creator to set terms and buyer to purchase license", async function () {
      await licensing.connect(creator).setLicenseTerms(sampleSha256, pPrice, cPrice, ePrice);

      const terms = await licensing.terms(sampleSha256);
      expect(terms.personalPrice).to.equal(pPrice);
      expect(terms.commercialPrice).to.equal(cPrice);
      expect(terms.exclusivePrice).to.equal(ePrice);
      expect(terms.isInitialized).to.equal(true);

      await expect(
        licensing.connect(buyer).purchaseLicense(sampleSha256, 0, { value: pPrice })
      ).to.emit(licensing, "LicensePurchased")
        .withArgs(sampleSha256, buyer.address, 0, pPrice);

      expect(await licensing.pendingWithdrawals(creator.address)).to.equal(pPrice);
    });

    it("should automatically refund overpayment when buyer sends excess ETH", async function () {
      await licensing.connect(creator).setLicenseTerms(sampleSha256, pPrice, cPrice, ePrice);

      const overpayment = ethers.parseEther("0.05"); // pPrice is 0.01
      const initialBuyerBalance = await ethers.provider.getBalance(buyer.address);

      const tx = await licensing.connect(buyer).purchaseLicense(sampleSha256, 0, { value: overpayment });
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;

      const finalBuyerBalance = await ethers.provider.getBalance(buyer.address);

      // Buyer should only have lost pPrice + gasCost, because 0.04 excess was refunded
      expect(initialBuyerBalance - finalBuyerBalance - gasCost).to.equal(pPrice);
      // Creator balance should only receive exact price
      expect(await licensing.pendingWithdrawals(creator.address)).to.equal(pPrice);
    });

    it("should allow creator to withdraw accumulated funds", async function () {
      await licensing.connect(creator).setLicenseTerms(sampleSha256, pPrice, cPrice, ePrice);
      await licensing.connect(buyer).purchaseLicense(sampleSha256, 1, { value: cPrice });

      const initialBalance = await ethers.provider.getBalance(creator.address);
      const tx = await licensing.connect(creator).withdrawFunds();
      const receipt = await tx.wait();
      const gasSpent = receipt.gasUsed * receipt.gasPrice;

      const finalBalance = await ethers.provider.getBalance(creator.address);
      expect(finalBalance + gasSpent - initialBalance).to.equal(cPrice);
    });
  });
});
