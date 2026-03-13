# UI Design Polish Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish the PlayerView and QueueView UI by removing redundant headers, consolidating track info into the progress bar label, replacing unicode icons with React Icons, adding a volume icon, and cleaning up the queue page.

**Architecture:** All changes are confined to `src/components/PlayerView.tsx` and `src/components/QueueView.tsx`. No new files. No backend changes. Because `noUnusedLocals: true` is set in tsconfig, intermediate builds within a file will fail if icons are imported before they are used — so all changes to `PlayerView.tsx` are made before the first build verification. Build is then verified once for PlayerView and once for QueueView.

**Tech Stack:** React 18, TypeScript, `@decky/ui`, `react-icons` v5.3.0 (already installed)

**Spec:** `docs/superpowers/specs/2026-03-12-ui-design-polish-design.md`

---

## Chunk 1: PlayerView.tsx changes

All steps in Tasks 1–5 edit the same file. Only build after Task 5 when all changes are complete, because `noUnusedLocals: true` will error on any imported icon that isn't yet used in JSX.

### Task 1: Add imports and REPEAT_ICONS

**Files:**
- Modify: `src/components/PlayerView.tsx`

- [ ] **Step 1: Add react-icons imports**

At the top of `src/components/PlayerView.tsx`, after the existing imports, add:

```tsx
import { FaStepBackward, FaPlay, FaPause, FaStepForward, FaThumbsUp, FaThumbsDown, FaVolumeUp, FaRandom } from 'react-icons/fa';
import { MdRepeat, MdRepeatOne } from 'react-icons/md';
```

Do NOT build yet — the icons are unused until Tasks 3–5.

- [ ] **Step 2: Replace REPEAT_LABELS with REPEAT_ICONS**

Find and replace the `REPEAT_LABELS` constant at the top of the file. The current code:

```tsx
const REPEAT_LABELS: Record<string, string> = {
  NONE: 'Repeat: Off',
  ALL: 'Repeat: All',
  ONE: 'Repeat: One',
};
const REPEAT_NEXT: Record<string, number> = { NONE: 1, ALL: 1, ONE: 1 };
```

Replace with:

```tsx
const REPEAT_NEXT: Record<string, number> = { NONE: 1, ALL: 1, ONE: 1 };
const REPEAT_ICONS: Record<string, JSX.Element> = {
  NONE: <MdRepeat size={16} style={{ color: 'var(--gpSystemLighterGrey)' }} />,
  ALL: <MdRepeat size={16} style={{ color: 'white' }} />,
  ONE: <MdRepeatOne size={16} style={{ color: 'white' }} />,
};
```

`JSX.Element` is globally available — no extra import needed (`tsconfig.json` uses `"jsx": "react-jsx"`).

---

### Task 2: Update track info + progress bar section

**Files:**
- Modify: `src/components/PlayerView.tsx`

- [ ] **Step 1: Replace the track info section**

Find the track info `<Section>` block in the component's return (it contains the title/artist `<div>` and a `PaddedSlider` conditioned on `duration > 0`):

```tsx
{/* Track info */}
<Section>
  <div style={{ textAlign: 'center', padding: '8px 0' }}>
    <div style={{ fontWeight: 'bold', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      {title}
    </div>
    {artist && (
      <div style={{ fontSize: '11px', color: 'var(--gpSystemLighterGrey)', marginTop: '2px' }}>
        {artist}
      </div>
    )}
  </div>
  {duration > 0 && (
    <PaddedSlider
      label=""
      value={position}
      min={0}
      max={duration}
      step={1}
      onChange={(val) => { void seekTo(val); }}
      showValue={false}
    />
  )}
</Section>
```

Replace with:

```tsx
{/* Track info + progress bar */}
{duration > 0 && (
  <Section>
    <PaddedSlider
      label={artist ? `${title} / ${artist}` : title}
      value={position}
      min={0}
      max={duration}
      step={1}
      onChange={(val) => { void seekTo(val); }}
      showValue={false}
    />
  </Section>
)}
```

---

### Task 3: Update controls section

**Files:**
- Modify: `src/components/PlayerView.tsx`

- [ ] **Step 1: Remove section title, update DialogButton path icons**

Change `<Section title="Controls" noPull>` → `<Section noPull>`.

In the `DialogButton` path, replace the transport buttons:

```tsx
{/* Before — transport row */}
<DialogButton style={rowBtnFirst} onClick={() => { void previous(); }}>⏮</DialogButton>
<DialogButton style={rowBtn} onClick={() => { void togglePlay(); }}>
  {isPlaying ? '⏸' : '▶'}
</DialogButton>
<DialogButton style={rowBtn} onClick={() => { void next(); }}>⏭</DialogButton>
```

```tsx
{/* After — transport row */}
<DialogButton style={rowBtnFirst} onClick={() => { void previous(); }}><FaStepBackward /></DialogButton>
<DialogButton style={rowBtn} onClick={() => { void togglePlay(); }}>
  {isPlaying ? <FaPause /> : <FaPlay />}
</DialogButton>
<DialogButton style={rowBtn} onClick={() => { void next(); }}><FaStepForward /></DialogButton>
```

Replace the like/dislike row:

```tsx
{/* Before — like/dislike row */}
<DialogButton style={rowBtnFirst} onClick={() => { void like(); }}>👍 Like</DialogButton>
<DialogButton style={rowBtn} onClick={() => { void dislike(); }}>👎 Dislike</DialogButton>
```

```tsx
{/* After — like/dislike row */}
<DialogButton style={rowBtnFirst} onClick={() => { void like(); }}><FaThumbsUp /></DialogButton>
<DialogButton style={rowBtn} onClick={() => { void dislike(); }}><FaThumbsDown /></DialogButton>
```

- [ ] **Step 2: Update ButtonItem fallback path icons**

```tsx
{/* Before */}
<ButtonItem onClick={() => { void previous(); }}>⏮ Previous</ButtonItem>
<ButtonItem onClick={() => { void togglePlay(); }}>{isPlaying ? '⏸ Pause' : '▶ Play'}</ButtonItem>
<ButtonItem onClick={() => { void next(); }}>⏭ Next</ButtonItem>
<ButtonItem onClick={() => { void like(); }}>👍 Like</ButtonItem>
<ButtonItem onClick={() => { void dislike(); }}>👎 Dislike</ButtonItem>
```

```tsx
{/* After */}
<ButtonItem onClick={() => { void previous(); }}><FaStepBackward /> Previous</ButtonItem>
<ButtonItem onClick={() => { void togglePlay(); }}>{isPlaying ? <><FaPause /> Pause</> : <><FaPlay /> Play</>}</ButtonItem>
<ButtonItem onClick={() => { void next(); }}><FaStepForward /> Next</ButtonItem>
<ButtonItem onClick={() => { void like(); }}><FaThumbsUp /></ButtonItem>
<ButtonItem onClick={() => { void dislike(); }}><FaThumbsDown /></ButtonItem>
```

---

### Task 4: Update volume section — remove muted state and restructure

**Files:**
- Modify: `src/components/PlayerView.tsx`

This task removes `displayMuted` state and all four of its references. Do all sub-steps before the next build — removing the state before removing its JSX usages would cause a compile error.

- [ ] **Step 1: Remove `toggleMute` from the apiClient import**

Find the named import block from `'../services/apiClient'` and remove `toggleMute`:

```tsx
{/* Before */}
import {
  dislike,
  getVolume,
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
```

```tsx
{/* After */}
import {
  dislike,
  getVolume,
  like,
  next,
  previous,
  seekTo,
  setVolume,
  shuffle,
  switchRepeat,
  togglePlay,
} from '../services/apiClient';
```

- [ ] **Step 2: Remove `muted` from usePlayer() destructure**

```tsx
{/* Before */}
const { song, isPlaying, volume, muted, shuffle: isShuffled, repeat, position, connected } = usePlayer();
```

```tsx
{/* After */}
const { song, isPlaying, volume, shuffle: isShuffled, repeat, position, connected } = usePlayer();
```

- [ ] **Step 3: Remove all four displayMuted references atomically**

Remove these three items from the component body:

**a) State declaration:**
```tsx
const [displayMuted, setDisplayMuted] = useState(muted);
```

**b) The muted-sync useEffect (including its comment):**
```tsx
// muted is a reliable boolean — keep in sync with context.
useEffect(() => {
  if (!adjustingRef.current) setDisplayMuted(muted);
}, [muted]);
```

**c) `setDisplayMuted` call inside `fetchVolume`'s `.then` — change:**
```tsx
void getVolume().then((res) => {
  if (res !== null && !adjustingRef.current) {
    setDisplayVolume(res.state);
    setDisplayMuted(res.isMuted);
  }
});
```
to:
```tsx
void getVolume().then((res) => {
  if (res !== null && !adjustingRef.current) {
    setDisplayVolume(res.state);
  }
});
```

The fourth reference (`displayMuted` in the volume slider's `label` prop) is removed in the next step when the volume JSX is rewritten.

- [ ] **Step 4: Rewrite the volume Section JSX**

Find the entire volume section:
```tsx
{/* Volume */}
<Section title="Volume">
  <PaddedSlider
    label={displayMuted ? 'Muted' : `${Math.round(displayVolume)}%`}
    value={displayVolume}
    min={0}
    max={100}
    step={1}
    onChange={handleVolumeChange}
    showValue={false}
  />
  <PaddedButton onClick={() => { void toggleMute(); }}>
    {displayMuted ? '🔇 Unmute' : '🔊 Mute'}
  </PaddedButton>
</Section>
```

Replace with:
```tsx
{/* Volume */}
<Section>
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
</Section>
```

---

### Task 5: Update playback section, build, and commit

**Files:**
- Modify: `src/components/PlayerView.tsx`

- [ ] **Step 1: Rewrite the playback Section**

Find:
```tsx
{/* Playback options */}
<Section title="Playback">
  <PaddedToggle
    label="Shuffle"
    checked={isShuffled}
    onChange={() => { void shuffle(); }}
  />
  <PaddedButton onClick={() => { void switchRepeat(REPEAT_NEXT[repeat] ?? 1); }}>
    {REPEAT_LABELS[repeat] ?? 'Repeat: Off'}
  </PaddedButton>
</Section>
```

Replace with:
```tsx
{/* Playback options */}
<Section>
  <PaddedToggle
    label={<span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaRandom size={12} /> Shuffle</span>}
    checked={isShuffled}
    onChange={() => { void shuffle(); }}
  />
  <PaddedButton onClick={() => { void switchRepeat(REPEAT_NEXT[repeat] ?? 1); }}>
    {REPEAT_ICONS[repeat] ?? REPEAT_ICONS.NONE}
  </PaddedButton>
</Section>
```

- [ ] **Step 2: Build to verify all PlayerView changes**

```bash
npm run build
```

Expected: build succeeds with no errors. All imported icons are now used; all removed state variables are fully gone.

- [ ] **Step 3: Commit PlayerView changes**

```bash
git add src/components/PlayerView.tsx
git commit -m "feat: polish PlayerView UI — React Icons, remove headers, volume icon, track info in slider label"
```

---

## Chunk 2: QueueView.tsx changes

### Task 6: Update QueueView

**Files:**
- Modify: `src/components/QueueView.tsx`

- [ ] **Step 1: Add FaTrash import**

Add at the top of `src/components/QueueView.tsx`, after existing imports:

```tsx
import { FaTrash } from 'react-icons/fa';
```

- [ ] **Step 2: Remove Queue title from empty-queue Section**

Find:
```tsx
<Section title="Queue">
  <div style={{ padding: '8px 12px', color: 'var(--gpSystemLighterGrey)', fontSize: '12px' }}>
    Queue is empty
  </div>
</Section>
```

Change to:
```tsx
<Section>
  <div style={{ padding: '8px 12px', color: 'var(--gpSystemLighterGrey)', fontSize: '12px' }}>
    Queue is empty
  </div>
</Section>
```

- [ ] **Step 3: Remove Queue title from loaded-queue Section and update Clear Queue button**

Find the opening of the loaded-queue return:
```tsx
return (
  <Section title="Queue">
    <PaddedButton onClick={() => { void handleClear(); }}>Clear Queue</PaddedButton>
```

Change to:
```tsx
return (
  <Section>
    <PaddedButton onClick={() => { void handleClear(); }}><FaTrash /> Clear Queue</PaddedButton>
```

The loading state `<Section>` (no title) is left unchanged.

- [ ] **Step 4: Build to verify**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 5: Commit QueueView changes**

```bash
git add src/components/QueueView.tsx
git commit -m "feat: polish QueueView UI — remove Queue title, add trash icon to clear button"
```

---

## Chunk 3: Package and deliver

### Task 7: Package

- [ ] **Step 1: Package as installable zip**

```bash
mkdir -p /tmp/ym/youtube-music/dist
cp dist/index.js /tmp/ym/youtube-music/dist/
cp plugin.json package.json main.py /tmp/ym/youtube-music/
cd /tmp/ym && powershell.exe -Command "Compress-Archive -Path 'youtube-music' -DestinationPath 'youtube-music.zip' -Force"
cp /tmp/ym/youtube-music.zip ./youtube-music.zip
```

Expected: `youtube-music.zip` updated in project root with structure:
```
youtube-music/
  main.py
  package.json
  plugin.json
  dist/
    index.js
```

- [ ] **Step 2: Final commit**

```bash
git add dist/index.js youtube-music.zip
git commit -m "build: rebuild and repackage after UI design polish"
```
