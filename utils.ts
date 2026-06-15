// src/utils.ts
import { keccak256, toUtf8Bytes } from "ethers";
import fs from "fs";
import { ethers } from "ethers";
import jsonld from "jsonld";
import { Parser, Writer } from "n3";




export async function jsonLdToTurtle(doc: object): Promise<string> {

  // JSON-LD -> N-Quads
  const nquads = await jsonld.toRDF(doc, {
    format: "application/n-quads"
  }) as string;

  // Parse N-Quads
  const parser = new Parser({
    format: "N-Quads"
  });

  const quads = parser.parse(nquads);

  // Write Turtle
  const writer = new Writer({
    prefixes: {
      odrl: "http://www.w3.org/ns/odrl/2/"
    }
  });

  writer.addQuads(quads);

  return new Promise((resolve, reject) => {
    writer.end((err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};


