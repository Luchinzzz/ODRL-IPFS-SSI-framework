import express from "express";
import fs from "fs";

import {
  generateSolidityContract,
} from "../translator/ODRLtoSol.js";
import { ODRLPolicy } from "../translator/ODRLPolicy.js";

const router = express.Router();




router.post("/translate", async (req, res) => {
  try {
    const policyJSON: ODRLPolicy = req.body.policy;
    const fileName = req.body.fileName;

    if (!policyJSON) {
      return res.status(400).json({
        error: "Missing JSON policy",
      });
    }

    const safeFileName =
      (fileName || "ODRLPolicy")
        .replace(/[^a-zA-Z0-9]/g, "") + Date.now() as string;


    const solidityCode = generateSolidityContract(
      policyJSON,
      safeFileName
    );

    fs.writeFileSync(
      `hardhat/contracts/${safeFileName}.sol`,
      solidityCode
    );

    res.json({
      solidityCode,
      fileName: `${safeFileName}.sol`,
    });
  } catch (err) {
    console.error(err);

    const message =
      err instanceof Error ? err.message : typeof err === "string" ? err : "Internal Error";

    res.status(500).json({
      error: message,
    });
  }
});

export default router;
