# Spacing & Sticky Tab Bar Fixes — Design

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan.

**Goal:** Fix all spacing/padding inconsistencies across the plugin and make the L1/R1 tab bar stick correctly below the plugin title.

**Architecture:** All spacing issues share the same root cause — `PanelSection` adds ~16px horizontal padding to children. The fix is `margin: 0 -16px` on elements that should go edge-to-edge, with small padding added back where appropriate (sliders). The sticky tab bar uses Option B: fix the DOM offset measurement and use `transparent` + `backdrop-filter` background.

**Files affected:** `src/index.tsx`, `src/components/PlayerView.tsx`, `src/components/QueueView.tsx`, `src/components/SearchView.tsx`

---

## Section 1: Tab Bar Sticky

**Problem:** The sticky tab bar slides under the plugin title because:
1. The title bar is sticky at `top: 0` with a higher z-index
2. The current measurement uses `getBoundingClientRect().top` relative to the viewport, not the scroll container — giving a wrong offset value
3. The background is `var(--gpSystemDarkGrey, #1a1a1a)` which resolves to black, not the panel color

**Fix:**
- Walk up the DOM from `containerRef.current` to find the scroll parent (first ancestor with `overflow-y: scroll` or `overflow-y: auto`)
- Compute the container's `offsetTop` within the scroll parent — this is the true title bar height
- Set sticky `top` to that value
- Change background from solid dark grey to `transparent` + `backdrop-filter: blur(8px)` so the bar blends with the panel
- Add `paddingTop` equal to the measured tab bar height (~40px) to each tab's content wrapper so the first item doesn't render behind the sticky bar

---

## Section 2: Edge-to-Edge Button Rows (PlayerView + QueueView)

**Problem:** `Focusable` rows (Prev/Play/Next, Like/Dislike, queue items) are direct children of `PanelSection` which applies ~16px horizontal padding, creating visible insets on both sides.

**Fix:**
- Add `margin: '0 -16px'` to each `Focusable` row in PlayerView (controls rows) and QueueView (queue item rows)
- Buttons extend to the panel edges
- The `Clear Queue` button stays in a `PanelSectionRow` — it is a standard full-width button, not a row group

---

## Section 3: Slider Spacing (PlayerView)

**Problem:** Same root cause as Section 2 — `SliderField` inside `PanelSection` inherits the ~16px inset, making sliders appear pushed in from both edges.

**Fix:**
- Add `margin: '0 -16px'` to extend edge-to-edge
- Add back `padding: '0 8px'` so the thumb has breathing room at both ends, consistent with native Steam Deck slider appearance

Applies to both the seek slider and the volume slider.

---

## Section 4: Search Edge-to-Edge (SearchView)

**Problem:** `TextField` and `Search` button inside `PanelSection` + `PanelSectionRow` have the same ~16px inset on all sides.

**Fix:**
- Remove `PanelSectionRow` wrappers from the `TextField` and `ButtonItem`
- Apply `margin: '0 -16px'` to each so they extend edge-to-edge, matching the queue and player button layout
