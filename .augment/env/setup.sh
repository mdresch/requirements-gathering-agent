#!/bin/bash

cd /mnt/persist/workspace

echo "🔍 Trying different approaches to run the CLI..."
echo ""
echo "📋 Trying with npx:"
npx node dist/cli.js status 2>&1 | head -10
echo ""
echo "📋 Checking if we can run the setup command:"
echo "y" | timeout 10 node dist/cli.js setup 2>&1 | head -20
echo ""
echo "📋 Let me check the AI provider configuration directly from the source code..."