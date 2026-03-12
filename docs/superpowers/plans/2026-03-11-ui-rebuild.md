# UI Rebuild — Drop PanelSection/PanelSectionRow Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all `PanelSection`/`PanelSectionRow` layout wrappers with a custom `Section` component backed by plain divs, eliminating all spacing/edge-to-edge issues permanently.

**Architecture:** Create `src/components/Section.tsx` (plain div + optional styled title). Update every view file to swap `PanelSection` → `Section` and remove `PanelSectionRow` wrappers. Clean up `index.tsx` to remove the now-unnecessary `quickAccessControlsClasses` CSS injection. All leaf `@decky/ui` components (`SliderField`, `ToggleField`, `TextField`, `ButtonItem`, `DialogButton`, `Focusable`) are kept unchanged. The `Focusable flow-children="horizontal"` + `DialogButton` button row pattern (from MusicControl) is preserved exactly.

**Tech Stack:** TypeScript, React, `@decky/ui` (`ButtonItem`, `DialogButton`, `Field`, `Focusable`, `SliderField`, `Tabs`, `TextField`, `ToggleField`, `gamepadTabbedPageClasses`, `staticClasses`), Rollup build via `pnpm run build`.

---

## Files to modify/create

- **Create:** `src/components/Section.tsx` — custom layout wrapper replacing PanelSection/PanelSectionRow
- **Modify:** `src/components/PlayerView.tsx` — swap to Section, keep Focusable+DialogButton rows
- **Modify:** `src/components/QueueView.tsx` — swap to Section, keep Focusable+DialogButton rows
- **Modify:** `src/components/SearchView.tsx` — swap to Section
- **Modify:** `src/components/NotConnectedView.tsx` — swap to Section
- **Modify:** `src/components/AuthTokenView.tsx` — swap to Section
- **Modify:** `src/index.tsx` — remove quickAccessControlsClasses import + CSS injection rules, swap fallback tab nav to Section

---

## Task 1: Create Section component

**Files:** Create `src/components/Section.tsx`

**Context:** This is the only new file. It replaces `PanelSection`/`PanelSectionRow` entirely. Children render directly into a plain div with no horizontal padding — so `ButtonItem`, `SliderField`, `ToggleField`, `TextField`, and `Focusable` rows all get the full panel width naturally. The optional title is styled to match Steam's native section headers: small, uppercase, grey, 16px side padding.

- [ ] **Step 1: Create the file**

Write `src/components/Section.tsx` with exactly this content:

```tsx
import type { ReactNode } from 'react';

interface SectionProps {
  title?: string;
  children: ReactNode;
}

export const Section = ({ title, children }: SectionProps) => (
  <div>
    {title && (
      <div style={{
        padding: '12px 16px 4px',
        fontSize: '11px',
        fontWeight: 'bold',
        textTransform: 'uppercase' as const,
        color: 'var(--gpSystemLighterGrey)',
        letterSpacing: '0.04em',
      }}>
        {title}
      </div>
    )}
    {children}
  </div>
);
```

- [ ] **Step 2: Build and verify**

```bash
pnpm run build
```

Expected: `created dist in Xs` with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/Section.tsx
git commit -m "feat: add Section component to replace PanelSection/PanelSectionRow"
```

---

## Task 2: Rebuild PlayerView

**Files:** Modify `src/components/PlayerView.tsx`

**Context:** Replace every `PanelSection`/`PanelSectionRow` with `Section` and bare children. The `Focusable flow-children="horizontal"` + `DialogButton` rows (MusicControl pattern) are preserved exactly — only their surrounding wrappers change. The `rowBtnFirst`/`rowBtn` style constants stay identical. Sliders render directly inside `Section` with no wrapper div needed. Track info text gets `padding: '8px 16px'` since it's centered text that needs breathing room (not a component with built-in spacing).

- [ ] **Step 1: Replace the entire file**

Write `src/components/PlayerView.tsx` with exactly this content:

```tsx
import { ButtonItem, DialogButton, Focusable, SliderField, ToggleField } from '@decky/ui';
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
import { Section } from './Section';

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
        <Section>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
            <img
              src={albumArt}
              alt="Album art"
              style={{ width: '100%', maxWidth: '180px', borderRadius: '8px' }}
            />
          </div>
        </Section>
      )}

      {/* Track info */}
      <Section>
        <div style={{ textAlign: 'center', padding: '8px 16px' }}>
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
      </Section>

      {/* Prev / Play / Next */}
      <Section title="Controls">
        {DialogButton ? (
          <>
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
            <Focusable
              style={{ display: 'flex', marginTop: '4px', marginBottom: '4px' }}
              flow-children="horizontal"
            >
              <DialogButton style={rowBtnFirst} onClick={() => { void like(); }}>👍 Like</DialogButton>
              <DialogButton style={rowBtn} onClick={() => { void dislike(); }}>👎 Dislike</DialogButton>
            </Focusable>
          </>
        ) : (
          <>
            <ButtonItem onClick={() => { void previous(); }}>⏮ Previous</ButtonItem>
            <ButtonItem onClick={() => { void togglePlay(); }}>{isPlaying ? '⏸ Pause' : '▶ Play'}</ButtonItem>
            <ButtonItem onClick={() => { void next(); }}>⏭ Next</ButtonItem>
            <ButtonItem onClick={() => { void like(); }}>👍 Like</ButtonItem>
            <ButtonItem onClick={() => { void dislike(); }}>👎 Dislike</ButtonItem>
          </>
        )}
      </Section>

      {/* Volume */}
      <Section title="Volume">
        <SliderField
          label={muted ? 'Muted' : `${Math.round(volume)}%`}
          value={muted ? 0 : volume}
          min={0}
          max={100}
          step={1}
          onChange={(val) => { void setVolume(val); }}
          showValue={false}
        />
        <ButtonItem onClick={() => { void toggleMute(); }}>
          {muted ? '🔇 Unmute' : '🔊 Mute'}
        </ButtonItem>
      </Section>

      {/* Playback options */}
      <Section title="Playback">
        <ToggleField
          label="Shuffle"
          checked={isShuffled}
          onChange={() => { void shuffle(); }}
        />
        <ButtonItem onClick={() => { void switchRepeat(REPEAT_NEXT[repeat] ?? 1); }}>
          {REPEAT_LABELS[repeat] ?? 'Repeat: Off'}
        </ButtonItem>
      </Section>
    </>
  );
};
```

- [ ] **Step 2: Build and verify**

```bash
pnpm run build
```

Expected: clean build, no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/PlayerView.tsx
git commit -m "refactor: rebuild PlayerView with Section, remove PanelSection/PanelSectionRow"
```

---

## Task 3: Rebuild QueueView

**Files:** Modify `src/components/QueueView.tsx`

**Context:** Replace `PanelSection`/`PanelSectionRow` with `Section` and bare children. The `Focusable flow-children="horizontal"` + `DialogButton` queue item rows are preserved exactly. The `Field` fallback (when `DialogButton` is unavailable) loses its `PanelSectionRow` wrapper — `Field` renders directly inside `Section`.

- [ ] **Step 1: Replace the entire file**

Write `src/components/QueueView.tsx` with exactly this content:

```tsx
import { ButtonItem, DialogButton, Field, Focusable } from '@decky/ui';
import { useEffect, useState } from 'react';
import { clearQueue, getQueue, removeFromQueue, setQueueIndex } from '../services/apiClient';
import type { QueueItem, QueueResponse } from '../types';
import { Section } from './Section';

const getRenderer = (item: QueueItem) =>
  item.playlistPanelVideoRenderer ??
  item.playlistPanelVideoWrapperRenderer?.primaryRenderer?.playlistPanelVideoRenderer;

export const QueueView = () => {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadQueue = async (silent = false) => {
    if (!silent) setLoading(true);
    const data: QueueResponse | null = await getQueue();
    setQueue(data?.items ?? []);
    if (!silent) setLoading(false);
  };

  useEffect(() => { void loadQueue(); }, []);

  const handleJump = async (index: number) => {
    await setQueueIndex(index);
    void loadQueue(true);
  };

  const handleRemove = async (index: number) => {
    await removeFromQueue(index);
    void loadQueue(true);
  };

  const handleClear = async () => {
    await clearQueue();
    setQueue([]);
  };

  if (loading) {
    return (
      <Section>
        <div style={{ padding: '16px', color: 'var(--gpSystemLighterGrey)', fontSize: '12px' }}>
          Loading queue...
        </div>
      </Section>
    );
  }

  if (queue.length === 0) {
    return (
      <Section title="Queue">
        <div style={{ padding: '8px 16px', color: 'var(--gpSystemLighterGrey)', fontSize: '12px' }}>
          Queue is empty
        </div>
      </Section>
    );
  }

  return (
    <Section title="Queue">
      <ButtonItem onClick={() => { void handleClear(); }}>Clear Queue</ButtonItem>

      {queue.map((item, index) => {
        const r = getRenderer(item);
        const title = r?.title?.runs?.[0]?.text ?? 'Unknown';
        const artist = r?.shortBylineText?.runs?.[0]?.text ?? '';
        const isSelected = r?.selected ?? false;

        if (DialogButton) {
          return (
            <Focusable
              key={index}
              style={{ display: 'flex', alignItems: 'center', marginTop: '2px', marginBottom: '2px' }}
              flow-children="horizontal"
            >
              <DialogButton
                style={{
                  flex: 1,
                  textAlign: 'left',
                  height: 'auto',
                  minHeight: '40px',
                  padding: '4px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
                onClick={() => { void handleJump(index); }}
              >
                <div style={{ fontWeight: isSelected ? 'bold' : 'normal', fontSize: '13px' }}>{title}</div>
                {artist && (
                  <div style={{ fontSize: '11px', color: 'var(--gpSystemLighterGrey)', marginTop: '2px' }}>
                    {artist}
                  </div>
                )}
              </DialogButton>
              <DialogButton
                onClick={() => { void handleRemove(index); }}
                style={{
                  width: '28px',
                  height: '28px',
                  minWidth: '0',
                  padding: '0',
                  marginLeft: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                ✕
              </DialogButton>
            </Focusable>
          );
        }

        // Fallback when DialogButton unavailable
        return (
          <Field
            key={index}
            label={<span style={{ fontWeight: isSelected ? 'bold' : 'normal' }}>{title}</span>}
            description={artist || undefined}
            onActivate={() => { void handleJump(index); }}
            onClick={() => { void handleJump(index); }}
            highlightOnFocus
            focusable
            bottomSeparator="none"
          />
        );
      })}
    </Section>
  );
};
```

- [ ] **Step 2: Build and verify**

```bash
pnpm run build
```

Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add src/components/QueueView.tsx
git commit -m "refactor: rebuild QueueView with Section, remove PanelSection/PanelSectionRow"
```

---

## Task 4: Rebuild SearchView

**Files:** Modify `src/components/SearchView.tsx`

**Context:** Replace `PanelSection`/`PanelSectionRow` with `Section`. `TextField` and `ButtonItem` render directly inside `Section` — no wrapper divs needed. Result `ButtonItem`s also render directly (no `PanelSectionRow` per item).

- [ ] **Step 1: Replace the entire file**

Write `src/components/SearchView.tsx` with exactly this content:

```tsx
import { ButtonItem, TextField } from '@decky/ui';
import { useState } from 'react';
import { addToQueue, clearQueue, search, setQueueIndex } from '../services/apiClient';
import type { SearchResultItem } from '../types';
import { Section } from './Section';

export const SearchView = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    const data = await search(query.trim());
    // Filter to songs only
    setResults(data.filter((r) => !r.resultType || r.resultType === 'song').slice(0, 20));
    setSearched(true);
    setSearching(false);
  };

  const handlePlay = async (item: SearchResultItem) => {
    if (!item.videoId) return;
    // Clear queue, add song at front, play it
    await clearQueue();
    await addToQueue(item.videoId, 'INSERT_AT_BEGINNING');
    await setQueueIndex(0);
  };

  return (
    <>
      <Section title="Search">
        <TextField
          label="Search YouTube Music"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') void handleSearch(); }}
        />
        <ButtonItem layout="below" onClick={() => { void handleSearch(); }} disabled={searching || !query.trim()}>
          {searching ? 'Searching...' : 'Search'}
        </ButtonItem>
      </Section>

      {searched && results.length === 0 && (
        <Section>
          <div style={{ padding: '8px 16px', color: 'var(--gpSystemLighterGrey)', fontSize: '12px' }}>
            No results found
          </div>
        </Section>
      )}

      {results.length > 0 && (
        <Section title="Results">
          {results.map((item, index) => (
            <ButtonItem
              key={index}
              layout="below"
              onClick={() => { void handlePlay(item); }}
            >
              <div style={{ textAlign: 'left', width: '100%' }}>
                <div style={{ fontWeight: 'bold', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.title ?? 'Unknown'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--gpSystemLighterGrey)' }}>
                  {item.artists?.map((a) => a.name).join(', ') ?? ''}
                </div>
              </div>
            </ButtonItem>
          ))}
        </Section>
      )}
    </>
  );
};
```

- [ ] **Step 2: Build and verify**

```bash
pnpm run build
```

Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add src/components/SearchView.tsx
git commit -m "refactor: rebuild SearchView with Section, remove PanelSection/PanelSectionRow"
```

---

## Task 5: Rebuild NotConnectedView and AuthTokenView

**Files:** Modify `src/components/NotConnectedView.tsx`, `src/components/AuthTokenView.tsx`

**Context:** Both are simple views used when the plugin can't reach the YouTube Music API. Replace `PanelSection`/`PanelSectionRow` with `Section`. Content (text divs, `TextField`, `ButtonItem`) renders directly inside `Section`.

- [ ] **Step 1: Replace NotConnectedView**

Write `src/components/NotConnectedView.tsx` with exactly this content:

```tsx
import { Section } from './Section';

export const NotConnectedView = () => (
  <Section title="YouTube Music">
    <div style={{ textAlign: 'center', padding: '16px', color: 'var(--gpSystemLighterGrey)' }}>
      <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎵</div>
      <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Not Connected</div>
      <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
        Open YouTube Music and enable the <strong>API Server</strong> plugin in its settings.
        The plugin will connect automatically.
      </div>
    </div>
  </Section>
);
```

- [ ] **Step 2: Replace AuthTokenView**

Write `src/components/AuthTokenView.tsx` with exactly this content:

```tsx
import { ButtonItem, TextField } from '@decky/ui';
import { useState } from 'react';
import { setToken } from '../services/apiClient';
import { disconnect, resetAndConnect } from '../services/websocketService';
import { Section } from './Section';

export const AuthTokenView = () => {
  const [token, setTokenInput] = useState('');

  const handleSave = () => {
    if (!token.trim()) return;
    setToken(token.trim());
    disconnect();
    setTimeout(resetAndConnect, 100);
  };

  return (
    <Section title="Authentication Required">
      <div style={{ padding: '8px 16px', fontSize: '12px', color: 'var(--gpSystemLighterGrey)' }}>
        The YouTube Music API server requires a token. Find it in the API Server plugin settings.
      </div>
      <TextField
        label="API Token"
        value={token}
        onChange={(e) => setTokenInput(e.target.value)}
      />
      <ButtonItem layout="below" onClick={handleSave} disabled={!token.trim()}>
        Save & Connect
      </ButtonItem>
    </Section>
  );
};
```

- [ ] **Step 3: Build and verify**

```bash
pnpm run build
```

Expected: clean build.

- [ ] **Step 4: Commit**

```bash
git add src/components/NotConnectedView.tsx src/components/AuthTokenView.tsx
git commit -m "refactor: rebuild NotConnectedView and AuthTokenView with Section"
```

---

## Task 6: Clean up index.tsx

**Files:** Modify `src/index.tsx`

**Context:** Remove `quickAccessControlsClasses` from the import (no longer needed). Remove the three CSS injection rules for `PanelSection`, `PanelSectionTitle`, and `PanelSectionRow` — keep only the sticky tab bar rule for `gamepadTabbedPageClasses.TabHeaderRowWrapper`. The `<style>` block becomes a single conditional. Also update the fallback tab navigation (when `!Tabs`) to use `Section` + `ButtonItem` directly instead of `PanelSection`/`PanelSectionRow`. Remove `PanelSection` and `PanelSectionRow` from the `@decky/ui` import.

- [ ] **Step 1: Replace the entire file**

Write `src/index.tsx` with exactly this content:

```tsx
import { ButtonItem, Tabs, gamepadTabbedPageClasses, staticClasses } from '@decky/ui';
import { definePlugin } from '@decky/api';
import { useEffect, useRef, useState } from 'react';
import { FaMusic } from 'react-icons/fa';

import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { NotConnectedView } from './components/NotConnectedView';
import { AuthTokenView } from './components/AuthTokenView';
import { PlayerView } from './components/PlayerView';
import { QueueView } from './components/QueueView';
import { SearchView } from './components/SearchView';
import { Section } from './components/Section';

const getScrollParent = (el: HTMLElement | null): HTMLElement => {
  if (!el || el === document.body) return document.body;
  const style = window.getComputedStyle(el);
  if (/scroll|auto/.test(style.overflow + style.overflowY)) return el;
  return getScrollParent(el.parentElement);
};

const TAB_BAR_HEIGHT = 40;
const TAB_PAD: React.CSSProperties = { paddingTop: `${TAB_BAR_HEIGHT}px` };

const PluginContent = () => {
  const { connected, authRequired } = usePlayer();
  const [activeTab, setActiveTab] = useState<string>('player');
  const containerRef = useRef<HTMLDivElement>(null);
  // 52px: estimated fallback (plugin title bar height) if layout hasn't measured yet
  const [stickyTop, setStickyTop] = useState(52);

  useEffect(() => {
    if (!containerRef.current) return;
    const scrollParent = getScrollParent(containerRef.current);
    const parentRect = scrollParent.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    setStickyTop(Math.round(containerRect.top - parentRect.top));
  }, []);

  if (!connected) return <NotConnectedView />;
  if (authRequired) return <AuthTokenView />;

  if (!Tabs) {
    return (
      <>
        <Section>
          {(['player', 'queue', 'search'] as const).map((id) => (
            <ButtonItem key={id} onClick={() => setActiveTab(id)}>
              {activeTab === id
                ? `▶ ${id.charAt(0).toUpperCase() + id.slice(1)}`
                : id.charAt(0).toUpperCase() + id.slice(1)}
            </ButtonItem>
          ))}
        </Section>
        {activeTab === 'player' && <PlayerView />}
        {activeTab === 'queue' && <QueueView />}
        {activeTab === 'search' && <SearchView />}
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
          { id: 'player', title: 'Player', content: <div style={TAB_PAD}><PlayerView /></div> },
          { id: 'queue', title: 'Queue', content: <div style={TAB_PAD}><QueueView /></div> },
          { id: 'search', title: 'Search', content: <div style={TAB_PAD}><SearchView /></div> },
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

- [ ] **Step 2: Build and verify**

```bash
pnpm run build
```

Expected: clean build, no errors.

- [ ] **Step 3: Commit**

```bash
git add src/index.tsx
git commit -m "refactor: remove quickAccessControlsClasses CSS injection, use Section in fallback nav"
```

---

## Task 7: Package and verify

**Files:** `youtube-music.zip`

- [ ] **Step 1: Final build**

```bash
pnpm run build
```

- [ ] **Step 2: Package**

```bash
powershell -Command "Remove-Item -Force youtube-music.zip -ErrorAction SilentlyContinue; New-Item -ItemType Directory -Path 'youtube-music-pkg/youtube-music' -Force | Out-Null; Copy-Item -Path 'dist' -Destination 'youtube-music-pkg/youtube-music/dist' -Recurse; Copy-Item -Path 'plugin.json','main.py','package.json' -Destination 'youtube-music-pkg/youtube-music/'; Compress-Archive -Path 'youtube-music-pkg/youtube-music' -DestinationPath 'youtube-music.zip'; Remove-Item -Recurse -Force 'youtube-music-pkg'"
```

- [ ] **Step 3: Verify zip structure**

```bash
powershell -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::OpenRead('youtube-music.zip').Entries | Select-Object FullName"
```

Expected:
```
youtube-music/dist/index.js
youtube-music/dist/index.js.map
youtube-music/main.py
youtube-music/package.json
youtube-music/plugin.json
```

- [ ] **Step 4: Commit**

```bash
git add youtube-music.zip
git commit -m "build: package UI rebuild release"
```
