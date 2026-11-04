#!/usr/bin/env bash
# client/scripts/download-nsfwjs-model.sh
#
# Self-host nsfwjs MobileNetV2 model files under client/public/nsfwjs/
#
# IMPORTANT: nsfwjs v4+ bundles model weights as inline JS modules at build time,
# so this script is only needed if you downgrade to nsfwjs v2/v3 and use the URL-based
# nsfwjs.load('URL') API (e.g., nsfwjs.load('/nsfwjs/')).
#
# nsfwjs v4 (current) uses dynamic imports — no external model URL is needed.
# The TensorFlow.js model is tree-shaken and inlined into the Vite bundle.
#
# Usage (only if you are using nsfwjs v2/v3 URL-based loading):
#   bash client/scripts/download-nsfwjs-model.sh

set -euo pipefail

DEST="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/public/nsfwjs"
MODEL_BASE="https://nsfwjs.com/model/mobilenet_v2"

echo "Creating $DEST ..."
mkdir -p "$DEST"

echo "Downloading model.json ..."
curl -fsSL "$MODEL_BASE/model.json" -o "$DEST/model.json"

echo "Parsing weight shard filenames from model.json ..."
# Extract all weight shard filenames (group1-shardNofM.bin)
SHARDS=$(python3 -c "
import json, sys
with open('$DEST/model.json') as f:
    data = json.load(f)
for wd in data.get('weightsManifest', []):
    for p in wd.get('paths', []):
        print(p)
")

for shard in $SHARDS; do
  echo "Downloading $shard ..."
  curl -fsSL "$MODEL_BASE/$shard" -o "$DEST/$shard"
done

echo ""
echo "Done! nsfwjs model files are in $DEST"
echo ""
echo "To use them, call:"
echo "  const model = await nsfwjs.load('/nsfwjs/')"
echo ""
echo "NOTE: With nsfwjs v4+, this script is not required — the model is bundled at build time."
