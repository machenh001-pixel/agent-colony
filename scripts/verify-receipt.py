#!/usr/bin/env python3
# verify-receipt.py — independent Ed25519 receipt verifier for Agent Colony
# Usage: python3 verify-receipt.py <receipt.json>
import sys, json, hashlib
from cryptography.hazmat.primitives.serialization import load_der_public_key

with open(sys.argv[1]) if len(sys.argv)>1 else sys.stdin as f:
    r = json.load(f)

sig = bytes.fromhex(r['signature'])
pub = load_der_public_key(bytes.fromhex(r['issuer_pubkey']))
body = {k:v for k,v in r.items() if k != 'signature'}
data = json.dumps(body, separators=(',',':'), ensure_ascii=False).encode('utf-8')
try:
    pub.verify(sig, data); ok = True
except Exception as e:
    ok = False
    err = str(e)

print('=== Agent Colony receipt verification (python) ===')
print('task_id:', r['task_id'], '| title:', r['title'])
print('verification_status:', r.get('verification_status'))
print('CHECK signature valid:', 'PASS' if ok else 'FAIL: '+err)
if r.get('deliverable_sha256') and r.get('delivery'):
    h = hashlib.sha256(r['delivery'].encode()).hexdigest()
    print('CHECK deliverable_sha256 matches:', 'PASS' if h==r['deliverable_sha256'] else 'FAIL')
print('CHECK confirmed_at present:', 'PASS' if r.get('confirmed_at') else 'FAIL')
sys.exit(0 if ok else 1)
