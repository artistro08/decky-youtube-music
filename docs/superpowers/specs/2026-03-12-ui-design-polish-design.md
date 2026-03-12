# UI Design Polish — Spec

**Date:** 2026-03-12

## Overview

A focused visual polish pass on `PlayerView.tsx` and `QueueView.tsx`. Goals: remove redundant section headers, consolidate track info into the progress bar label, replace unicode/emoji icons with React Icons, add a volume icon beside the slider, and clean up the queue page.

The tab height jitter issue is explicitly out of scope and will be addressed in a separate plan.

---

## PlayerView.tsx

### Track Info + Progress Bar

- **Remove** the standalone title/artist `<div>` block currently rendered above the `PaddedSlider`
- **Pass** a combined label to `PaddedSlider`: `"Title"` when no artist, `"Title / Artist"` when artist is present
- The label renders in Decky's standard label position — directly above the slider track

### Controls Section

- **Remove** `title="Controls"` from the `<Section>` wrapper
- **Replace** unicode/emoji button content with React Icons (`react-icons/fa`):
  - `⏮` → `<FaStepBackward />`
  - `▶` / `⏸` → `<FaPlay />` / `<FaPause />`
  - `⏭` → `<FaStepForward />`
  - `👍 Like` → `<FaThumbsUp />` (icon only, no text)
  - `👎 Dislike` → `<FaThumbsDown />` (icon only, no text)
- Apply to both the `DialogButton` path and the `ButtonItem` fallback path

### Volume Section

- **Remove** `title="Volume"` from the `<Section>` wrapper
- **Remove** the mute `<PaddedButton>` entirely (no mute button)
- **Remove** the `label` prop from `PaddedSlider` (no percent or "Muted" text)
- **Add** a flex row wrapper around the slider:
  - Left: `<FaVolumeUp />` icon, small size (~14px), vertically centered, fixed width (~24px)
  - Right: `<PaddedSlider />` with `flex: 1`
  - Matches the Steam Quick Settings audio slider layout

### Playback Section

- **Remove** `title="Playback"` from the `<Section>` wrapper
- **Shuffle toggle**: keep `ToggleField` (switch on right). Change `label` prop to JSX: `<FaRandom />` icon inline to the left of the "Shuffle" text
- **Repeat button**: replace plain text label with icon-based label:
  - `NONE` → `<MdRepeat />` greyed out (inactive color)
  - `ALL` → `<MdRepeat />` active color (white/accent)
  - `ONE` → `<MdRepeatOne />` active color (white/accent)
  - Keep the `onClick` → `switchRepeat` behavior unchanged

---

## QueueView.tsx

- **Remove** `title="Queue"` from all `<Section>` usages (both the empty-queue and loaded-queue cases)
- **Clear Queue button**: keep `PaddedButton`, add `<FaTrash />` icon inside alongside "Clear Queue" text (or icon only — icon + text preferred for clarity)

---

## Out of Scope

- Tab height / L1-R1 tab movement — separate investigation plan
- Any changes to `websocketService.ts`, `apiClient.ts`, or `PlayerContext.tsx`
- New files — all changes are edits to existing components only

---

## Icons Reference

| Usage | Icon | Package |
|---|---|---|
| Previous | `FaStepBackward` | `react-icons/fa` |
| Play | `FaPlay` | `react-icons/fa` |
| Pause | `FaPause` | `react-icons/fa` |
| Next | `FaStepForward` | `react-icons/fa` |
| Like | `FaThumbsUp` | `react-icons/fa` |
| Dislike | `FaThumbsDown` | `react-icons/fa` |
| Volume | `FaVolumeUp` | `react-icons/fa` |
| Shuffle | `FaRandom` | `react-icons/fa` |
| Clear Queue | `FaTrash` | `react-icons/fa` |
| Repeat All | `MdRepeat` | `react-icons/md` |
| Repeat One | `MdRepeatOne` | `react-icons/md` |
