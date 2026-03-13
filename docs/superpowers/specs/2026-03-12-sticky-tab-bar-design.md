# Sticky Tab Bar Layout Design

## Goal

Fix the L1/R1 tab bar so it stays fixed at the top of the plugin panel during touch scrolling. Currently, touch-scrolling the content causes the tab bar to scroll out of view (partially behind the Decky pane title). D-pad navigation is unaffected.

## Root Cause

The Decky panel's outer container is touch-scrollable. The current implementation sets an explicit pixel `height` on the wrapper div via a one-time DOM walk, but the wrapper has no `overflow: hidden` — so if the outer panel catches a touch-scroll gesture, it scrolls the entire content including the tab bar.

Additionally, three separate `querySelectorAll` DOM patches run on every tab switch (tab bar height/padding, content padding, glyph scaling), causing post-render layout shifts.

## Approach: `overflow: hidden` + CSS Injection

The critical fix is adding `overflow: hidden` to the wrapper div. This prevents touch scroll events from scrolling the outer panel. Content scrolling continues to work inside `[class*="TabContentsScroll"]`, which Decky already provides its own scroll context for.

The secondary improvement is replacing all per-tab-switch `querySelectorAll` DOM patches with a single CSS `<style>` tag injected once on mount and cleaned up on unmount.

### Why keep the JS height measurement

`100vh` is documented in CLAUDE.md as incorrect for this context — it includes Steam UI chrome below the panel. The DOM walk is the correct way to get available height and must be preserved.

### Why `overflow: hidden` fixes touch scroll

With `overflow: hidden` on the wrapper, touch scroll events cannot scroll the wrapper div. The tab bar is a sibling of the scroll content (not inside the scroll region), so it cannot be scrolled away. The `TabContentsScroll` element retains its own independent scroll behavior — we do not touch `overflow-y` on it.

### Why CSS injection replaces the per-tab-switch patches

The current `useEffect([activeTab])` re-runs on every tab switch, patching styles post-render and causing visible layout shifts. A `<style>` tag injected once on mount applies before paint and persists without re-running.

## Changes

### `src/index.tsx` — `TabsContainer` component

**Remove:**
- The tab-switch `useEffect` and its `[activeTab]` dependency array (the block starting with `// Adjust Decky Tabs layout on mount and every tab switch.`)

**Keep unchanged (do not remove):**
- `containerRef` — used by the height-measurement `useEffect` and the wrapper div
- `useRef` import — needed for `containerRef`
- `height` state and DOM-walk `useEffect` — the height measurement is correct and must be preserved
- `activeTab` state and `useState` import — still needed for `<Tabs activeTab={activeTab} ...>`

**Add:**
- A new mount-only `useEffect` with empty dependency array `[]` that:
  1. Creates a `<style>` element: `const el = document.createElement('style')`
  2. Sets its CSS: `el.textContent = /* see CSS block below */`
  3. Appends it: `document.head.appendChild(el)`
  4. Returns cleanup: `return () => el.remove()`

**Change the wrapper div:**

Before:
```tsx
<div ref={containerRef} style={{ height }}>
```

After:
```tsx
<div id="ytm-container" ref={containerRef} style={{ height, overflow: 'hidden' }}>
```

### Injected CSS

```css
/*
 * Flex column layout: makes Decky's immediate child of our wrapper a
 * flex column so TabHeaderRowWrapper and TabContentsScroll stack vertically.
 * height: 100% requires #ytm-container to have a defined height (set inline).
 *
 * ASSUMPTION: Decky inserts exactly one wrapper element between #ytm-container
 * and the TabHeaderRowWrapper/TabContentsScroll siblings. Verify in DevTools:
 * inspect #ytm-container and confirm its direct child contains TabHeaderRowWrapper
 * and TabContentsScroll as direct children of that same element.
 * If there are two intermediate wrappers, add a second rule for `> * > *`.
 */
#ytm-container > * {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* Tab bar: scoped, never shrinks. */
#ytm-container [class*="TabHeaderRowWrapper"] {
  flex-shrink: 0 !important;
  min-height: 32px !important;
  padding-left: 18px !important;
  padding-right: 18px !important;
}

/*
 * Content scroll area: scoped, takes remaining height.
 * overflow-y is NOT set — Decky manages its own scroll behavior.
 * Only padding is zeroed (same as the prior JS patch).
 */
#ytm-container [class*="TabContentsScroll"] {
  flex: 1 !important;
  min-height: 0 !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}

/* L1/R1 glyph icons: scoped. */
#ytm-container [class*="Glyphs"] {
  transform: scale(0.65) !important;
  transform-origin: center center !important;
}
```

Note: `position: sticky` is not used. With `overflow: hidden` on the wrapper, the tab bar cannot be scrolled out of view regardless of sticky positioning.

## What Is Not Changing

- `PlayerView.tsx` — no changes
- `QueueView.tsx` — no changes
- `Section.tsx` — no changes
- The fallback tab switcher (when `Tabs` is unavailable) — no changes
- The `Content` component's title gap patch — no changes

## Risk

The `#ytm-container > *` flex rule assumes Decky inserts exactly one wrapper between our div and the flex items (`TabHeaderRowWrapper`, `TabContentsScroll`). If there are two intermediate wrappers, the flex context won't reach `TabHeaderRowWrapper`/`TabContentsScroll` — they won't stack correctly. The fix is adding `#ytm-container > * > * { display: flex; flex-direction: column; min-height: 0; }`. This must be verified in DevTools on device.

Importantly, `overflow: hidden` on the wrapper div is the critical fix for the touch scroll bug and does not depend on the flex structure being correct. If the flex cascade fails, the only consequence is that content height may not be perfectly constrained — not that the tab bar scrolls away.

## Success Criteria

- Tab bar stays fixed at the top during touch scroll
- Content area scrolls independently below the tab bar
- No visible layout shift on tab switch
- D-pad navigation continues to work as before
- Build passes with no TypeScript errors
- On plugin panel close and reopen (component unmount/remount), styles are re-injected correctly and no duplicate `<style>` tags accumulate in `document.head`
