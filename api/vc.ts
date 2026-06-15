import { Router, Request, Response } from 'express';
import { createHash } from 'crypto';
import { canonicalize } from "json-canonicalize";
import { TermsOfUseV2 } from '../vc/termsOfUse_v2.js';

const router = Router();

interface JsonHashRequest {
    data: unknown;
}

interface BytecodeHashRequest {
    bytecode: string;
}


interface TermsOfUseRequest {
    type: string;
    id?: string;
    hashIPFS?: string;
    hashSP?: string;
    addressSP?: string;
}

/**
 * POST /vc/terms-of-use
 * Creates a TermsOfUseV2 object from the provided fields.
 * Only "type" is required; all other fields are optional.
 */
router.post('/terms-of-use', (req: Request, res: Response) => {
    try {
        const { type, id, hashIPFS, hashSP, addressSP } = req.body as TermsOfUseRequest;

        if (!type || typeof type !== 'string') {
            return res.status(400).json({ error: 'Missing or invalid "type" field' });
        }

        const termsOfUse = new TermsOfUseV2(type, id, hashIPFS, hashSP, addressSP);

        return res.json(termsOfUse);
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
});


/**
 * POST /vc/hash/json
 * Computes the SHA-256 hash of a JSON object.
 * The JSON is serialized deterministically (keys sorted)
 * to ensure the same object always produces the same hash.
 */
router.post('/hash/json', (req: Request, res: Response) => {
    try {
        const { data } = req.body as JsonHashRequest;

        if (data === undefined) {
            return res.status(400).json({ error: 'Missing "data" field' });
        }

        const canonicalJson = canonicalize(data);
        const hash = createHash('sha256').update(canonicalJson, 'utf8').digest('hex');

        return res.json({ hash: `${hash}`, canonicalJson });
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
});

/**
 * POST /vc/hash/bytecode
 * Computes the SHA-256 hash of a bytecode (hex string, with or without 0x prefix).
 */
router.post('/hash/bytecode', (req: Request, res: Response) => {
    try {
        const { bytecode } = req.body as BytecodeHashRequest;
        if (!bytecode || typeof bytecode !== 'string') {
            return res.status(400).json({ error: 'Missing or invalid "bytecode" field' });
        }
        
        const normalized = bytecode.startsWith('0x') ? bytecode.slice(2) : bytecode;
        if (!/^[0-9a-fA-F]*$/.test(normalized) || normalized.length % 2 !== 0) {
            return res.status(400).json({ error: 'Bytecode is not a valid hex string' });
        }
        
        const hash = createHash('sha256').update(bytecode).digest('hex');
        return res.json({ hash });
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
});


export default router;
