# Spacing & Sticky Tab Bar Fixes — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all horizontal spacing insets across the plugin and make the L1/R1 tab bar stick correctly below the plugin title bar.

**Architecture:** All spacing issues share the same root cause — `PanelSection` adds ~16px horizontal padding to its children. The fix is to add `margin: '0 -16px'` on elements that should go edge-to-edge (counteracting the section padding), with `padding: '0 8px'` added back for sliders. The sticky tab bar fix replaces the broken viewport-relative offset measurement with a scroll-parent-relative measurement, and replaces the black background with a semi-transparent blur.

**Tech Stack:** TypeScript, React, `@decky/ui` (PanelSection, SliderField, Focusable, DialogButton, TextField, ButtonItem), Rollup build via `pnpm run build`, PowerShell for packaging.

---

## Files to modify

- `src/index.tsx` — fix sticky offset measurement + background + add paddingTop to tab content
- `src/components/PlayerView.tsx` — add edge-to-edge margin to Focusable rows and SliderField wrappers
- `src/components/QueueView.tsx` — add edge-to-edge margin to queue item Focusable rows
- `src/components/SearchView.tsx` — add edge-to-edge margin to TextField and Search button

---

## Task 1: Fix sticky tab bar (index.tsx)

**Files:** Modify `src/index.tsx`

**Context:** The current `useEffect` measures `getBoundingClientRect().top` relative to the viewport, which includes the panel's own position on screen — giving a wrong offset (e.g. 250px instead of 52px). We need the offset relative to the scroll container. We also need to replace the black `var(--gpSystemDarkGrey)` background with a semi-transparent blur, and add `paddingTop` to each tab's content so the first item isn't hidden behind the sticky bar.

The tab bar row height is ~40px on the Steam Deck. Use a constant `TAB_BAR_HEIGHT = 40` for the content padding.

- [ ] **Step 1: Replace the measurement logic and update the CSS injection**

Replace the entire `src/index.tsx` with:

```tsx
import { ButtonItem, PanelSection, PanelSectionRow, Tabs, gamepadTabbedPageClasses, staticClasses } from '@decky/ui';
import { definePlugin } from '@decky/api';
import { useEffect, useRef, useState } from 'react';
import { FaMusic } from 'react-icons/fa';

import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { NotConnectedView } from './components/NotConnectedView';
import { AuthTokenView } from './components/AuthTokenView';
import { PlayerView } from './components/PlayerView';
import { QueueView } from './components/QueueView';
import { SearchView } from './components/SearchView';

const getScrollParent = (el: HTMLElement | null): HTMLElement => {
  if (!el || el === document.body) return document.body;
  const style = window.getComputedStyle(el);
  if (/scroll|auto/.test(style.overflow + style.overflowY)) return el;
  return getScrollParent(el.parentElement);
};

const TAB_BAR_HEIGHT = 40;

const PluginContent = () => {
  const { connected, authRequired } = usePlayer();
  const [activeTab, setActiveTab] = useState<string>('player');
  const containerRef = useRef<HTMLDivElement>(null);
  const [stickyTop, setStickyTop] = useState(52);

  useEffect(() => {
    if (!containerRef.current) return;
    const scrollParent = getScrollParent(containerRef.current.parentElement);
    const parentRect = scrollParent.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    setStickyTop(Math.round(containerRect.top - parentRect.top));
  }, []);

  if (!connected) return <NotConnectedView />;
  if (authRequired) return <AuthTokenView />;

  const tabPad: React.CSSProperties = { paddingTop: `${TAB_BAR_HEIGHT}px` };

  if (!Tabs) {
    return (
      <>
        <PanelSection>
          {(['player', 'queue', 'search'] as const).map((id) => (
            <PanelSectionRow key={id}>
              <ButtonItem onClick={() => setActiveTab(id)}>
                {activeTab === id
                  ? `▶ ${id.charAt(0).toUpperCase() + id.slice(1)}`
                  : id.charAt(0).toUpperCase() + id.slice(1)}
              </ButtonItem>
            </PanelSectionRow>
          ))}
        </PanelSection>
        {activeTab === 'player' && <div style={tabPad}><PlayerView /></div>}
        {activeTab === 'queue' && <div style={tabPad}><QueueView /></div>}
        {activeTab === 'search' && <div style={tabPad}><SearchView /></div>}
      </>
    );
  }

  return (
    <div
      ref={containerRef}
      className="ytm-tabs-container"
      style={{ height: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column' }}
    >
      {gamepadTabbedPageClasses?.TabHeaderRowWrapper && (
        <style>{`
          .ytm-tabs-container .${gamepadTabbedPageClasses.TabHeaderRowWrapper} {
            position: sticky;
            top: ${stickyTop}px;
            z-index: 9999;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(8px);
          }
        `}</style>
      )}
      <Tabs
        activeTab={activeTab}
        onShowTab={(tabID: string) => setActiveTab(tabID)}
        tabs={[
          { id: 'player', title: 'Player', content: <div style={tabPad}><PlayerView /></div> },
          { id: 'queue', title: 'Queue', content: <div style={tabPad}><QueueView /></div> },
          { id: 'search', title: 'Search', content: <div style={tabPad}><SearchView /></div> },
        ]}
      />
    </div>
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

- [ ] **Step 2: Build and verify no errors**

```bash
pnpm run build
```

Expected: `created dist in Xs` with no errors (TS warnings about `flow-children` are OK).

- [ ] **Step 3: Commit**

```bash
git add src/index.tsx
git commit -m "fix: correct sticky tab bar offset and background"
```

---

## Task 2: Fix slider spacing (PlayerView)

**Files:** Modify `src/components/PlayerView.tsx`

**Context:** Both `SliderField` components (seek and volume) sit inside `PanelSection` which applies ~16px horizontal padding. Wrapping each in a div with `margin: '0 -16px'` counteracts that padding (extending edge-to-edge), then `padding: '0 8px'` adds back a small inset so the slider thumb has breathing room at both ends — matching native Steam Deck slider appearance.

- [ ] **Step 1: Wrap the seek SliderField**

In `src/components/PlayerView.tsx`, find the seek slider block (lines 83–93) and replace:

```tsx
        {duration > 0 && (
          <SliderField
            label=""
            value={position}
            min={0}
            max={duration}
            step={1}
            onChange={(val) => { void seekTo(val); }}
            showValue={false}
          />
        )}
```

With:

```tsx
        {duration > 0 && (
          <div style={{ margin: '0 -16px', padding: '0 8px' }}>
            <SliderField
              label=""
              value={position}
              min={0}
              max={duration}
              step={1}
              onChange={(val) => { void seekTo(val); }}
              showValue={false}
            />
          </div>
        )}
```

- [ ] **Step 2: Wrap the volume SliderField**

Find the volume slider block (lines 131–139) and replace:

```tsx
        <SliderField
          label={muted ? 'Muted' : `${Math.round(volume)}%`}
          value={muted ? 0 : volume}
          min={0}
          max={100}
          step={1}
          onChange={(val) => { void setVolume(val); }}
          showValue={false}
        />
```

With:

```tsx
        <div style={{ margin: '0 -16px', padding: '0 8px' }}>
          <SliderField
            label={muted ? 'Muted' : `${Math.round(volume)}%`}
            value={muted ? 0 : volume}
            min={0}
            max={100}
            step={1}
            onChange={(val) => { void setVolume(val); }}
            showValue={false}
          />
        </div>
```

- [ ] **Step 3: Build and verify no errors**

```bash
pnpm run build
```

Expected: clean build.

- [ ] **Step 4: Commit**

```bash
git add src/components/PlayerView.tsx
git commit -m "fix: extend sliders edge-to-edge with consistent thumb padding"
```

---

## Task 3: Fix button row spacing (PlayerView)

**Files:** Modify `src/components/PlayerView.tsx`

**Context:** The two `Focusable` rows (Prev/Play/Next and Like/Dislike) are direct children of `PanelSection`. Adding `marginLeft: '-16px'` and `marginRight: '-16px'` to the `style` prop of each `Focusable` makes the buttons span the full panel width.

- [ ] **Step 1: Add negative margin to the Prev/Play/Next Focusable row**

Find the first Focusable in the Controls section and update its style:

```tsx
            <Focusable
              style={{ display: 'flex', marginTop: '4px', marginBottom: '4px', marginLeft: '-16px', marginRight: '-16px' }}
              flow-children="horizontal"
            >
              <DialogButton style={rowBtnFirst} onClick={() => { void previous(); }}>⏮</DialogButton>
              <DialogButton style={rowBtn} onClick={() => { void togglePlay(); }}>
                {isPlaying ? '⏸' : '▶'}
              </DialogButton>
              <DialogButton style={rowBtn} onClick={() => { void next(); }}>⏭</DialogButton>
            </Focusable>
```

- [ ] **Step 2: Add negative margin to the Like/Dislike Focusable row**

Find the second Focusable in the Controls section and update its style:

```tsx
            <Focusable
              style={{ display: 'flex', marginTop: '4px', marginBottom: '4px', marginLeft: '-16px', marginRight: '-16px' }}
              flow-children="horizontal"
            >
              <DialogButton style={rowBtnFirst} onClick={() => { void like(); }}>👍 Like</DialogButton>
              <DialogButton style={rowBtn} onClick={() => { void dislike(); }}>👎 Dislike</DialogButton>
            </Focusable>
```

- [ ] **Step 3: Build and verify no errors**

```bash
pnpm run build
```

Expected: clean build.

- [ ] **Step 4: Commit**

```bash
git add src/components/PlayerView.tsx
git commit -m "fix: extend player control button rows edge-to-edge"
```

---

## Task 4: Fix queue item spacing (QueueView)

**Files:** Modify `src/components/QueueView.tsx`

**Context:** Each queue item's `Focusable` row is a direct child of `PanelSection`. Adding `marginLeft: '-16px'` and `marginRight: '-16px'` to the Focusable style makes each row span full panel width, matching the button rows.

- [ ] **Step 1: Add negative margin to the queue item Focusable**

Find the `Focusable` that renders queue items (around line 70) and update its style:

```tsx
            <Focusable
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: '2px',
                marginBottom: '2px',
                marginLeft: '-16px',
                marginRight: '-16px',
              }}
              flow-children="horizontal"
            >
```

- [ ] **Step 2: Build and verify no errors**

```bash
pnpm run build
```

Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add src/components/QueueView.tsx
git commit -m "fix: extend queue item rows edge-to-edge"
```

---

## Task 5: Fix search spacing (SearchView)

**Files:** Modify `src/components/SearchView.tsx`

**Context:** The `TextField` and Search `ButtonItem` are each wrapped in `PanelSectionRow` inside `PanelSection`, giving them a double inset. Remove the `PanelSectionRow` wrappers from both and instead wrap each in a `div` with `margin: '0 -16px'` to go edge-to-edge. The `PanelSection` title ("Search") stays as-is.

- [ ] **Step 1: Replace the Search PanelSection content**

Find the Search `PanelSection` (lines 32–46) and replace the two `PanelSectionRow`-wrapped items:

```tsx
      <PanelSection title="Search">
        <div style={{ margin: '0 -16px' }}>
          <TextField
            label="Search YouTube Music"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') void handleSearch(); }}
          />
        </div>
        <div style={{ margin: '0 -16px' }}>
          <ButtonItem
            layout="below"
            onClick={() => { void handleSearch(); }}
            disabled={searching || !query.trim()}
          >
            {searching ? 'Searching...' : 'Search'}
          </ButtonItem>
        </div>
      </PanelSection>
```

- [ ] **Step 2: Build and verify no errors**

```bash
pnpm run build
```

Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add src/components/SearchView.tsx
git commit -m "fix: extend search input and button edge-to-edge"
```

---

## Task 6: Package and verify

**Files:** `youtube-music.zip` (output artifact)

- [ ] **Step 1: Build final artifact**

```bash
pnpm run build
```

- [ ] **Step 2: Package into installable zip**

```bash
powershell -Command "Remove-Item -Force youtube-music.zip -ErrorAction SilentlyContinue; New-Item -ItemType Directory -Path 'youtube-music-pkg/youtube-music' -Force | Out-Null; Copy-Item -Path 'dist' -Destination 'youtube-music-pkg/youtube-music/dist' -Recurse; Copy-Item -Path 'plugin.json','main.py','package.json' -Destination 'youtube-music-pkg/youtube-music/'; Compress-Archive -Path 'youtube-music-pkg/youtube-music' -DestinationPath 'youtube-music.zip'; Remove-Item -Recurse -Force 'youtube-music-pkg'"
```

- [ ] **Step 3: Verify zip structure**

```bash
powershell -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::OpenRead('youtube-music.zip').Entries | Select-Object FullName"
```

Expected output:
```
youtube-music/main.py
youtube-music/package.json
youtube-music/plugin.json
youtube-music/dist/index.js
youtube-music/dist/index.js.map
```

- [ ] **Step 4: Commit zip**

```bash
git add youtube-music.zip
git commit -m "build: package spacing fixes release"
```
