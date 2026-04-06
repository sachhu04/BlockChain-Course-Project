import { expect } from "chai";
import hre from "hardhat";

describe("WarrantyTracker", function () {
  let warrantyTracker;
  let owner;

  beforeEach(async function () {
    [owner] = await hre.ethers.getSigners();
    const WarrantyTracker = await hre.ethers.getContractFactory("WarrantyTracker");
    warrantyTracker = await WarrantyTracker.deploy();
    await warrantyTracker.waitForDeployment();
  });

  describe("registerProduct", function () {
    it("should register a new product", async function () {
      const tx = await warrantyTracker.registerProduct("P001", "Laptop", 86400);
      await tx.wait();

      const product = await warrantyTracker.getProduct("P001");
      expect(product[0]).to.equal("P001");
      expect(product[1]).to.equal("Laptop");
      expect(product[2]).to.equal(owner.address);
      expect(product[4]).to.equal(86400n);
    });

    it("should emit ProductRegistered event", async function () {
      await expect(warrantyTracker.registerProduct("P002", "Phone", 172800))
        .to.emit(warrantyTracker, "ProductRegistered");
    });

    it("should reject duplicate product IDs", async function () {
      await warrantyTracker.registerProduct("P003", "Tablet", 86400);
      await expect(warrantyTracker.registerProduct("P003", "Tablet2", 86400))
        .to.be.revertedWith("Product already registered");
    });

    it("should reject empty product ID", async function () {
      await expect(warrantyTracker.registerProduct("", "Laptop", 86400))
        .to.be.revertedWith("Product ID cannot be empty");
    });

    it("should reject zero warranty period", async function () {
      await expect(warrantyTracker.registerProduct("P004", "Watch", 0))
        .to.be.revertedWith("Warranty period must be > 0");
    });

    it("should increment product count", async function () {
      expect(await warrantyTracker.productCount()).to.equal(0n);
      await warrantyTracker.registerProduct("P005", "TV", 86400);
      expect(await warrantyTracker.productCount()).to.equal(1n);
    });
  });

  describe("getProduct", function () {
    it("should revert for non-existent product", async function () {
      await expect(warrantyTracker.getProduct("NONEXIST"))
        .to.be.revertedWith("Product not found");
    });
  });

  describe("checkWarrantyStatus", function () {
    it("should return Active for a recently registered product", async function () {
      await warrantyTracker.registerProduct("P006", "Speaker", 86400);
      const status = await warrantyTracker.checkWarrantyStatus("P006");
      expect(status).to.equal("Active");
    });

    it("should revert for non-existent product", async function () {
      await expect(warrantyTracker.checkWarrantyStatus("NONEXIST"))
        .to.be.revertedWith("Product not found");
    });
  });
});
