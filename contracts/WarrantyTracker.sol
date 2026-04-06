// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title WarrantyTracker
 * @notice A blockchain-based product warranty registration and tracking system.
 * @dev Stores product warranty info on-chain. Warranty status is computed
 *      dynamically from the purchase timestamp and warranty period.
 */
contract WarrantyTracker {

    // ──────────────────────────────────────────────
    //  Data Structures
    // ──────────────────────────────────────────────

    struct Product {
        string  productId;
        string  productName;
        address owner;
        uint256 purchaseTimestamp;
        uint256 warrantyPeriod;     // seconds
        bool    exists;
    }

    // ──────────────────────────────────────────────
    //  State
    // ──────────────────────────────────────────────

    /// @notice productId hash → Product
    mapping(bytes32 => Product) private products;

    /// @notice Counter for total registered products
    uint256 public productCount;

    // ──────────────────────────────────────────────
    //  Events
    // ──────────────────────────────────────────────

    event ProductRegistered(
        string  indexed productId,
        string  productName,
        address indexed owner,
        uint256 purchaseTimestamp,
        uint256 warrantyPeriod
    );

    // ──────────────────────────────────────────────
    //  Modifiers
    // ──────────────────────────────────────────────

    modifier productMustNotExist(string memory _productId) {
        bytes32 key = keccak256(abi.encodePacked(_productId));
        require(!products[key].exists, "Product already registered");
        _;
    }

    modifier productMustExist(string memory _productId) {
        bytes32 key = keccak256(abi.encodePacked(_productId));
        require(products[key].exists, "Product not found");
        _;
    }

    // ──────────────────────────────────────────────
    //  Core Functions
    // ──────────────────────────────────────────────

    /**
     * @notice Register a new product warranty.
     * @param _productId     Unique product identifier (e.g. serial number).
     * @param _productName   Human-readable product name.
     * @param _warrantyPeriod Warranty duration in **seconds**.
     */
    function registerProduct(
        string memory _productId,
        string memory _productName,
        uint256 _warrantyPeriod
    ) external productMustNotExist(_productId) {
        require(bytes(_productId).length > 0,    "Product ID cannot be empty");
        require(bytes(_productName).length > 0,  "Product name cannot be empty");
        require(_warrantyPeriod > 0,             "Warranty period must be > 0");

        bytes32 key = keccak256(abi.encodePacked(_productId));

        products[key] = Product({
            productId:         _productId,
            productName:       _productName,
            owner:             msg.sender,
            purchaseTimestamp:  block.timestamp,
            warrantyPeriod:    _warrantyPeriod,
            exists:            true
        });

        productCount++;

        emit ProductRegistered(
            _productId,
            _productName,
            msg.sender,
            block.timestamp,
            _warrantyPeriod
        );
    }

    /**
     * @notice Retrieve full product details.
     * @param _productId The product to look up.
     * @return productId_       Product identifier
     * @return productName_     Product name
     * @return owner_           Wallet that registered the product
     * @return purchaseTimestamp_ Unix timestamp of registration
     * @return warrantyPeriod_  Warranty duration in seconds
     */
    function getProduct(string memory _productId)
        external
        view
        productMustExist(_productId)
        returns (
            string  memory productId_,
            string  memory productName_,
            address        owner_,
            uint256        purchaseTimestamp_,
            uint256        warrantyPeriod_
        )
    {
        bytes32 key = keccak256(abi.encodePacked(_productId));
        Product storage p = products[key];

        return (
            p.productId,
            p.productName,
            p.owner,
            p.purchaseTimestamp,
            p.warrantyPeriod
        );
    }

    /**
     * @notice Check whether the warranty is still active.
     * @param _productId The product to check.
     * @return status "Active" or "Expired"
     */
    function checkWarrantyStatus(string memory _productId)
        external
        view
        productMustExist(_productId)
        returns (string memory status)
    {
        bytes32 key = keccak256(abi.encodePacked(_productId));
        Product storage p = products[key];

        if (block.timestamp <= p.purchaseTimestamp + p.warrantyPeriod) {
            return "Active";
        } else {
            return "Expired";
        }
    }
}
