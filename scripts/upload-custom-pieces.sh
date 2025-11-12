#!/bin/bash
set -e

# Configuration
API_URL="${AP_FRONTEND_URL:-http://localhost:8080}/api"
API_KEY="${AP_API_KEY}"
PIECES_DIR="/usr/src/app/dist/packages/pieces/custom"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================"
echo "B4AI Custom Pieces Uploader"
echo "========================================"
echo "API URL: ${API_URL}"
echo "Pieces directory: ${PIECES_DIR}"
echo ""

# Check if API key is set
if [ -z "$API_KEY" ]; then
    echo -e "${RED}ERROR: AP_API_KEY environment variable is not set${NC}"
    exit 1
fi

# Wait for API to be ready
echo "Waiting for API to be ready..."
MAX_RETRIES=30
RETRY_COUNT=0

until curl -f -s "${API_URL}/v1/pieces" > /dev/null 2>&1; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo -e "${RED}ERROR: API did not become ready after ${MAX_RETRIES} attempts${NC}"
        exit 1
    fi
    echo "  Attempt ${RETRY_COUNT}/${MAX_RETRIES}... (waiting 2s)"
    sleep 2
done

echo -e "${GREEN}✓ API is ready${NC}"
echo ""

# Check if pieces directory exists
if [ ! -d "$PIECES_DIR" ]; then
    echo -e "${RED}ERROR: Pieces directory does not exist: ${PIECES_DIR}${NC}"
    exit 1
fi

# Upload each piece
UPLOAD_COUNT=0
SKIP_COUNT=0
ERROR_COUNT=0

for piece_dir in "${PIECES_DIR}"/*; do
    if [ ! -d "$piece_dir" ]; then
        continue
    fi

    piece_name=$(basename "$piece_dir")

    # Check if package.json exists
    if [ ! -f "${piece_dir}/package.json" ]; then
        echo -e "${YELLOW}⚠ Skipping ${piece_name}: no package.json found${NC}"
        SKIP_COUNT=$((SKIP_COUNT + 1))
        continue
    fi

    # Get version and package name from package.json
    version=$(node -p "require('${piece_dir}/package.json').version" 2>/dev/null || echo "unknown")
    pkg_name=$(node -p "require('${piece_dir}/package.json').name" 2>/dev/null || echo "unknown")

    if [ "$version" = "unknown" ] || [ "$pkg_name" = "unknown" ]; then
        echo -e "${YELLOW}⚠ Skipping ${piece_name}: could not read package.json${NC}"
        SKIP_COUNT=$((SKIP_COUNT + 1))
        continue
    fi

    echo "Processing: ${pkg_name}@${version}"

    # Create archive
    cd "$piece_dir"
    tar_file=$(npm pack --json 2>/dev/null | node -p "JSON.parse(require('fs').readFileSync(0, 'utf-8'))[0].filename" 2>/dev/null)

    if [ -z "$tar_file" ] || [ ! -f "$tar_file" ]; then
        echo -e "${RED}  ✗ Failed to create archive${NC}"
        ERROR_COUNT=$((ERROR_COUNT + 1))
        continue
    fi

    # Upload to API
    response=$(curl -X POST "${API_URL}/v1/pieces" \
        -H "Authorization: Bearer ${API_KEY}" \
        -F "pieceArchive=@${tar_file}" \
        -F "packageType=ARCHIVE" \
        -F "pieceType=CUSTOM" \
        -F "scope=PLATFORM" \
        -w "\n%{http_code}" \
        -s 2>/dev/null || echo "000")

    http_code=$(echo "$response" | tail -n1)

    # Clean up archive
    rm -f "$tar_file"

    # Check response
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        echo -e "${GREEN}  ✓ Uploaded successfully${NC}"
        UPLOAD_COUNT=$((UPLOAD_COUNT + 1))
    elif [ "$http_code" = "409" ]; then
        echo -e "${YELLOW}  ⚠ Already exists (skipped)${NC}"
        SKIP_COUNT=$((SKIP_COUNT + 1))
    else
        echo -e "${RED}  ✗ Upload failed (HTTP ${http_code})${NC}"
        ERROR_COUNT=$((ERROR_COUNT + 1))
    fi

    echo ""
done

# Summary
echo "========================================"
echo "Upload Summary"
echo "========================================"
echo -e "${GREEN}Uploaded: ${UPLOAD_COUNT}${NC}"
echo -e "${YELLOW}Skipped:  ${SKIP_COUNT}${NC}"
echo -e "${RED}Errors:   ${ERROR_COUNT}${NC}"
echo "========================================"

if [ $ERROR_COUNT -gt 0 ]; then
    exit 1
fi

echo -e "${GREEN}✓ Custom pieces upload completed successfully${NC}"
exit 0
