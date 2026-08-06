import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy OwnershipRegistry
  const Registry = await ethers.getContractFactory("OwnershipRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("OwnershipRegistry deployed to:", registryAddress);

  // Deploy ProofNFT
  const ProofNFT = await ethers.getContractFactory("ProofNFT");
  const proofNFT = await ProofNFT.deploy();
  await proofNFT.waitForDeployment();
  const proofNFTAddress = await proofNFT.getAddress();
  console.log("ProofNFT deployed to:", proofNFTAddress);

  // Deploy Licensing
  const Licensing = await ethers.getContractFactory("Licensing");
  const licensing = await Licensing.deploy(registryAddress);
  await licensing.waitForDeployment();
  const licensingAddress = await licensing.getAddress();
  console.log("Licensing deployed to:", licensingAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
