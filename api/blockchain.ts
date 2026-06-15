import { spawn, ChildProcess } from "child_process";
import { ethers } from "ethers";
import kill from "tree-kill";
import fs from "fs";
import { execSync } from "child_process";
import express from "express";
import path from "path";


const contractsPath = path.join(process.cwd(), 'hardhat/contracts');
const router = express.Router();

// ─── Stato Hardhat ────────────────────────────────────────────────────────────
let hardhatProcess: ChildProcess | null = null;
let hardhatLogs: string[] = [];
const HARDHAT_RPC = "http://127.0.0.1:8545";

// ─── Helper: provider connesso al nodo locale ─────────────────────────────────
function getProvider() {
  return new ethers.JsonRpcProvider(HARDHAT_RPC);
}

// ─── POST /start ───────────────────────────────────────────────────
router.post("/start", (req, res) => {
  if (hardhatProcess) {
    return res.status(409).json({
      error: "Hardhat node already running",
      pid: hardhatProcess.pid,
    });
  }

  hardhatLogs = [];

  hardhatProcess = spawn("npx", ["hardhat", "node"], {
    cwd: path.join(process.cwd(), "hardhat"),
    shell: true,
    detached: false,
  });

  hardhatProcess.stdout?.on("data", (data: Buffer) => {
    const line = data.toString().trim();

    hardhatLogs.push(line);

    console.log(`[hardhat] ${line}`);
  });

  hardhatProcess.stderr?.on("data", (data: Buffer) => {
    const line = data.toString().trim();

    hardhatLogs.push(`[ERR] ${line}`);

    console.error(`[hardhat] ${line}`);
  });

  hardhatProcess.on("exit", (code) => {
    console.log(`Hardhat exited with code ${code}`);
    hardhatProcess = null;
  });

  setTimeout(() => {
    res.json({
      success: true,
      message: "Hardhat node starting",
      pid: hardhatProcess?.pid ?? null,
      rpc: HARDHAT_RPC,
    });
  }, 1000);
});

router.post("/stop", (req, res) => {
  if (!hardhatProcess) {
    return res.status(404).json({
      error: "Hardhat node is not running",
    });
  }

  const pid = hardhatProcess.pid;

  if (pid === undefined) {
    return res.status(500).json({
      error: "Unable to determine Hardhat process PID",
    });
  }

  kill(pid, "SIGTERM", (err) => {
    if (err) {
      console.error(err);
    }
  });

  setTimeout(() => {
    kill(pid, "SIGKILL", () => {});
  }, 3000);

  hardhatProcess = null;

  return res.json({
    success: true,
    message: "Hardhat node stopping",
  });
});

// ─── GET /status ───────────────────────────────────────────────────
router.get("/status", async (req, res) => {
  if (!hardhatProcess) {
    return res.json({ running: false });
  }

  try {
    const provider = getProvider();

    const [blockNumber, network, accounts] = await Promise.all([
      provider.getBlockNumber(),
      provider.getNetwork(),
      provider.listAccounts(),
    ]);

    // Bilanci del primo account (faucet Hardhat)
    const balances = await Promise.all(
      accounts.slice(0, 5).map(async (addr) => ({
        address: addr.address,
        balance:
          ethers.formatEther(await provider.getBalance(addr.address)) + " ETH",
      })),
    );

    res.json({
      running: true,
      pid: hardhatProcess.pid,
      rpc: HARDHAT_RPC,
      chainId: network.chainId.toString(),
      blockNumber,
      accounts: balances,
      recentLogs: hardhatLogs.slice(-20), // last 20 logs
    });
  } catch (err) {
    res.json({
      running: true,
      pid: hardhatProcess.pid,
      rpc: HARDHAT_RPC,
      error: "Node started but not yet reachable – wait a moment and retry",
    });
  }
});

// ─── POST /deploy ──────────────────────────────────────────────────
router.post("/deploy", async (req, res) => {
  if (!hardhatProcess) {
    return res.status(503).json({
      error: "Hardhat node is not running",
    });
  }

  const { contractPath, constructorArgs = [] } = req.body;

  if (!contractPath) {
    return res.status(400).json({
      error: "Missing source path",
    });
  }

  try {
    // path assoluto file .sol
    const contractPath2 = path.resolve(contractPath);

    // verifica file esiste
    if (!fs.existsSync(contractPath2)) {
      return res.status(404).json({
        error: "Solidity file not found",
      });
    }

    // nome file
    const fileName = path.basename(contractPath2);

    // nome contratto
    const sourceCode = fs.readFileSync(contractPath2, "utf8");

    const match = sourceCode.match(/contract\s+([A-Za-z0-9_]+)/);

    if (!match) {
      throw new Error("Unable to detect contract name");
    }

    const contractName = match[1];

    // compile hardhat
    const hardhatDir = path.join(process.cwd(), "hardhat");

    execSync("npx hardhat compile", {
      cwd: hardhatDir,
      stdio: "pipe",
    });

    // artifact path
    const artifactPath = path.join(
      hardhatDir,
      "artifacts",
      "contracts",
      fileName,
      `${contractName}.json`,
    );

    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    const abi = artifact.abi;
    const bytecode = artifact.bytecode;

    // provider
    const provider = getProvider();

    // signer
    const accounts = await provider.listAccounts();

    const signer = await provider.getSigner(accounts[0].address);

    // deploy
    const factory = new ethers.ContractFactory(abi, bytecode, signer);

    const contract = await factory.deploy(...constructorArgs);

    await contract.waitForDeployment();

    const address = await contract.getAddress();

    res.json({
      success: true,
      contractName,
      contractAddress: address,
      abi,
      bytecode,
    });
  } catch (err: any) {
    console.error(err);

    res.status(500).json({
      error: err.message ?? "Deploy failed",
    });
  }
});


// API Contract Listing
router.use('/contracts', express.static(contractsPath));


router.get('/contracts-list', (req, res) => {

 

  fs.readdir(contractsPath, (err, files) => {

    if (err) {
      console.error(err);
      return res.status(500).json({
        error: err.message
      });
    }


    const contracts = files.filter(file =>
      file.endsWith('.sol')
    );

    res.json(contracts);

  });

});

export default router;
