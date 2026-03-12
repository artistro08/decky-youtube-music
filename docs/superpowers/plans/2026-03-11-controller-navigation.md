# Controller Navigation Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make all plugin UI navigable with the Steam Deck controller (D-pad + A button) and add L1/R1 tab switching.

**Architecture:** Replace the manual tab bar with Decky's native `Tabs` component (L1/R1 built-in). Use `DialogButton` inside `Focusable flow-children="horizontal"` for inline button rows — the exact pattern used by the working MusicControl Decky plugin. Use `ButtonItem` for single full-width buttons. For queue item rows, use `Field` with `DialogButton` as the inline child for the ✕ remove button.

**Tech Stack:** TypeScript, React, `@decky/ui` (`Tabs`, `DialogButton`, `ButtonItem`, `Field`, `Focusable`, `SliderField`, `ToggleField`)

---

## Background: Root Cause + Working Pattern

**Root cause of all previous failures:** Bare `Focusable`+`div` placed directly in `PanelSectionRow` is invisible to Steam's controller nav. The `Field`-based components (`ButtonItem`, `SliderField`, etc.) DO work, but only when used as standalone row items.

**The working pattern** (from MusicControl plugin — `https://github.com/martinpl/MusicControl`):

```tsx
// Placed directly inside PanelSection — NO PanelSectionRow wrapper
<Focusable
  style={{ display: 'flex', marginTop: '10px', marginBottom: '10px' }}
  flow-children="horizontal"   // ← "horizontal", not "row"
>
  <DialogButton style={btnFirst} onClick={handlePrev}>⏮</DialogButton>
  <DialogButton style={btn} onClick={handlePlay}>▶</DialogButton>
  <DialogButton style={btn} onClick={handleNext}>⏭</DialogButton>
</Focusable>
```

Two critical details:
1. `flow-children="horizontal"` enables D-pad left/right navigation between `DialogButton` children
2. The `Focusable` row is a **direct child of `PanelSection`**, NOT wrapped in `PanelSectionRow`

---

## File Map

| File | Change |
|------|--------|
| `src/index.tsx` | Replace manual Focusable tab bar with `Tabs` component |
| `src/components/PlayerView.tsx` | Replace Focusable+div rows with `DialogButton` rows; single buttons stay `ButtonItem` |
| `src/components/QueueView.tsx` | `ButtonItem` for Clear Queue; `Field` + `DialogButton` child per queue item |
| `src/components/SearchView.tsx` | Already uses `ButtonItem` — verify, no expected changes |

---

## Shared button styles

These go at the top of any file that uses `DialogButton` rows:

```tsx
const rowBtnFirst: React.CSSProperties = {
  marginLeft: '0px',
  height: '30px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '0',
  flex: 1,
};

const rowBtn: React.CSSProperties = {
  marginLeft: '5px',
  height: '30px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '0',
  flex: 1,
};
```

---

## Chunk 1: Tabs + PlayerView

### Task 1: Replace manual tab bar with `Tabs` component

**Files:**
- Modify: `src/index.tsx`

The `Tabs` component from `@decky/ui` is the same component used by the Steam Library and Media pages. It natively handles L1/R1 bumper switching. Replace the entire manual `PanelSection`/`Focusable` tab bar with it.

- [ ] **Step 1: Update `src/index.tsx`**

```tsx
import { Tabs, staticClasses } from '@decky/ui';
import { definePlugin } from '@decky/api';
import { useState } from 'react';
import { FaMusic } from 'react-icons/fa';

import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { NotConnectedView } from './components/NotConnectedView';
import { AuthTokenView } from './components/AuthTokenView';
import { PlayerView } from './components/PlayerView';
import { QueueView } from './components/QueueView';
import { SearchView } from './components/SearchView';

const PluginContent = () => {
  const { connected, authRequired } = usePlayer();
  const [activeTab, setActiveTab] = useState<string>('player');

  if (!connected) return <NotConnectedView />;
  if (authRequired) return <AuthTokenView />;

  return (
    <Tabs
      activeTab={activeTab}
      onShowTab={(tabID: string) => setActiveTab(tabID)}
      tabs={[
        { id: 'player', title: 'Player', content: <PlayerView /> },
        { id: 'queue', title: 'Queue', content: <QueueView /> },
        { id: 'search', title: 'Search', content: <SearchView /> },
      ]}
    />
  );
};

const Content = () => (
  <PlayerProvider>
    <PluginContent />
  </PlayerProvider>
);

export default definePlugin(() => ({
  name: 'YouTube Music',
  titleView: <div className={staticClasses.Title}>YouTube Music</div>,
  content: <Content />,
  icon: <FaMusic />,
  onDismount() {},
}));
```

- [ ] **Step 2: Build**

```bash
pnpm run build
```

Expected: clean build, no errors.

- [ ] **Step 3: Commit**

```bash
git add src/index.tsx
git commit -m "feat: replace manual tab bar with Tabs component for L1/R1 navigation"
```

---

### Task 2: Update PlayerView with DialogButton rows

**Files:**
- Modify: `src/components/PlayerView.tsx`

Inline button rows (Prev/Play/Next and Like/Dislike) use `DialogButton` inside `Focusable flow-children="horizontal"` placed **directly in `PanelSection`** with no `PanelSectionRow` wrapper. Single-action buttons (Mute, Repeat) stay as `ButtonItem` in `PanelSectionRow`.

- [ ] **Step 1: Replace `src/components/PlayerView.tsx`**

```tsx
import { ButtonItem, DialogButton, Focusable, PanelSection, PanelSectionRow, SliderField, ToggleField } from '@decky/ui';
import { usePlayer } from '../context/PlayerContext';
import {
  dislike,
  like,
  next,
  previous,
  seekTo,
  setVolume,
  shuffle,
  switchRepeat,
  toggleMute,
  togglePlay,
} from '../services/apiClient';

const REPEAT_LABELS: Record<string, string> = {
  NONE: 'Repeat: Off',
  ALL: 'Repeat: All',
  ONE: 'Repeat: One',
};
const REPEAT_NEXT: Record<string, number> = { NONE: 1, ALL: 1, ONE: 1 };

const rowBtnFirst: React.CSSProperties = {
  marginLeft: '0px',
  height: '30px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '0',
  flex: 1,
};

const rowBtn: React.CSSProperties = {
  marginLeft: '5px',
  height: '30px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '0',
  flex: 1,
};

export const PlayerView = () => {
  const { song, isPlaying, volume, muted, shuffle: isShuffled, repeat, position } = usePlayer();

  const albumArt = song?.albumArt;
  const title = song?.title ?? 'Nothing playing';
  const artist = song?.artist ?? '';
  const duration = song?.songDuration ?? 0;

  return (
    <>
      {/* Album art */}
      {albumArt && (
        <PanelSection>
          <PanelSectionRow>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <img
                src={albumArt}
                alt="Album art"
                style={{ width: '100%', maxWidth: '180px', borderRadius: '8px' }}
              />
            </div>
          </PanelSectionRow>
        </PanelSection>
      )}

      {/* Track info */}
      <PanelSection>
        <PanelSectionRow>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {title}
            </div>
            {artist && (
              <div style={{ fontSize: '11px', color: 'var(--gpSystemLighterGrey)', marginTop: '2px' }}>
                {artist}
              </div>
            )}
          </div>
        </PanelSectionRow>

        {duration > 0 && (
          <PanelSectionRow>
            <SliderField
              label=""
              value={position}
              min={0}
              max={duration}
              step={1}
              onChange={(val) => { void seekTo(val); }}
              showValue={false}
            />
          </PanelSectionRow>
        )}
      </PanelSection>

      {/* Prev / Play / Next — direct child of PanelSection, no PanelSectionRow */}
      <PanelSection title="Controls">
        <Focusable
          style={{ display: 'flex', marginTop: '4px', marginBottom: '4px' }}
          flow-children="horizontal"
        >
          <DialogButton style={rowBtnFirst} onClick={() => { void previous(); }}>⏮</DialogButton>
          <DialogButton style={rowBtn} onClick={() => { void togglePlay(); }}>
            {isPlaying ? '⏸' : '▶'}
          </DialogButton>
          <DialogButton style={rowBtn} onClick={() => { void next(); }}>⏭</DialogButton>
        </Focusable>

        {/* Like / Dislike — also direct child of PanelSection */}
        <Focusable
          style={{ display: 'flex', marginTop: '4px', marginBottom: '4px' }}
          flow-children="horizontal"
        >
          <DialogButton style={rowBtnFirst} onClick={() => { void like(); }}>👍 Like</DialogButton>
          <DialogButton style={rowBtn} onClick={() => { void dislike(); }}>👎 Dislike</DialogButton>
        </Focusable>
      </PanelSection>

      {/* Volume */}
      <PanelSection title="Volume">
        <PanelSectionRow>
          <SliderField
            label={muted ? 'Muted' : `${Math.round(volume)}%`}
            value={muted ? 0 : volume}
            min={0}
            max={100}
            step={1}
            onChange={(val) => { void setVolume(val); }}
            showValue={false}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem onClick={() => { void toggleMute(); }}>
            {muted ? '🔇 Unmute' : '🔊 Mute'}
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>

      {/* Playback options */}
      <PanelSection title="Playback">
        <PanelSectionRow>
          <ToggleField
            label="Shuffle"
            checked={isShuffled}
            onChange={() => { void shuffle(); }}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem onClick={() => { void switchRepeat(REPEAT_NEXT[repeat] ?? 1); }}>
            {REPEAT_LABELS[repeat] ?? 'Repeat: Off'}
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>
    </>
  );
};
```

- [ ] **Step 2: Build**

```bash
pnpm run build
```

Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add src/components/PlayerView.tsx
git commit -m "feat: use DialogButton rows for PlayerView controls with horizontal flow navigation"
```

---

## Chunk 2: QueueView + Final Packaging

### Task 3: Fix QueueView with Field rows and DialogButton remove

**Files:**
- Modify: `src/components/QueueView.tsx`

Clear Queue = `ButtonItem`. Each queue item row = `Field` with `onActivate` for jumping + a `DialogButton` child (right side, `childrenContainerWidth="min"`) for removing. `Field` registers in Steam's panel nav tree. The `DialogButton` child is separately focusable — navigate to it with D-pad right, press A to remove.

- [ ] **Step 1: Replace `src/components/QueueView.tsx`**

```tsx
import { ButtonItem, DialogButton, Field, PanelSection, PanelSectionRow } from '@decky/ui';
import { useEffect, useState } from 'react';
import { clearQueue, getQueue, removeFromQueue, setQueueIndex } from '../services/apiClient';
import type { QueueItem, QueueResponse } from '../types';

const getRenderer = (item: QueueItem) =>
  item.playlistPanelVideoRenderer ??
  item.playlistPanelVideoWrapperRenderer?.primaryRenderer?.playlistPanelVideoRenderer;

export const QueueView = () => {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadQueue = async () => {
    setLoading(true);
    const data: QueueResponse | null = await getQueue();
    setQueue(data?.items ?? []);
    setLoading(false);
  };

  useEffect(() => { void loadQueue(); }, []);

  const handleJump = async (index: number) => {
    await setQueueIndex(index);
    void loadQueue();
  };

  const handleRemove = async (index: number) => {
    await removeFromQueue(index);
    void loadQueue();
  };

  const handleClear = async () => {
    await clearQueue();
    setQueue([]);
  };

  if (loading) {
    return (
      <PanelSection>
        <PanelSectionRow><div>Loading queue...</div></PanelSectionRow>
      </PanelSection>
    );
  }

  if (queue.length === 0) {
    return (
      <PanelSection title="Queue">
        <PanelSectionRow>
          <div style={{ color: 'var(--gpSystemLighterGrey)', fontSize: '12px' }}>Queue is empty</div>
        </PanelSectionRow>
      </PanelSection>
    );
  }

  return (
    <PanelSection title="Queue">
      <PanelSectionRow>
        <ButtonItem onClick={() => { void handleClear(); }}>Clear Queue</ButtonItem>
      </PanelSectionRow>

      {queue.map((item, index) => {
        const r = getRenderer(item);
        const title = r?.title?.runs?.[0]?.text ?? 'Unknown';
        const artist = r?.shortBylineText?.runs?.[0]?.text ?? '';
        const isSelected = r?.selected ?? false;

        return (
          <PanelSectionRow key={index}>
            <Field
              label={<span style={{ fontWeight: isSelected ? 'bold' : 'normal' }}>{title}</span>}
              description={artist || undefined}
              onActivate={() => { void handleJump(index); }}
              onClick={() => { void handleJump(index); }}
              highlightOnFocus
              focusable
              childrenContainerWidth="min"
              bottomSeparator="none"
            >
              <DialogButton
                onClick={() => { void handleRemove(index); }}
                style={{
                  width: '28px',
                  height: '28px',
                  minWidth: '0',
                  padding: '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✕
              </DialogButton>
            </Field>
          </PanelSectionRow>
        );
      })}
    </PanelSection>
  );
};
```

- [ ] **Step 2: Build**

```bash
pnpm run build
```

Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add src/components/QueueView.tsx
git commit -m "feat: fix QueueView controller navigation with Field rows and DialogButton remove"
```

---

### Task 4: Verify SearchView

**Files:**
- Verify: `src/components/SearchView.tsx`

SearchView already uses `ButtonItem` for the Search button and each result row. Confirm no `Focusable`+`div` patterns remain.

- [ ] **Step 1: Read `src/components/SearchView.tsx` and confirm**

Look for:
- Search button = `<ButtonItem onClick={...} disabled={...}>`
- Each result = `<ButtonItem label={...} description={...} onClick={...} />`

If the file already matches this, no changes needed — skip to Step 3.

If any `Focusable`+`div` patterns exist (no `Field` parent), replace with `ButtonItem`.

- [ ] **Step 2: Build if changed**

```bash
pnpm run build
```

- [ ] **Step 3: Skip commit if no changes, otherwise:**

```bash
git add src/components/SearchView.tsx
git commit -m "fix: ensure SearchView uses ButtonItem throughout"
```

---

### Task 5: Package and test

- [ ] **Step 1: Final build**

```bash
pnpm run build
```

- [ ] **Step 2: Package zip**

```powershell
powershell -Command "Remove-Item -Force youtube-music.zip -ErrorAction SilentlyContinue; Compress-Archive -Path dist,plugin.json,main.py,package.json -DestinationPath youtube-music.zip"
```

- [ ] **Step 3: Install on Steam Deck and verify this checklist with the controller (no touch)**

| Item | Expected |
|------|----------|
| L1 / R1 | Switches between Player / Queue / Search tabs |
| D-pad in Player tab | Moves between all controls top to bottom |
| D-pad left/right on Prev/Play/Next row | Moves between the three buttons |
| D-pad left/right on Like/Dislike row | Moves between the two buttons |
| A button on any button | Triggers the action |
| D-pad in Queue tab | Moves between Clear Queue and each track row |
| A on a track row | Jumps to that track |
| D-pad right on a track row | Moves focus to the ✕ button |
| A on the ✕ button | Removes the track |
| D-pad in Search tab | Moves between search field, Search button, result rows |
| A on a result row | Plays the track immediately |

- [ ] **Step 4: If queue item ✕ is not separately focusable via D-pad right**

This is the one uncertain pattern (`Field` + `DialogButton` child). If D-pad right does NOT move to the ✕, use the fallback — Y button removes the focused track:

```tsx
<Field
  label={<span style={{ fontWeight: isSelected ? 'bold' : 'normal' }}>{title}</span>}
  description={artist || undefined}
  onActivate={() => { void handleJump(index); }}
  onClick={() => { void handleJump(index); }}
  onSecondaryButton={() => { void handleRemove(index); }}
  onSecondaryActionDescription="Remove"
  highlightOnFocus
  focusable
  bottomSeparator="none"
/>
```

Commit as:

```bash
git commit -m "fix: use Y button for queue remove (Field child button not separately navigable)"
```

- [ ] **Step 5: Commit zip**

```bash
git add youtube-music.zip
git commit -m "build: package with controller navigation"
```
