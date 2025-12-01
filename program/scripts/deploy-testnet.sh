#!/bin/bash

set -e

echo "🚀 Deploying to Solana devnet..."

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Checking configuration...${NC}"
solana config get

echo -e "${BLUE}Checking wallet balance...${NC}"
BALANCE=$(solana balance | awk '{print $1}')
echo "Balance: $BALANCE SOL"

if (( $(echo "$BALANCE < 2" | bc -l) )); then
    echo "Low balance, requesting airdrop..."
    solana airdrop 2
fi


echo -e "${BLUE}Building program...${NC}"
anchor clean
anchor build

PROGRAM_ID=$(solana address -k target/deploy/anchor_project-keypair.json)
echo -e "${GREEN}Program ID: $PROGRAM_ID${NC}"

echo -e "${BLUE}Deploying program...${NC}"
anchor deploy --provider.cluster devnet

echo -e "${BLUE}Verifying deployment...${NC}"
solana program show $PROGRAM_ID --url devnet

echo -e "${BLUE}Copying IDL to frontend...${NC}"
mkdir -p app/src/idl
cp target/idl/anchor_project.json app/src/idl/

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}Program ID: $PROGRAM_ID${NC}"
echo -e "${BLUE}Don't forget to update PROGRAM_ID in:${NC}"
echo "  - programs/anchor_project/src/lib.rs"
echo "  - app/src/utils/solana.ts"
echo "  - Anchor.toml"