// src/server.ts
import express from "express";

// import { initIPFS, uploadJSON } from "ipfs";
//import { hashJSON } from "./utils.js";
import path from "path";
import open from "open";


import blockchainRoutes from "./api/blockchain";
import policyRoutes from "./api/policy.js";
import ipfsRoutes from "./api/ipfs.js";
import vcRoutes from "./api/vc.js";

const app = express();
app.use(express.json());
app.set("json spaces", 2);

//web page
app.use(
  express.static(
    path.join(process.cwd(), "public")
  )
);

app.use("/blockchain", blockchainRoutes);

app.use("/policy", policyRoutes);

app.use("/ipfs", ipfsRoutes);

app.use("/vc", vcRoutes);


// ─── Avvio server ─────────────────────────────────────────────────────────────
async function start() {
  // await initIPFS();
  app.listen(3000, async () => {
    const url = "http://localhost:3000";
    console.log(`Server running on ${url}`);

    await open(url);
  });
}

start();
