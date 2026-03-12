# Spacing Design — Edge-to-Edge with Consistent 12px Gutter

**Date:** 2026-03-11
**Status:** Approved

## Problem

The plugin panel has two sources of unwanted edge spacing:

1. The `@decky/ui` `Tabs` component injects padding into its internal `TabContentColumn`, creating a small gap between the content and the panel edges.
2. Our `Section` component and Decky UI components (`ButtonItem`, `SliderField`, `ToggleField`) add their own internal padding on top of that, with inconsistent values (8px, 16px, etc.).

The goal: content should go edge-to-edge at the panel boundary, then a consistent **12px left/right gutter** should be applied to all items.

## Approach

**DOM traversal to zero the Tabs content column padding + 12px on `Section`.**

- At mount, walk up the DOM from the `TabsContainer` div to find the Tabs content column element (identified by having non-zero padding) and set its `padding` to `0`. This is resilient to Decky's internal CSS class names changing between versions.
- Add `padding: 0 12px` to the outer `<div>` in the `Section` component. All children (buttons, sliders, toggles, labels) inherit the gutter consistently.
- Adjust the `Section` title's left/right padding from the current `16px` to `0` (the outer `12px` padding covers it).
- Add `padding: 0 12px` to any non-Section-wrapped content (album art container, track info div).

## Files Changed

- `src/index.tsx` — extend `useEffect` DOM traversal to also zero the Tabs content column padding
- `src/components/Section.tsx` — add `padding: 0 12px` to outer div, update title padding
- `src/components/PlayerView.tsx` — add `padding: 0 12px` to album art and track info divs
- `src/components/QueueView.tsx` — add `padding: 0 12px` to loading/empty state divs

## Design Decisions

- **12px gutter** — balanced feel, similar to native Decky spacing
- **Option A (consistent gutter)** over card-style — cleaner, less visual noise on a small screen
- **DOM traversal** over CSS injection — CSS class names in `@decky/ui` are not stable across versions; DOM traversal is more resilient

## Out of Scope

- Top/bottom spacing changes
- Decky UI component internal padding overrides (buttons, sliders retain their own vertical padding)
- Any changes to `NotConnectedView` or `AuthTokenView` spacing
