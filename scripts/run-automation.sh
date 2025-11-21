#!/bin/bash

# Comprehensive E2E Automation Test Runner
# This script makes it easy to run different automation test suites

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create test-results directory if it doesn't exist
mkdir -p test-results/automation

echo -e "${BLUE}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Netanya Local - E2E Automation Test Runner         ║${NC}"
echo -e "${BLUE}╔══════════════════════════════════════════════════════╗${NC}"
echo ""

# Check if dev server is running
if ! lsof -ti:4700 > /dev/null 2>&1; then
  echo -e "${YELLOW}⚠️  Dev server not running on port 4700${NC}"
  echo -e "${YELLOW}   Starting dev server...${NC}"
  echo ""

  # Start dev server in background
  npm run dev > /dev/null 2>&1 &
  DEV_PID=$!

  echo -e "${GREEN}✓ Dev server started (PID: $DEV_PID)${NC}"
  echo -e "${YELLOW}   Waiting 10 seconds for server to be ready...${NC}"
  sleep 10
else
  echo -e "${GREEN}✓ Dev server is already running${NC}"
fi

echo ""
echo -e "${BLUE}Choose a test suite to run:${NC}"
echo ""
echo "1. 🔄 All Combinations (Category × Neighborhood)"
echo "2. 📝 Add Business Form Tests"
echo "3. 🚀 Complete User Journey"
echo "4. 🌐 Language Switching (Hebrew/Russian)"
echo "5. 🎯 Run ALL Tests"
echo "6. 👁️  Run with Visual Browser (Headed Mode)"
echo "7. 🐛 Run with Debug Mode"
echo "8. 📱 Run on Mobile (Chrome)"
echo "9. 🦊 Run on Firefox"
echo "10. 🧪 Run on All Browsers"
echo ""
echo -e "${YELLOW}0. Exit${NC}"
echo ""
read -p "Enter your choice (0-10): " choice

case $choice in
  1)
    echo -e "${GREEN}🔄 Running All Combinations Test...${NC}"
    npx playwright test tests/e2e/specs/comprehensive-automation.spec.ts:14 --project=chromium
    ;;
  2)
    echo -e "${GREEN}📝 Running Add Business Form Tests...${NC}"
    npx playwright test tests/e2e/specs/comprehensive-automation.spec.ts:239 --project=chromium
    ;;
  3)
    echo -e "${GREEN}🚀 Running Complete User Journey...${NC}"
    npx playwright test tests/e2e/specs/comprehensive-automation.spec.ts:343 --project=chromium
    ;;
  4)
    echo -e "${GREEN}🌐 Running Language Switching Tests...${NC}"
    npx playwright test tests/e2e/specs/comprehensive-automation.spec.ts:434 --project=chromium
    ;;
  5)
    echo -e "${GREEN}🎯 Running ALL Tests...${NC}"
    npx playwright test tests/e2e/specs/comprehensive-automation.spec.ts --project=chromium
    ;;
  6)
    echo -e "${GREEN}👁️  Running with Visual Browser (Headed Mode)...${NC}"
    npx playwright test tests/e2e/specs/comprehensive-automation.spec.ts --project=chromium --headed
    ;;
  7)
    echo -e "${GREEN}🐛 Running with Debug Mode...${NC}"
    npx playwright test tests/e2e/specs/comprehensive-automation.spec.ts --project=chromium --debug
    ;;
  8)
    echo -e "${GREEN}📱 Running on Mobile Chrome...${NC}"
    npx playwright test tests/e2e/specs/comprehensive-automation.spec.ts --project="Mobile Chrome"
    ;;
  9)
    echo -e "${GREEN}🦊 Running on Firefox...${NC}"
    npx playwright test tests/e2e/specs/comprehensive-automation.spec.ts --project=firefox
    ;;
  10)
    echo -e "${GREEN}🧪 Running on All Browsers...${NC}"
    echo ""
    echo -e "${BLUE}Running on Chromium...${NC}"
    npx playwright test tests/e2e/specs/comprehensive-automation.spec.ts --project=chromium
    echo ""
    echo -e "${BLUE}Running on Firefox...${NC}"
    npx playwright test tests/e2e/specs/comprehensive-automation.spec.ts --project=firefox
    echo ""
    echo -e "${BLUE}Running on WebKit...${NC}"
    npx playwright test tests/e2e/specs/comprehensive-automation.spec.ts --project=webkit
    ;;
  0)
    echo -e "${YELLOW}Exiting...${NC}"
    exit 0
    ;;
  *)
    echo -e "${RED}Invalid choice. Exiting.${NC}"
    exit 1
    ;;
esac

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}✓ Tests completed!${NC}"
echo ""
echo -e "${YELLOW}📊 View detailed HTML report:${NC}"
echo -e "   npx playwright show-report"
echo ""
echo -e "${YELLOW}📸 Screenshots saved to:${NC}"
echo -e "   test-results/automation/"
echo ""
echo -e "${BLUE}╚══════════════════════════════════════════════════════╝${NC}"
