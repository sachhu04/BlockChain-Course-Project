# ⛓️ Blockchain-Based Warranty Tracker (BCTA)

A decentralized product warranty registration and verification system built on Ethereum using Solidity, Hardhat, and Ethers.js.

---

## 📁 Project Structure

```
BCTA PROJECT/
├── contracts/
│   └── WarrantyTracker.sol      # Smart contract
├── scripts/
│   └── deploy.js                # Deployment script
├── test/
│   └── WarrantyTracker.test.js  # Automated tests
├── frontend/
│   ├── index.html               # Main UI
│   ├── styles.css               # Styling
│   └── app.js                   # Blockchain interaction logic
├── hardhat.config.js            # Hardhat configuration
├── package.json                 # Dependencies & scripts
└── README.md                    # This file
```

---

## 🚀 Quick Start (Local Setup)

### Prerequisites

- **Node.js** v18+ (LTS recommended)
- **MetaMask** browser extension
- **Git** (optional)

### Step 1 — Install Dependencies

```bash
cd "BCTA PROJECT"
npm install
```

### Step 2 — Compile the Smart Contract

```bash
npm run compile
```

### Step 3 — Start Local Blockchain

Open a **new terminal** and run:

```bash
npm run node
```

> This starts a local Hardhat blockchain at `http://127.0.0.1:8545` with 20 test accounts, each having 10,000 ETH.

### Step 4 — Deploy the Contract

In another terminal:

```bash
npm run deploy
```

You'll see output like:

```
✅ WarrantyTracker deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

> **Important:** If you redeploy, update the `CONTRACT_ADDRESS` in `frontend/app.js` with the new address.

### Step 5 — Serve the Frontend

```bash
npm run frontend
```

This opens `http://127.0.0.1:3000` in your browser.

### Step 6 — Configure MetaMask

1. Open MetaMask → **Settings → Networks → Add Network**
2. Add the Hardhat local network:

| Field            | Value                       |
| ---------------- | --------------------------- |
| Network Name     | Hardhat Local               |
| RPC URL          | http://127.0.0.1:8545       |
| Chain ID         | 31337                       |
| Currency Symbol  | ETH                         |

3. **Import a test account:** Copy any private key from the Hardhat node terminal output and import it into MetaMask.

### Step 7 — Use the App!

1. Click **"Connect Wallet"** to connect MetaMask.
2. Fill in the **Register Product** form and submit.
3. Approve the transaction in MetaMask.
4. Use **Lookup Product** to verify the warranty details.

---

## 🧪 Running Tests

```bash
npm test
```

All 9 tests should pass:

```
  WarrantyTracker
    registerProduct
      ✔ should register a new product
      ✔ should emit ProductRegistered event
      ✔ should reject duplicate product IDs
      ✔ should reject empty product ID
      ✔ should reject zero warranty period
      ✔ should increment product count
    getProduct
      ✔ should revert for non-existent product
    checkWarrantyStatus
      ✔ should return Active for a recently registered product
      ✔ should revert for non-existent product

  9 passing
```

---

## 📝 Smart Contract Overview

### `WarrantyTracker.sol`

| Function | Description |
|---|---|
| `registerProduct(productId, productName, warrantyPeriod)` | Registers a new product. `warrantyPeriod` is in seconds. Emits `ProductRegistered` event. |
| `getProduct(productId)` | Returns product details: ID, name, owner, purchase timestamp, warranty period. |
| `checkWarrantyStatus(productId)` | Returns `"Active"` or `"Expired"` based on current block timestamp. |
| `productCount()` | Returns the total number of registered products. |

### Events

- `ProductRegistered(productId, productName, owner, purchaseTimestamp, warrantyPeriod)` — emitted on every successful registration.

### Validations

- Duplicate product IDs are rejected.
- Empty product ID / name is rejected.
- Zero warranty period is rejected.

---

## 🌐 Deploying to Sepolia Testnet (Optional)

1. Get Sepolia ETH from a faucet: https://sepoliafaucet.com/
2. Get an Infura API key: https://infura.io/
3. Update `hardhat.config.js`:

```js
sepolia: {
  url: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
  accounts: ["YOUR_PRIVATE_KEY"],
}
```

4. Deploy:

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **Solidity 0.8.24** | Smart contract language |
| **Hardhat** | Development framework, local blockchain, testing |
| **Ethers.js v6** | Frontend↔blockchain interaction |
| **MetaMask** | Wallet connection |
| **HTML/CSS/JS** | Single-page frontend |

---

## 👨‍🎓 For College Lab Demonstration

1. Start the Hardhat node (`npm run node`)
2. Deploy the contract (`npm run deploy`)
3. Serve the frontend (`npm run frontend`)
4. Connect MetaMask with a test account
5. Register 2–3 products and look them up
6. Show the test results (`npm test`)
7. Walk through the Solidity code explaining the data structures and functions

---

## 📄 License

MIT — Free for academic use.
