# Peeples Donuts: Pin-First Redesign

## Session Summary
This document captures the design direction and implementation progress for transforming Peeples Donuts from a complex DeFi dashboard into a tight-loop, progressive-discovery mini app.

---

## Core Vision

**The Problem:** The app felt like a "bolt-on DeFi dashboard" - disconnected pages, claim-focused UI, no cohesive experience.

**The Solution:** A pin-centric experience where everything flows from the Pin. One screen that evolves based on user state.

### The Tight Loop
```
Mint Pin → Share → Earn Yield → Claim → Share → Buy More Flair → Fuse → Share
```

### User Segments
```
No Pin + No Shares    → Paid onboarding (Pick Flair → Set Amount → Mint)
Has Shares + No Pin   → Free Pin mint (same flow, no payment)
Has Pin + No Flair    → Prompt to get flair
Has Pin + Has Flair   → Yield view with claim (when ready)
```

---

## What Was Built

### 1. PinApp Component (`components/pin-app/PinApp.tsx`)

**Two Distinct Views:**

#### A. Onboarding View (No Pin)
- Donut-shaped container with "tap to join" prompt
- Phases: `idle` → `awakening` → `choosing` → `feeding` → `birthing` → `celebrating`
- Role selection with 5 Bronze flair options (Baker, Manager, Cashier, Promoter, Delivery)
- Amount selection for deposit (0.005, 0.01, 0.025, 0.05 ETH)
- Clean loading animation during mint (rotating ring, not spinning chaos)
- Full-screen celebration with generated pin display
- Share prompts after minting

#### B. Post-Mint View (Has Pin)
- Card-based layout with pin image as hero
- Role/flair badge
- Yield status: "Yield accumulating" or "Ready to claim" with amount
- Action buttons: Claim/Share + Get Flair
- **Bottom drawer** for power features:
  - King Glazer (featured, prominent)
  - Fee Auction
  - Pool Management
  - Flash Loans (coming soon)

### 2. Mock Mode for Testing
Environment variables in `.env.local`:
```
NEXT_PUBLIC_MOCK_TRANSACTIONS=true
NEXT_PUBLIC_MOCK_USER_SEGMENT=new_user
```

Segments: `new_user` | `shareholder_no_pin` | `pin_no_flair` | `active_earner` | `yield_ready`

Mock mode simulates transactions and state changes without real blockchain calls.

### 3. Pin Generation Integration
- Calls `generate_pin(fid)` AFTER payment succeeds (not before, to avoid wasting credits)
- Generated pin URL stored in state and displayed in celebration + post-mint views
- Endpoint: `https://peeples-pins-generator.fly.dev/generate_pfp/{fid}`

---

## Design Decisions Made

### Visual Style
- Warm bakery aesthetic: cream (#FDF6E3), maple (#D4915D), soft pink (#E85A71)
- NO dancing particles, confetti, or chaotic animations
- Clean, minimal animations (fade in, slide up, subtle pulse)
- Pin as hero image, not hidden in a donut hole post-mint

### Progressive Discovery (Bottom Drawer)
User wanted power features accessible but not overwhelming. Decision: **Bottom drawer approach**.

Options considered:
1. ~~Tab/segment control~~ - Too much navigation
2. ~~Contextual unlocks~~ - Interesting but complex to implement
3. ~~Single "More" button~~ - Too hidden
4. **Bottom drawer** ✓ - Subtle handle, pull up to reveal

King Glazer is featured prominently (gradient background, larger) since it's the original platform feature.

### Flow After Minting
After celebration screen, "Continue to app" goes to the post-mint view (not back to mint screen). This required tracking `justMinted` and `justEquippedFlair` state for mock mode.

---

## What Still Needs Work

### Immediate Issues
1. **Other pages still exist** - `/pool`, `/auction`, `/pins` etc. are separate pages that break the single-screen experience
2. **Navigation inconsistency** - The drawer links to these old pages via `window.location.href`

### To Complete the Vision
1. **Consolidate pages** - Either:
   - Make all features work within the drawer/modal system
   - Or redesign other pages to match the new aesthetic and feel connected

2. **King Glazer integration** - Add actual data to the card:
   - Current king
   - Your position/distance from king
   - Quick buy action

3. **Flair shop** - Should feel like part of the experience, not a separate page

4. **Contextual prompts** - As users engage more, surface relevant features:
   - "You've claimed 3x - check out Fee Auction"
   - "You're 0.02 ETH away from becoming King Glazer"

5. **Real data integration** - Remove mock mode dependencies, wire up actual contract calls

---

## Key Files

| File | Purpose |
|------|---------|
| `components/pin-app/PinApp.tsx` | Main component with both views |
| `hooks/useUserState.ts` | Centralized user segment detection |
| `hooks/useOnboardingMint.ts` | Bundled mint transaction logic |
| `hooks/usePins.ts` | Pin ownership and minting |
| `hooks/useFlair.ts` | Flair ownership, equipping, fusion |
| `hooks/useFlairYield.ts` | Yield accumulation and claiming |
| `lib/server_functions/generate_pin.ts` | Pin image generation endpoint |
| `lib/flair-data.ts` | Flair token metadata and image paths |
| `.env.local` | Mock mode configuration |

---

## Role/Flair Mapping

| Gauge | Role Title | Earns |
|-------|------------|-------|
| Donut | Baker | $DONUT |
| Donut/WETH LP | Manager | LP fees |
| USDC | Cashier | $USDC |
| QR | Promoter | $QR |
| Aero | Delivery | $AERO |

Flair images at: `/media/flair/{gauge}_{rarity}.png`

---

## Animation Classes Used

```css
.animate-fadeIn    - Fade in with slight upward movement
.animate-slideUp   - Slide up from below
.animate-spin-slow - Slow rotation (1.5s) for loading states
```

---

## Questions to Resolve

1. Should power features open as modals/sheets or navigate to redesigned pages?
2. How deep should the drawer go? Just quick actions, or full feature access?
3. Should there be a "back" concept, or is it always about returning to the pin view?
4. How to handle users who access `/pool` or `/auction` directly via URL?

---

## Next Steps

1. Create new branch for this work
2. Decide on page consolidation strategy
3. Implement King Glazer quick-buy in drawer
4. Redesign flair shop to work within the new paradigm
5. Remove or redirect old page routes

---

*Last updated: Session ended with user creating new branch*
