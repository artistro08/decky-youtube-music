# UI Design Polish — Spec

**Date:** 2026-03-12

## Overview

A focused visual polish pass on `PlayerView.tsx` and `QueueView.tsx`. Goals: remove redundant section headers, consolidate track info into the progress bar label, replace unicode/emoji icons with React Icons, add a volume icon beside the slider, and clean up the queue page.

The tab height jitter issue is explicitly out of scope and will be addressed in a separate plan.

---

## PlayerView.tsx

### Track Info + Progress Bar

The title/artist `<div>` block and `PaddedSlider` are siblings inside the same `<Section>`. The `PaddedSlider` is currently already wrapped in `{duration > 0 && ...}` inside that section.

Changes:
- **Remove** the `<div>` block containing the title and artist text
- **Update** the `label` prop on the existing `PaddedSlider` (currently `""`) to a computed string:
  - `artist` present: `"${title} / ${artist}"`
  - No artist: `"${title}"`
- **Condition** the entire `<Section>` on `duration > 0` — move the gate to wrap the whole `<Section>`. Remove the existing inner `{duration > 0 && ...}` wrapper around the slider since the outer condition now handles it. When `duration === 0`, this entire section is omitted — no track title or slider is shown. This is intentional: when nothing is playing there is nothing useful to display here.
- Everything else stays the same

### Controls Section

- **Remove** `title="Controls"` from the `<Section>` wrapper; retain the `noPull` prop (`<Section noPull>`)
- **Replace** unicode/emoji button content with React Icons (`react-icons/fa`):
  - `⏮` → `<FaStepBackward />`
  - `▶` / `⏸` → `<FaPlay />` / `<FaPause />`
  - `⏭` → `<FaStepForward />`
  - `👍 Like` → `<FaThumbsUp />` (icon only, no text — in both paths)
  - `👎 Dislike` → `<FaThumbsDown />` (icon only, no text — in both paths)
- Apply to both the `DialogButton` path and the `ButtonItem` fallback path
- In the `ButtonItem` fallback path, keep text labels alongside icons for transport controls: `<FaStepBackward /> Previous`, `<FaPlay /> Play` / `<FaPause /> Pause`, `<FaStepForward /> Next`. Like/Dislike are icon-only in both paths.

### Volume Section

- **Remove** `title="Volume"` from the `<Section>` wrapper
- **Remove** the mute `<PaddedButton>` entirely
- **Remove** `toggleMute` from the import list (becomes unused)
- **Remove** `displayMuted` state variable and all references to it (note: `noUnusedLocals: true` in tsconfig means all four must be removed to compile):
  - Remove `const [displayMuted, setDisplayMuted] = useState(muted)`
  - Remove the `useEffect` that syncs `displayMuted` from `muted` context: `useEffect(() => { if (!adjustingRef.current) setDisplayMuted(muted); }, [muted]);`
  - In `fetchVolume`'s `.then` callback, remove the `setDisplayMuted(res.isMuted)` line; the `res` object is still accessed for `res.state` on the line above — no return-type changes needed
  - The fourth reference — `displayMuted` in the volume `PaddedSlider`'s `label` prop (`label={displayMuted ? 'Muted' : ...}`) — is removed as part of the `label=""` rewrite in the volume row restructure below
- **Remove** `muted` from the `usePlayer()` destructure at the top of the component — it becomes unused after the above removals (required by `noUnusedLocals: true`)
- **Set** `label=""` on `PaddedSlider` (empty string, not omitted — `label` is a required prop on `SliderFieldProps`)
- **Restructure** the volume row as follows:

```tsx
<div style={{ display: 'flex', alignItems: 'center' }}>
  <div style={{ width: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, paddingLeft: '12px' }}>
    <FaVolumeUp size={14} />
  </div>
  <div style={{ flex: 1 }}>
    <PaddedSlider
      label=""
      value={displayVolume}
      min={0}
      max={100}
      step={1}
      onChange={handleVolumeChange}
      showValue={false}
    />
  </div>
</div>
```

The `PaddedSlider` retains its existing internal padding/min-width override logic unchanged. The outer flex row provides the icon column; the slider takes the remaining width. Note: `PaddedSlider` applies `paddingLeft: '10px'` and `paddingRight: '10px'` to its inner element via `useEffect`. The icon column's `paddingLeft: '12px'` and the slider's internal `paddingLeft: '10px'` will produce a slight visual indent between the icon and slider track left edge — this is acceptable by design and matches the Steam Quick Settings reference layout.

### Playback Section

- **Remove** `title="Playback"` from the `<Section>` wrapper
- **Shuffle toggle**: keep `PaddedToggle` (wraps `ToggleField`) unchanged except update the `label` prop to JSX. `ToggleField.label` is typed as `ReactNode` (from `ItemProps`) so JSX is valid:
  ```tsx
  label={<span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaRandom size={12} /> Shuffle</span>}
  ```
  The toggle switch on the right is unchanged.
- **Repeat button**: uses `PaddedButton` (wraps `ButtonItem`). Replace `REPEAT_LABELS` string content with icon-based JSX.
  - Delete the `REPEAT_LABELS` constant
  - Keep `REPEAT_NEXT` constant unchanged (still used in the `onClick` handler). Note: all values are `1`, meaning `switchRepeat(1)` is always sent — this is pre-existing behavior that works correctly with the youtube-music companion API and is intentionally preserved here
  - Repeat icon logic:
    - `NONE` → `<MdRepeat style={{ color: 'var(--gpSystemLighterGrey)' }} />`
    - `ALL` → `<MdRepeat style={{ color: 'white' }} />`
    - `ONE` → `<MdRepeatOne style={{ color: 'white' }} />`
  - Implement as a **module-level** const (alongside `REPEAT_NEXT`). `JSX.Element` is available globally — no extra import needed with `"jsx": "react-jsx"` in tsconfig:
    ```tsx
    const REPEAT_ICONS: Record<string, JSX.Element> = {
      NONE: <MdRepeat size={16} style={{ color: 'var(--gpSystemLighterGrey)' }} />,
      ALL: <MdRepeat size={16} style={{ color: 'white' }} />,
      ONE: <MdRepeatOne size={16} style={{ color: 'white' }} />,
    };
    ```
  - `onClick` → `switchRepeat(REPEAT_NEXT[repeat] ?? 1)` is unchanged

---

## QueueView.tsx

- **Section titles**: There are three `<Section>` usages:
  - Loading state (~line 53): already has no `title` — leave as-is
  - Empty-queue state (~line 63): remove `title="Queue"`
  - Loaded-queue state (~line 72): remove `title="Queue"`
- **Clear Queue button**: keep `PaddedButton`, update children to `<><FaTrash /> Clear Queue</>` (icon + text). This button is rendered outside the `if (DialogButton)` branch, so it appears in all paths.
- **Remove item button** (`✕`): exists only in the `DialogButton` path — leave as the unicode `✕` character, no change needed. The `ButtonItem` fallback path has no remove button and is also left unchanged.

---

## Imports to add

### PlayerView.tsx
```ts
import { FaStepBackward, FaPlay, FaPause, FaStepForward, FaThumbsUp, FaThumbsDown, FaVolumeUp, FaRandom } from 'react-icons/fa';
import { MdRepeat, MdRepeatOne } from 'react-icons/md';
```

### QueueView.tsx
```ts
import { FaTrash } from 'react-icons/fa';
```

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
| Repeat All/Off | `MdRepeat` | `react-icons/md` |
| Repeat One | `MdRepeatOne` | `react-icons/md` |
