# Volume Fix Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix volume slider so it shows the correct value on first load and after every tab switch, without polling.

**Architecture:** Trust WebSocket volume (confirmed 0–100 scale). Fix `VOLUME_CHANGED` to dispatch volume. Rewrite `VolumeSlider` to read from `PlayerContext` instead of local poll state. Local state only covers the active-drag window; a one-shot HTTP re-fetch at grace period end ensures accuracy if YTM doesn't echo the POST.

**Tech Stack:** React (TypeScript), `@decky/ui` SliderField, WebSocket companion API, HTTP companion API at `http://127.0.0.1:26538/api/v1`

**Spec:** `docs/superpowers/specs/2026-03-13-volume-fix-design.md`

---

## Chunk 1: Fix websocketService VOLUME_CHANGED

### Task 1: Fix the VOLUME_CHANGED handler

**Files:**
- Modify: `src/services/websocketService.ts` (lines 104–109)

- [ ] **Step 1: Open and read the current VOLUME_CHANGED handler**

In `src/services/websocketService.ts`, find the `VOLUME_CHANGED` case (around line 104). It currently reads:

```ts
case 'VOLUME_CHANGED': {
  // WebSocket volume is on a different scale than the HTTP API so it cannot
  // be trusted for display. Only dispatch muted (a reliable boolean).
  if (msg.muted !== undefined) notify({ muted: msg.muted });
  break;
}
```

- [ ] **Step 2: Replace with batched dispatch**

Replace the entire `VOLUME_CHANGED` case with:

```ts
case 'VOLUME_CHANGED': {
  const update: Partial<PlayerState> = {};
  if (msg.volume !== undefined) update.volume = msg.volume;
  if (msg.muted !== undefined) update.muted = msg.muted;
  if (Object.keys(update).length > 0) notify(update);
  break;
}
```

The incorrect comment is removed. Both fields are batched into one `notify` call — same pattern as the existing `PLAYER_INFO` handler above it.

- [ ] **Step 3: Verify the file compiles**

```bash
npm run build
```

Expected: build succeeds with no TypeScript errors. `dist/index.js` is updated.

- [ ] **Step 4: Commit**

```bash
git add src/services/websocketService.ts
git commit -m "fix: dispatch volume from VOLUME_CHANGED — was incorrectly discarded"
```

---

## Chunk 2: Rewrite VolumeSlider

### Task 2: Replace VolumeSlider state model

**Files:**
- Modify: `src/components/VolumeSlider.tsx` (full rewrite of component logic)

**What the new component does:**
- Reads `volume` and `connected` from `usePlayer()` (PlayerContext)
- Keeps local `displayVolume` state — initialized from context, updated optimistically on drag
- `useEffect` syncs `displayVolume` from `context.volume` whenever it changes, but only if the user is not currently adjusting
- On drag: update `displayVolume` instantly + set `userAdjustingRef = true` + debounced HTTP POST
- When grace period timer fires: clear `userAdjustingRef`, then do a one-shot `getVolume()` HTTP fetch and update `displayVolume` with the confirmed value
- Slider is `disabled` when `!connected`

- [ ] **Step 1: Rewrite VolumeSlider.tsx**

Replace the entire file content with:

```tsx
import { SliderField } from '@decky/ui';
import type { SliderFieldProps } from '@decky/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FaVolumeUp } from 'react-icons/fa';
import { getVolume, setVolume } from '../services/apiClient';
import { usePlayer } from '../context/PlayerContext';

// After the user moves the slider, suppress context sync for this long
// so the slider doesn't jump while the API call is in flight.
const USER_ADJUST_GRACE_MS = 1500;

const PaddedSlider = (props: SliderFieldProps) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const firstChild = ref.current.firstElementChild as HTMLElement | null;
    if (firstChild) {
      firstChild.style.paddingLeft = '19px';
      firstChild.style.paddingRight = '19px';
    }
    ref.current.querySelectorAll<HTMLElement>('*').forEach((el) => {
      if (parseFloat(window.getComputedStyle(el).minWidth) >= 270)
        el.style.minWidth = '0';
    });
  }, []);
  return (
    <div ref={ref}>
      <SliderField {...props} />
    </div>
  );
};

export const VolumeSlider = () => {
  const { volume: contextVolume, connected } = usePlayer();
  const [displayVolume, setDisplayVolume] = useState<number>(contextVolume);

  const userAdjustingRef = useRef(false);
  const userAdjustTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const apiDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync from context whenever it changes, unless the user is mid-adjust.
  useEffect(() => {
    if (!userAdjustingRef.current) {
      setDisplayVolume(contextVolume);
    }
  }, [contextVolume]);

  const handleChange = useCallback((val: number) => {
    setDisplayVolume(val);

    // Suppress context sync while adjusting.
    userAdjustingRef.current = true;
    if (userAdjustTimerRef.current) clearTimeout(userAdjustTimerRef.current);
    userAdjustTimerRef.current = setTimeout(() => {
      userAdjustingRef.current = false;
      // One-shot re-fetch to confirm the value if YTM doesn't echo back via WS.
      void getVolume().then((res) => {
        if (res !== null) setDisplayVolume(res.state);
      });
    }, USER_ADJUST_GRACE_MS);

    // Debounce the actual API call.
    if (apiDebounceRef.current) clearTimeout(apiDebounceRef.current);
    apiDebounceRef.current = setTimeout(() => {
      void setVolume(val);
    }, 300);
  }, []);

  return (
    <PaddedSlider
      icon={<FaVolumeUp size={18} />}
      value={displayVolume}
      min={0}
      max={100}
      step={1}
      onChange={handleChange}
      showValue={false}
      disabled={!connected}
    />
  );
};
```

- [ ] **Step 2: Verify the file compiles**

```bash
npm run build
```

Expected: build succeeds with no TypeScript errors. `dist/index.js` is updated.

- [ ] **Step 3: Commit**

```bash
git add src/components/VolumeSlider.tsx
git commit -m "fix: rewrite VolumeSlider to read volume from PlayerContext — eliminates poll-reset on remount"
```

---

## Chunk 3: Package and manual verification

### Task 3: Package the plugin

- [ ] **Step 1: Build and create the zip**

```bash
npm run build
mkdir -p /tmp/ym/youtube-music/dist
cp dist/index.js /tmp/ym/youtube-music/dist/
cp plugin.json package.json main.py /tmp/ym/youtube-music/
cd /tmp/ym && powershell.exe -Command "Compress-Archive -Path 'youtube-music' -DestinationPath 'youtube-music.zip' -Force"
cp /tmp/ym/youtube-music.zip ./youtube-music.zip
```

Expected: `youtube-music.zip` updated in project root.

- [ ] **Step 2: Verify zip structure**

```bash
cd /tmp/ym && powershell.exe -Command "Expand-Archive -Path 'youtube-music.zip' -DestinationPath 'verify' -Force; Get-ChildItem -Recurse verify"
```

Expected structure:
```
youtube-music/
  main.py
  package.json
  plugin.json
  dist/
    index.js
```

- [ ] **Step 3: Manual verification on Steam Deck**

Install via Decky "Install from ZIP". Test these scenarios in order:

1. **First load** — open the plugin. Volume slider should immediately show the correct YTM volume (not 0 or 100).
2. **Tab switch** — switch to Queue tab, switch back to Player. Volume slider should show the same value without flickering to 0.
3. **Adjust volume** — drag the slider. YTM volume should change. Slider should not snap back.
4. **External change** — change volume in YTM on desktop. Switch back to the Steam Deck plugin within a couple seconds. Slider should update to the new value.
5. **Disconnected state** — quit YTM. Slider should show as disabled. Relaunch YTM. Slider should re-enable with the correct value.

- [ ] **Step 4: Commit zip**

```bash
git add youtube-music.zip dist/index.js
git commit -m "build: rebuild with volume fix"
```
