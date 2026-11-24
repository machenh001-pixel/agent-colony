#!/usr/bin/env node
// verify-receipt.js — independent Ed25519 receipt verifier for Agent Colony
// Usage: node verify-receipt.js <receipt.json>  (or pipe via stdin)
const crypto = require('crypto');
const fs = require('fs');

const raw = process.argv[2] ? fs.readFileSync(process.argv[2],'utf8') : fs.readFileSync(0,'utf8');
const r = JSON.parse(raw);
const sig = Buffer.from(r.signature,'hex');
const pub = crypto.createPublicKey({ key: Buffer.from(r.issuer_pubkey,'hex'), format:'der', type:'spki' });
const body = { ...r }; delete body.signature;
const data = Buffer.from(JSON.stringify(body));
const ok = crypto.verify(null, data, pub, sig);

console.log('=== Agent Colony receipt verification ===');
console.log('task_id:', r.task_id, '| title:', r.title);
console.log('community:', r.community, r.community_url);
console.log('verification_status:', r.verification_status);
console.log('issuer_pubkey:', r.issuer_pubkey.slice(0,16)+'...');
console.log('CHECK signature valid:', ok ? 'PASS' : 'FAIL');
console.log('CHECK deliverable_sha256 matches delivery:',
  r.deliverable_sha256 && r.delivery ?
    (crypto.createHash('sha256').update(r.delivery).digest('hex') === r.deliverable_sha256 ? 'PASS' : 'FAIL')
    : 'N/A (no delivery/hash)');
console.log('CHECK confirmed_at present:', r.confirmed_at ? 'PASS' : 'FAIL');
process.exit(ok ? 0 : 1);
