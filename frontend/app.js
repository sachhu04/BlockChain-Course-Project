// ═══════════════════════════════════════════════════════════
//  Blockchain Warranty Tracker — Frontend Application
// ═══════════════════════════════════════════════════════════

// ─── Contract Details ───
// UPDATE THIS after deploying the contract!
const CONTRACT_ADDRESS = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";

const CONTRACT_ABI = [
  "function registerProduct(string memory _productId, string memory _productName, uint256 _warrantyPeriod) external",
  "function getProduct(string memory _productId) external view returns (string memory, string memory, address, uint256, uint256)",
  "function checkWarrantyStatus(string memory _productId) external view returns (string memory)",
  "function productCount() external view returns (uint256)",
  "event ProductRegistered(string indexed productId, string productName, address indexed owner, uint256 purchaseTimestamp, uint256 warrantyPeriod)"
];

// ─── State ───
let provider = null;
let signer   = null;
let contract = null;

// ─── DOM References ───
const btnConnect      = document.getElementById("btn-connect");
const walletStatus    = document.getElementById("wallet-status");
const networkBar      = document.getElementById("network-bar");
const networkName     = document.getElementById("network-name");

const formRegister    = document.getElementById("form-register");
const inputProductId  = document.getElementById("input-product-id");
const inputName       = document.getElementById("input-product-name");
const inputDays       = document.getElementById("input-warranty-days");
const btnRegister     = document.getElementById("btn-register");
const registerResult  = document.getElementById("register-result");

const formLookup      = document.getElementById("form-lookup");
const inputLookupId   = document.getElementById("input-lookup-id");
const btnLookup       = document.getElementById("btn-lookup");
const lookupResult    = document.getElementById("lookup-result");

const loadingOverlay  = document.getElementById("loading-overlay");
const loadingText     = document.getElementById("loading-text");

const statTotal       = document.getElementById("stat-total");
const statNetwork     = document.getElementById("stat-network");
const statBlock       = document.getElementById("stat-block");

// ═══════════════════════════════════════════════════════════
//  Utility Helpers
// ═══════════════════════════════════════════════════════════

function showLoading(msg = "Processing transaction...") {
  loadingText.textContent = msg;
  loadingOverlay.classList.remove("hidden");
}

function hideLoading() {
  loadingOverlay.classList.add("hidden");
}

function toast(message, type = "info") {
  const container = document.getElementById("toast-container");
  const el = document.createElement("div");
  el.className = `toast toast-${type}`;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

function formatDate(timestamp) {
  return new Date(Number(timestamp) * 1000).toLocaleString("en-IN", {
    dateStyle: "long",
    timeStyle: "short",
  });
}

function truncateAddr(addr) {
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

// ═══════════════════════════════════════════════════════════
//  Wallet Connection
// ═══════════════════════════════════════════════════════════

btnConnect.addEventListener("click", connectWallet);

async function connectWallet() {
  if (typeof window.ethereum === "undefined") {
    toast("MetaMask not detected! Please install it.", "error");
    return;
  }

  try {
    btnConnect.disabled = true;
    showLoading("Connecting to MetaMask...");

    provider = new ethers.BrowserProvider(window.ethereum);
    signer   = await provider.getSigner();
    const address = await signer.getAddress();

    // Setup contract
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    // Update UI
    walletStatus.textContent = `Connected: ${address}`;
    walletStatus.classList.remove("hidden");
    walletStatus.classList.add("connected");

    btnConnect.textContent = truncateAddr(address);
    btnConnect.disabled = false;

    // Network info
    const network = await provider.getNetwork();
    const chainName = getChainName(Number(network.chainId));
    networkName.textContent = `${chainName} (Chain ID: ${network.chainId})`;
    networkBar.classList.remove("hidden");

    toast(`Wallet connected: ${truncateAddr(address)}`, "success");

    // Refresh stats
    await refreshStats();
  } catch (err) {
    console.error(err);
    toast("Failed to connect wallet: " + err.message, "error");
    btnConnect.disabled = false;
  } finally {
    hideLoading();
  }
}

function getChainName(chainId) {
  const names = {
    1: "Ethereum Mainnet",
    5: "Goerli Testnet",
    11155111: "Sepolia Testnet",
    31337: "GO Testnet Local",
    137: "Polygon Mainnet",
    80001: "Mumbai Testnet",
  };
  return names[chainId] || `Chain ${chainId}`;
}

// Listen for account / chain changes
if (window.ethereum) {
  window.ethereum.on("accountsChanged", () => location.reload());
  window.ethereum.on("chainChanged",   () => location.reload());
}

// ═══════════════════════════════════════════════════════════
//  Register Product
// ═══════════════════════════════════════════════════════════

formRegister.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!contract) {
    toast("Connect your wallet first!", "error");
    return;
  }

  const productId = inputProductId.value.trim();
  const name      = inputName.value.trim();
  const days      = parseInt(inputDays.value, 10);

  if (!productId || !name || !days || days <= 0) {
    toast("Please fill in all fields correctly.", "error");
    return;
  }

  // Convert days -> seconds
  const warrantySeconds = days * 24 * 60 * 60;

  try {
    btnRegister.disabled = true;
    showLoading("Sending transaction to blockchain...");

    const tx = await contract.registerProduct(productId, name, warrantySeconds);

    showLoading("Waiting for confirmation...");
    const receipt = await tx.wait();

    hideLoading();

    // Show success result
    registerResult.className = "result success";
    registerResult.classList.remove("hidden");
    registerResult.innerHTML = `
      <strong>Product Registered Successfully</strong>
      <span class="label">Product ID</span>
      <span class="value">${productId}</span>
      <span class="label">Product Name</span>
      <span class="value">${name}</span>
      <span class="label">Warranty</span>
      <span class="value">${days} days (${warrantySeconds.toLocaleString()} seconds)</span>
      <span class="label">Transaction Hash</span>
      <span class="tx-hash">${receipt.hash}</span>
      <span class="label">Block Number</span>
      <span class="value">${receipt.blockNumber}</span>
    `;

    toast("Product registered on blockchain!", "success");
    formRegister.reset();
    await refreshStats();
  } catch (err) {
    hideLoading();
    console.error(err);

    let errorMsg = err.reason || err.message || "Transaction failed";
    // Parse revert reason
    if (errorMsg.includes("Product already registered")) {
      errorMsg = "This Product ID is already registered on the blockchain.";
    }

    registerResult.className = "result error";
    registerResult.classList.remove("hidden");
    registerResult.innerHTML = `<strong>Error:</strong> ${errorMsg}`;

    toast("Registration failed!", "error");
  } finally {
    btnRegister.disabled = false;
  }
});

// ═══════════════════════════════════════════════════════════
//  Lookup Product
// ═══════════════════════════════════════════════════════════

formLookup.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!contract) {
    toast("Connect your wallet first!", "error");
    return;
  }

  const productId = inputLookupId.value.trim();
  if (!productId) {
    toast("Enter a Product ID to search.", "error");
    return;
  }

  try {
    btnLookup.disabled = true;
    showLoading("Fetching product from blockchain...");

    // Fetch product details + warranty status in parallel
    const [productData, status] = await Promise.all([
      contract.getProduct(productId),
      contract.checkWarrantyStatus(productId),
    ]);

    hideLoading();

    const [id, name, owner, purchaseTs, warrantyPeriod] = productData;
    const purchaseDate = formatDate(purchaseTs);
    const expiryTs     = BigInt(purchaseTs) + BigInt(warrantyPeriod);
    const expiryDate   = formatDate(expiryTs);
    const isActive     = status === "Active";

    const statusClass = isActive ? "status-active" : "status-expired";
    const statusLabel = isActive ? "Active" : "Expired";

    lookupResult.className = "result info";
    lookupResult.classList.remove("hidden");
    lookupResult.innerHTML = `
      <strong>Product Details</strong>

      <span class="label">Product ID</span>
      <span class="value">${id}</span>

      <span class="label">Product Name</span>
      <span class="value">${name}</span>

      <span class="label">Owner</span>
      <span class="value">${owner}</span>

      <span class="label">Purchase Date</span>
      <span class="value">${purchaseDate}</span>

      <span class="label">Warranty Expiry</span>
      <span class="value">${expiryDate}</span>

      <span class="label">Warranty Status</span>
      <span class="status-badge ${statusClass}">${statusLabel}</span>
    `;

    toast("Product details fetched!", "success");
  } catch (err) {
    hideLoading();
    console.error(err);

    let errorMsg = err.reason || err.message || "Lookup failed";
    if (errorMsg.includes("Product not found")) {
      errorMsg = "No product found with this ID.";
    }

    lookupResult.className = "result error";
    lookupResult.classList.remove("hidden");
    lookupResult.innerHTML = `<strong>Error:</strong> ${errorMsg}`;

    toast("Product lookup failed!", "error");
  } finally {
    btnLookup.disabled = false;
  }
});

// ═══════════════════════════════════════════════════════════
//  Live Stats
// ═══════════════════════════════════════════════════════════

async function refreshStats() {
  if (!contract || !provider) return;

  try {
    const [count, network, block] = await Promise.all([
      contract.productCount(),
      provider.getNetwork(),
      provider.getBlockNumber(),
    ]);

    statTotal.textContent   = count.toString();
    statNetwork.textContent = getChainName(Number(network.chainId));
    statBlock.textContent   = block.toString();
  } catch (err) {
    console.error("Stats refresh error:", err);
  }
}
