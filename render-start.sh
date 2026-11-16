#!/bin/sh
set -eu

# Render generateValue creates a base64 secret, while FreeLLMAPI expects
# 64-character hexadecimal keys. Derive two stable, independent AES keys
# from Render's persistent random secret without exposing it in logs.
: "${FREEAPI_RENDER_MASTER_SECRET:?FREEAPI_RENDER_MASTER_SECRET is required}"

export ENCRYPTION_KEY="$(node -e 'const c=require("node:crypto"); process.stdout.write(c.createHmac("sha256", process.env.FREEAPI_RENDER_MASTER_SECRET).update("FreeLLMAPI encryption key v1").digest("hex"))')"
export FREEAPI_DB_BACKUP_KEY="$(node -e 'const c=require("node:crypto"); process.stdout.write(c.createHmac("sha256", process.env.FREEAPI_RENDER_MASTER_SECRET).update("FreeLLMAPI backup key v1").digest("hex"))')"

exec node server/dist/index.js
