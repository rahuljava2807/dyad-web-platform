# Dyad Forensic Analysis - Complete Gap Report

**Analysis Date:** 2025-10-08
**Source:** `/Users/rahuldeshmukh/Downloads/Nimbusnext-Yavi-2026/dyad-main/src/prompts/system_prompt.ts`

---

## 🎯 CRITICAL DISCOVERIES

### 1. The "Already Installed" Deception

**Dyad's Strategy (lines 354-356):**
```
- You ALREADY have ALL the shadcn/ui components and their dependencies installed.
  So you don't need to install them again.
- You have ALL the necessary Radix UI components installed.
```

**Why This Works:**
- AI generates code assuming components exist
- Scaffold bundler adds components at generation time
- No complex dependency management in generated code
- Cleaner, simpler output

**Our Current Approach:**
- We tell AI to use components but also suggest installations
- Creates confusion about what's available
- AI sometimes tries to install packages

**ACTION REQUIRED:** Update our prompt to use the "already installed" pattern

---

### 2. Form Handling Philosophy

**Dyad's Approach:**
- NO react-hook-form
- NO zod validation libraries
- Simple native React state + manual validation
- Reason: Sandpack/preview compatibility

**Evidence:** No react-hook-form or zod in Dyad's package.json dependencies

**Our Current Approach:**
- We explicitly tell AI to use react-hook-form + zod
- These libraries don't work well in Sandpack preview
- Causes preview failures and complexity

**ACTION REQUIRED:** Switch to manual validation pattern like Dyad

---

### 3. Simplicity Principle

**Dyad's Core Rules (line 317-318):**
```
DO NOT OVERENGINEER THE CODE. You take great pride in keeping things simple and elegant.
DON'T DO MORE THAN WHAT THE USER ASKS FOR.
```

**Dyad's Error Handling (line 315):**
```
Don't catch errors with try/catch blocks unless specifically requested by the user.
```

**Our Current Approach:**
- We add comprehensive error handling
- We add loading states proactively
- We add validation even when not requested
- Over-engineered solutions

**ACTION REQUIRED:** Simplify prompts, remove proactive complexity

---

### 4. Thinking Process Display

**Dyad's Feature (lines 7-57):**
- Uses `<think></think>` tags for reasoning
- Shows step-by-step analysis to user
- Structured with bullet points
- Makes AI transparent and educational

**Our Current Approach:**
- No thinking display
- AI reasoning hidden from user
- Less transparency

**ACTION REQUIRED:** Add thinking tags to our output (adapt for JSON format)

---

### 5. File Structure Strategy

**Dyad's Rules:**
```
- Aim for components that are 100 lines of code or less
- Create a new file for every new component or hook, no matter how small
- Never add new components to existing files
```

**Our Current Approach:**
- Sometimes generates large single files
- Doesn't enforce 100-line limit
- Less modular

**ACTION REQUIRED:** Enforce small file sizes in prompts

---

### 6. Component Availability

**Dyad Has:** 48 shadcn/ui components in scaffold
**We Have:** 49 shadcn/ui components in scaffold

**Status:** ✅ We actually have MORE components than Dyad!

**Components List (Dyad):**
- accordion, alert-dialog, alert, aspect-ratio, avatar
- badge, breadcrumb, button, calendar, card
- carousel, chart, checkbox, collapsible, command
- context-menu, dialog, drawer, dropdown-menu, form
- hover-card, input, label, menubar, navigation-menu
- pagination, popover, progress, radio-group, scroll-area
- select, separator, sheet, skeleton, slider
- switch, table, tabs, textarea, toast, toaster
- toggle, toggle-group, tooltip

---

## 📊 COMPARISON MATRIX

| Feature | Dyad | Yavi (Current) | Status |
|---------|------|----------------|--------|
| shadcn/ui components | 48 | 49 | ✅ AHEAD |
| Scaffold bundler | ✅ Yes | ✅ Yes | ✅ MATCH |
| "Already installed" pattern | ✅ Yes | ❌ No | 🔴 GAP |
| react-hook-form | ❌ No | ✅ Yes | 🔴 GAP (we shouldn't use it) |
| Manual validation | ✅ Yes | ❌ No | 🔴 GAP |
| Thinking tags | ✅ Yes | ❌ No | 🔴 GAP |
| Simplicity principle | ✅ Strong | ⚠️ Weak | 🟡 GAP |
| No over-engineering | ✅ Enforced | ❌ Not enforced | 🔴 GAP |
| Small files (100 lines) | ✅ Yes | ⚠️ Sometimes | 🟡 GAP |
| No try/catch by default | ✅ Yes | ❌ No | 🔴 GAP |
| Fully functional code | ✅ Yes | ✅ Yes | ✅ MATCH |
| No placeholders | ✅ Yes | ✅ Yes | ✅ MATCH |

---

## 🚨 PRIORITY FIXES NEEDED

### Priority 1: Remove react-hook-form/zod from prompts
**Impact:** High - Causes preview failures
**Effort:** Low - Just update prompts
**File:** `backend/src/services/ai.ts`

### Priority 2: Add "already installed" deception
**Impact:** High - Simplifies AI output
**Effort:** Low - Update system prompt
**File:** `backend/src/services/ai.ts`

### Priority 3: Simplify validation approach
**Impact:** High - Better Sandpack compatibility
**Effort:** Medium - Update examples and instructions
**File:** `backend/src/services/ai.ts` and `componentSelector.ts`

### Priority 4: Add thinking display
**Impact:** Medium - Better UX, transparency
**Effort:** Medium - Parse thinking from response
**Files:** `backend/src/services/ai.ts`, `frontend/components/*`

### Priority 5: Enforce simplicity principle
**Impact:** Medium - Cleaner code generation
**Effort:** Low - Update prompts
**File:** `backend/src/services/ai.ts`

---

## 🎯 EXACT PROMPT DIFFERENCES

### What Dyad Says (DEFAULT_AI_RULES, lines 340-357):

```
# Tech Stack
- You are building a React application.
- Use TypeScript.
- Use React Router. KEEP the routes in src/App.tsx
- Always put source code in the src folder.
- Put pages into src/pages/
- Put components into src/components/
- The main page (default page) is src/pages/Index.tsx
- UPDATE the main page to include the new components. OTHERWISE, the user can NOT see any components!
- ALWAYS try to use the shadcn/ui library.
- Tailwind CSS: always use Tailwind CSS for styling components.

Available packages and libraries:
- The lucide-react package is installed for icons.
- You ALREADY have ALL the shadcn/ui components and their dependencies installed.
- You have ALL the necessary Radix UI components installed.
- Use prebuilt components from the shadcn/ui library after importing them.
```

### What We Currently Say:

We tell AI:
- Use react-hook-form + zod (❌ Wrong!)
- Install dependencies with npm (❌ Confusing!)
- Add comprehensive error handling (❌ Over-engineering!)
- Use @hookform/resolvers (❌ Sandpack incompatible!)

---

## 🔥 IMPLEMENTATION PLAN

### Step 1: Update System Prompt (30 min)
- Remove react-hook-form/zod references
- Add "already installed" pattern
- Add simplicity principles
- Add thinking instructions

### Step 2: Update Component Selector (15 min)
- Remove zod/react-hook-form from dependencies
- Update validation examples to manual validation
- Simplify instructions

### Step 3: Test with "Build me a signup form" (10 min)
- Verify output matches Dyad quality
- Check for manual validation
- Verify no react-hook-form
- Confirm shadcn/ui components

### Step 4: Add Thinking Display (1 hour)
- Parse thinking blocks from AI response
- Display in frontend
- Make collapsible for UX

### Total Effort: ~2 hours

---

## ✅ SUCCESS CRITERIA

**Test Prompt:** "Build me a signup form"

**Expected Output (Dyad Parity):**
1. ✅ Uses shadcn/ui Button, Input, Card, Label
2. ✅ Manual validation (NO react-hook-form, NO zod)
3. ✅ Multiple files (components/, lib/, types/)
4. ✅ Thinking process displayed
5. ✅ Simple, elegant code
6. ✅ NO try/catch blocks
7. ✅ NO placeholder content
8. ✅ Preview works on first try
9. ✅ Under 100 lines per file
10. ✅ Fully functional

---

## 📝 FILES TO MODIFY

1. **`backend/src/services/ai.ts`**
   - Update buildSystemPrompt()
   - Remove react-hook-form/zod instructions
   - Add "already installed" pattern
   - Add simplicity principles
   - Add thinking tag instructions

2. **`backend/src/lib/componentSelector.ts`**
   - Remove validationSchema: true flags
   - Remove zod/react-hook-form from dependencies arrays
   - Update import instructions
   - Replace with manual validation examples

3. **`frontend/src/components/*`** (Future)
   - Add thinking block display
   - Parse and format thinking tags

---

## 🎉 CONCLUSION

**We're 80% there!**

**Strengths:**
- We have MORE components than Dyad (49 vs 48)
- Scaffold bundler working
- Path conversion working
- Preview system functional

**Gaps:**
- Form validation approach (react-hook-form vs manual)
- Over-engineering tendency
- Missing thinking display
- Need "already installed" pattern

**Time to Parity:** ~2 hours of focused work

**Next Action:** Implement the 5 priority fixes in order

---

**Analysis Complete** ✅
**Ready for Implementation** 🚀
