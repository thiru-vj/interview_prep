#!/usr/bin/env node
/**
 * Prints the SHA-256 hex of an admin access key, for VITE_DSA_ADMIN_KEY_HASH.
 * Usage: npm run access:hash-key -- "your-secret-key"
 */
import { createHash } from 'node:crypto'

const key = process.argv[2]?.trim()
if (!key) {
  console.error('Usage: npm run access:hash-key -- "your-secret-key"')
  process.exit(1)
}

console.log(`VITE_DSA_ADMIN_KEY_HASH=${createHash('sha256').update(key).digest('hex')}`)
