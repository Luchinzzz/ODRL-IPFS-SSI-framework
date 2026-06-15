import express from "express";

import { createHelia } from "helia";
import { json } from "@helia/json";
import { canonicalize } from "json-canonicalize";
import { CID } from "multiformats/cid";
import { jsonLdToTurtle } from "../utils.js";

const router = express.Router();
const helia = await createHelia();
const j = json(helia);

router.post("/upload", async (req, res) => {
  const policy = req.body.policy;

  const turtle = await jsonLdToTurtle(policy);

  // VALIDAZIONE
  const validationResponse = await fetch(
    "https://odrlapi.appspot.com/validator",
    {
      method: "POST",
      headers: {
        "Content-Type": "text/turtle",
      },
      body: turtle,
    },
  );

  const validationText = await validationResponse.text();

  const validation = JSON.parse(
    validationText.replace(/\n/g, "").replace(/\\n/g, ""),
  );

  // CONTROLLO VALIDAZIONE
  if (validation.status !== 200) {
    return res.status(400).json({
      error: "ODRL policy validation failed",
      details: validation.text,
    });
  }

  // CANONICALIZZAZIONE
  const normalized = canonicalize(policy);

  // UPLOAD IPFS
  const cid = await j.add(normalized);

  return res.json({
    success: true,
    validation: validation.text,
    cid: cid.toString(),
    gatewayUrl: `http://localhost:3000/ipfs/${cid}`,
  });
});


router.get("/:cid", async (req, res) => {
  const cid = CID.parse(req.params.cid);

  const data = (await j.get(cid)) as string;
  const original = JSON.parse(data);
  res.json(original);
});


export default router;
