#!/bin/bash
# dyad-forensic-analysis.sh

echo "=== DYAD FORENSIC ANALYSIS ==="
echo ""

# ========================================
# STEP 1: FIND DYAD'S PROMPT ENGINEERING
# ========================================

echo "Step 1: Locating Dyad's Prompt System..."
echo "=========================================="

# Search for prompt-related files
find dyad-main -type f -name "*prompt*" -o -name "*template*" -o -name "*generate*" | head -20

# Look for AI service files
find dyad-main -type f -path "*/services/*" -name "*.ts" -o -name "*.js" | grep -E "(ai|llm|openai|anthropic)" | head -20

# Check for system prompts
find dyad-main -type f -exec grep -l "system.*prompt\|You are\|Generate" {} \; 2>/dev/null | head -10

echo ""
echo "Key Files to Review:"
echo "-------------------"

# Common locations for prompt logic
for file in \
  "dyad-main/src/services/ai.ts" \
  "dyad-main/src/services/code-generator.ts" \
  "dyad-main/src/lib/prompts.ts" \
  "dyad-main/src/templates/prompts.ts" \
  "dyad-main/app/services/generation.ts" \
  "dyad-main/lib/ai/prompts.ts"
do
  if [ -f "$file" ]; then
    echo "✓ Found: $file"
  fi
done

echo ""
echo "Step 2: Analyzing shadcn-ui Integration..."
echo "=========================================="

# Find how Dyad decides which components to use
find dyad-main -type f -exec grep -l "shadcn\|@/components/ui" {} \; | head -15

# Look for component selection logic
find dyad-main -type f -exec grep -l "component.*map\|component.*selector\|ui.*components" {} \; 2>/dev/null | head -10

echo ""
echo "Step 3: Finding Code Generation Logic..."
echo "=========================================="

# Search for file generation patterns
find dyad-main -type f -exec grep -l "generateFile\|createFile\|writeFile\|file.*content" {} \; 2>/dev/null | head -15

# Look for multi-file generation
find dyad-main -type f -exec grep -l "files.*array\|multiple.*files\|file.*list" {} \; 2>/dev/null | head -10

echo ""
echo "Step 4: Examining shadcn-ui Library Usage..."
echo "=========================================="

# Review shadcn-ui structure
ls -la ui-main/apps/www/registry/default/ui/ 2>/dev/null || ls -la ui-main/

# Count available components
if [ -d "ui-main/apps/www/registry/default/ui/" ]; then
  echo "Available shadcn-ui components:"
  ls ui-main/apps/www/registry/default/ui/ | wc -l
fi

echo ""
echo "Step 5: Analyzing Thinking/Reasoning Display..."
echo "=========================================="

# Find thinking panel logic
find dyad-main -type f -exec grep -l "thinking\|reasoning\|analyzing.*request\|constructing" {} \; 2>/dev/null | head -10

echo ""
echo "=== ANALYSIS COMPLETE ==="
echo "Review the files identified above to understand:"
echo "1. How prompts are structured"
echo "2. Which shadcn-ui components are used and why"
echo "3. How multi-file generation works"
echo "4. How 'Thinking' is displayed to users"
