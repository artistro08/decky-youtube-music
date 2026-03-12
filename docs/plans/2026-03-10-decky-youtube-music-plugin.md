# Decky YouTube Music Plugin — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Decky Loader sidebar plugin that controls a running `th-ch/youtube-music` (Pear) instance via its built-in REST API and WebSocket.

**Architecture:** Pure TypeScript/React frontend — no Python backend. The plugin connects to `http://localhost:26538/api/v1` (REST) and `ws://localhost:26538/api/v1/ws` (WebSocket). WebSocket drives all live state; REST calls are fire-and-forget for controls. Auth token (if needed) is stored in `localStorage`.

**Tech Stack:** TypeScript 5, React 19, @decky/ui ^4.11, @decky/api ^1.1.3, react-icons ^5, rollup, pnpm

---

## Prerequisites

Before starting, ensure:
- `pnpm` is installed (`npm install -g pnpm`)
- The `th-ch/youtube-music` app is installed and the **API Server** plugin is enabled in its settings (port 26538)
- Node.js 18+ is installed

---

### Task 1: Scaffold project from template

**Files:**
- Create: `package.json`, `plugin.json`, `tsconfig.json`, `rollup.config.js`, `src/index.tsx`, `main.py`

**Step 1: Clone the decky plugin template into the project directory**

```bash
# Run from the PARENT of your project directory (one level up)
git clone https://github.com/SteamDeckHomebrew/decky-plugin-template decky-youtube-music
cd decky-youtube-music
```

If the directory already exists and has files from the clone, skip the clone and just `cd` into it.

**Step 2: Install dependencies**

```bash
pnpm install
```

Expected: `node_modules/` created, no errors.

**Step 3: Verify the build works**

```bash
pnpm run build
```

Expected: `dist/index.js` created. TypeScript compiles with no errors.

**Step 4: Update `plugin.json`**

Replace the contents of `plugin.json` with:

```json
{
  "name": "YouTube Music",
  "author": "Your Name",
  "flags": ["debug"],
  "api_version": 1,
  "publish": {
    "tags": ["music", "youtube"],
    "description": "Control YouTube Music (th-ch/youtube-music) from your Steam Deck sidebar.",
    "image": ""
  }
}
```

**Step 5: Initialize git**

```bash
git init
git add .
git commit -m "feat: scaffold from decky-plugin-template"
```

---

### Task 2: Define TypeScript types

**Files:**
- Create: `src/types.ts`

**Step 1: Create `src/types.ts`**

```typescript
// Song info returned by GET /api/v1/song and WebSocket VIDEO_CHANGED
export interface SongInfo {
  title?: string;
  artist?: string;
  album?: string;
  albumArt?: string;
  videoId?: string;
  isPaused?: boolean;
  elapsedSeconds?: number;
  songDuration?: number;
  url?: string;
  playlistId?: string;
}

// Queue item structure from GET /api/v1/queue
export interface QueueItem {
  playlistPanelVideoRenderer?: {
    title?: { runs?: { text: string }[] };
    shortBylineText?: { runs?: { text: string }[] };
    thumbnail?: { thumbnails?: { url: string }[] };
    videoId?: string;
    selected?: boolean;
    lengthText?: { runs?: { text: string }[] };
  };
  playlistPanelVideoWrapperRenderer?: {
    primaryRenderer?: {
      playlistPanelVideoRenderer?: QueueItem['playlistPanelVideoRenderer'];
    };
  };
}

export interface QueueResponse {
  items?: QueueItem[];
}

// Search result item
export interface SearchResultItem {
  videoId?: string;
  title?: string;
  artists?: { name: string }[];
  album?: { name: string };
  duration?: string;
  thumbnails?: { url: string; width: number; height: number }[];
  resultType?: string;
}

// WebSocket message types
export type RepeatMode = 'NONE' | 'ALL' | 'ONE';

export interface PlayerState {
  song?: SongInfo;
  isPlaying: boolean;
  muted: boolean;
  position: number;
  volume: number;
  repeat: RepeatMode;
  shuffle: boolean;
  connected: boolean;
  authRequired: boolean;
}

export type WSMessageType =
  | 'PLAYER_INFO'
  | 'VIDEO_CHANGED'
  | 'PLAYER_STATE_CHANGED'
  | 'POSITION_CHANGED'
  | 'VOLUME_CHANGED'
  | 'REPEAT_CHANGED'
  | 'SHUFFLE_CHANGED';

export interface WSMessage {
  type: WSMessageType;
  song?: SongInfo;
  isPlaying?: boolean;
  muted?: boolean;
  position?: number;
  volume?: number;
  repeat?: RepeatMode;
  shuffle?: boolean;
}
```

**Step 2: Build to verify no type errors**

```bash
pnpm run build
```

Expected: Builds successfully.

**Step 3: Commit**

```bash
git add src/types.ts
git commit -m "feat: add TypeScript types for YouTube Music API"
```

---

### Task 3: Build the API client

**Files:**
- Create: `src/services/apiClient.ts`

**Step 1: Create `src/services/apiClient.ts`**

```typescript
import { toaster } from '@decky/api';
import type { QueueResponse, SearchResultItem, SongInfo } from '../types';

const BASE_URL = 'http://localhost:26538/api/v1';
const TOKEN_KEY = 'ytmusic_api_token';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = (): void => localStorage.removeItem(TOKEN_KEY);

const headers = (): Record<string, string> => {
  const token = getToken();
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
};

// Returns true on success, false on 401 (triggers auth prompt), throws on other errors
const post = async (path: string, body?: object): Promise<boolean> => {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: headers(),
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 401) return false;
    return true;
  } catch {
    return true; // network error, not auth error
  }
};

const get = async <T>(path: string): Promise<T | null> => {
  try {
    const res = await fetch(`${BASE_URL}${path}`, { headers: headers() });
    if (res.status === 401) return null;
    if (res.status === 204) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
};

const del = async (path: string): Promise<void> => {
  try {
    await fetch(`${BASE_URL}${path}`, { method: 'DELETE', headers: headers() });
  } catch {
    // silent
  }
};

const patch = async (path: string, body: object): Promise<void> => {
  try {
    await fetch(`${BASE_URL}${path}`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify(body),
    });
  } catch {
    // silent
  }
};

// Playback controls
export const play = () => post('/play');
export const pause = () => post('/pause');
export const togglePlay = () => post('/toggle-play');
export const next = () => post('/next');
export const previous = () => post('/previous');
export const seekTo = (seconds: number) => post('/seek-to', { seconds });
export const setVolume = (volume: number) => post('/volume', { volume });
export const toggleMute = () => post('/toggle-mute');
export const shuffle = () => post('/shuffle');
export const switchRepeat = (iteration: number) => post('/switch-repeat', { iteration });
export const like = () => post('/like');
export const dislike = () => post('/dislike');

// Song & state
export const getSongInfo = () => get<SongInfo>('/song');
export const getVolume = () => get<{ state: number; isMuted: boolean }>('/volume');

// Queue
export const getQueue = () => get<QueueResponse>('/queue');
export const addToQueue = (videoId: string, insertPosition?: string) =>
  post('/queue', { videoId, insertPosition });
export const removeFromQueue = (index: number) => del(`/queue/${index}`);
export const clearQueue = () => del('/queue');
export const setQueueIndex = (index: number) => patch('/queue', { index });

// Search
export const search = async (query: string): Promise<SearchResultItem[]> => {
  try {
    const res = await fetch(`${BASE_URL}/search`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ query }),
    });
    if (!res.ok) {
      if (res.status !== 401) toaster.toast({ title: 'Search failed', body: `Status ${res.status}` });
      return [];
    }
    const data = await res.json() as { results?: SearchResultItem[] } | SearchResultItem[];
    return Array.isArray(data) ? data : (data.results ?? []);
  } catch {
    toaster.toast({ title: 'Search error', body: 'Could not reach YouTube Music' });
    return [];
  }
};
```

**Step 2: Build to verify**

```bash
pnpm run build
```

Expected: No TypeScript errors.

**Step 3: Commit**

```bash
git add src/services/apiClient.ts
git commit -m "feat: add REST API client for YouTube Music"
```

---

### Task 4: Build the WebSocket service

**Files:**
- Create: `src/services/websocketService.ts`

**Step 1: Create `src/services/websocketService.ts`**

```typescript
import type { PlayerState, WSMessage, WSMessageType } from '../types';
import { getToken } from './apiClient';

const WS_URL = 'ws://localhost:26538/api/v1/ws';
const RECONNECT_DELAY_MS = 5000;

type StateListener = (state: Partial<PlayerState>) => void;

let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let listeners: StateListener[] = [];
let destroyed = false;

export const addStateListener = (fn: StateListener): (() => void) => {
  listeners.push(fn);
  return () => { listeners = listeners.filter((l) => l !== fn); };
};

const notify = (state: Partial<PlayerState>) =>
  listeners.forEach((l) => l(state));

const buildUrl = (): string => {
  const token = getToken();
  return token ? `${WS_URL}?token=${encodeURIComponent(token)}` : WS_URL;
};

export const connect = (): void => {
  if (destroyed) return;
  if (socket && socket.readyState === WebSocket.OPEN) return;

  socket = new WebSocket(buildUrl());

  socket.onopen = () => {
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
    notify({ connected: true, authRequired: false });
  };

  socket.onmessage = (event: MessageEvent) => {
    try {
      const msg = JSON.parse(event.data as string) as WSMessage;
      handleMessage(msg);
    } catch {
      // ignore malformed messages
    }
  };

  socket.onclose = () => {
    notify({ connected: false });
    if (!destroyed) {
      reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
    }
  };

  socket.onerror = () => {
    socket?.close();
  };
};

export const disconnect = (): void => {
  destroyed = true;
  if (reconnectTimer) clearTimeout(reconnectTimer);
  socket?.close();
  socket = null;
};

const handleMessage = (msg: WSMessage): void => {
  const type = msg.type as WSMessageType;

  switch (type) {
    case 'PLAYER_INFO':
      notify({
        song: msg.song,
        isPlaying: msg.isPlaying ?? false,
        muted: msg.muted ?? false,
        position: msg.position ?? 0,
        volume: msg.volume ?? 100,
        repeat: msg.repeat ?? 'NONE',
        shuffle: msg.shuffle ?? false,
        connected: true,
        authRequired: false,
      });
      break;
    case 'VIDEO_CHANGED':
      notify({ song: msg.song, position: 0 });
      break;
    case 'PLAYER_STATE_CHANGED':
      notify({ isPlaying: msg.isPlaying ?? false, position: msg.position ?? 0 });
      break;
    case 'POSITION_CHANGED':
      notify({ position: msg.position ?? 0 });
      break;
    case 'VOLUME_CHANGED':
      notify({ volume: msg.volume ?? 100, muted: msg.muted ?? false });
      break;
    case 'REPEAT_CHANGED':
      notify({ repeat: msg.repeat ?? 'NONE' });
      break;
    case 'SHUFFLE_CHANGED':
      notify({ shuffle: msg.shuffle ?? false });
      break;
  }
};
```

**Step 2: Build to verify**

```bash
pnpm run build
```

Expected: No errors.

**Step 3: Commit**

```bash
git add src/services/websocketService.ts
git commit -m "feat: add WebSocket service with auto-reconnect"
```

---

### Task 5: Build the Player state context

**Files:**
- Create: `src/context/PlayerContext.tsx`

**Step 1: Create `src/context/PlayerContext.tsx`**

```tsx
import { createContext, useContext, useEffect, useReducer, type FC, type ReactNode } from 'react';
import type { PlayerState } from '../types';
import { addStateListener, connect, disconnect } from '../services/websocketService';

const defaultState: PlayerState = {
  song: undefined,
  isPlaying: false,
  muted: false,
  position: 0,
  volume: 100,
  repeat: 'NONE',
  shuffle: false,
  connected: false,
  authRequired: false,
};

type Action = { type: 'UPDATE'; payload: Partial<PlayerState> };

const reducer = (state: PlayerState, action: Action): PlayerState => {
  if (action.type === 'UPDATE') return { ...state, ...action.payload };
  return state;
};

const PlayerContext = createContext<PlayerState>(defaultState);

export const PlayerProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, defaultState);

  useEffect(() => {
    connect();
    const remove = addStateListener((partial) =>
      dispatch({ type: 'UPDATE', payload: partial }),
    );
    return () => {
      remove();
      disconnect();
    };
  }, []);

  return <PlayerContext.Provider value={state}>{children}</PlayerContext.Provider>;
};

export const usePlayer = (): PlayerState => useContext(PlayerContext);
```

**Step 2: Build to verify**

```bash
pnpm run build
```

Expected: No errors.

**Step 3: Commit**

```bash
git add src/context/PlayerContext.tsx
git commit -m "feat: add PlayerContext with WebSocket-driven state"
```

---

### Task 6: Build the Not Connected view

**Files:**
- Create: `src/components/NotConnectedView.tsx`

**Step 1: Create `src/components/NotConnectedView.tsx`**

```tsx
import { PanelSection, PanelSectionRow } from '@decky/ui';

export const NotConnectedView = () => (
  <PanelSection title="YouTube Music">
    <PanelSectionRow>
      <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--gpSystemLighterGrey)' }}>
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎵</div>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Not Connected</div>
        <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
          Open YouTube Music and enable the <strong>API Server</strong> plugin in its settings.
          The plugin will connect automatically.
        </div>
      </div>
    </PanelSectionRow>
  </PanelSection>
);
```

**Step 2: Build to verify**

```bash
pnpm run build
```

Expected: No errors.

**Step 3: Commit**

```bash
git add src/components/NotConnectedView.tsx
git commit -m "feat: add NotConnectedView component"
```

---

### Task 7: Build the Auth Token view

**Files:**
- Create: `src/components/AuthTokenView.tsx`

**Step 1: Create `src/components/AuthTokenView.tsx`**

```tsx
import { ButtonItem, PanelSection, PanelSectionRow, TextField } from '@decky/ui';
import { useState } from 'react';
import { setToken } from '../services/apiClient';
import { connect, disconnect } from '../services/websocketService';

export const AuthTokenView = () => {
  const [token, setTokenInput] = useState('');

  const handleSave = () => {
    if (!token.trim()) return;
    setToken(token.trim());
    // reconnect WebSocket with new token
    disconnect();
    // allow disconnect to finalize before reconnecting
    setTimeout(() => {
      // reset destroyed flag by re-importing connect
      connect();
    }, 100);
  };

  return (
    <PanelSection title="Authentication Required">
      <PanelSectionRow>
        <div style={{ fontSize: '12px', marginBottom: '8px', color: 'var(--gpSystemLighterGrey)' }}>
          The YouTube Music API server requires a token. Find it in the API Server plugin settings.
        </div>
      </PanelSectionRow>
      <PanelSectionRow>
        <TextField
          label="API Token"
          value={token}
          onChange={(e) => setTokenInput(e.target.value)}
        />
      </PanelSectionRow>
      <PanelSectionRow>
        <ButtonItem layout="below" onClick={handleSave} disabled={!token.trim()}>
          Save & Connect
        </ButtonItem>
      </PanelSectionRow>
    </PanelSection>
  );
};
```

> **Note on `disconnect`/`connect` re-import:** The `websocketService` uses a module-level `destroyed` flag. After saving the token, call `disconnect()` then `connect()`. You may need to export a `resetAndConnect()` helper from `websocketService.ts` to reset the `destroyed` flag before reconnecting. Add this to `websocketService.ts`:
>
> ```typescript
> export const resetAndConnect = (): void => {
>   destroyed = false;
>   connect();
> };
> ```
>
> Then update `AuthTokenView.tsx` to import and call `resetAndConnect()` instead of `connect()`.

**Step 2: Add `resetAndConnect` to `websocketService.ts`**

Open `src/services/websocketService.ts` and add after the `disconnect` function:

```typescript
export const resetAndConnect = (): void => {
  destroyed = false;
  connect();
};
```

Then update the import in `AuthTokenView.tsx`:

```tsx
import { connect, disconnect, resetAndConnect } from '../services/websocketService';
```

And update `handleSave`:

```tsx
const handleSave = () => {
  if (!token.trim()) return;
  setToken(token.trim());
  disconnect();
  setTimeout(resetAndConnect, 100);
};
```

**Step 3: Build to verify**

```bash
pnpm run build
```

Expected: No errors.

**Step 4: Commit**

```bash
git add src/components/AuthTokenView.tsx src/services/websocketService.ts
git commit -m "feat: add AuthTokenView and resetAndConnect helper"
```

---

### Task 8: Build the Player view

**Files:**
- Create: `src/components/PlayerView.tsx`

**Step 1: Create `src/components/PlayerView.tsx`**

```tsx
import { ButtonItem, PanelSection, PanelSectionRow, SliderField, ToggleField } from '@decky/ui';
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

const REPEAT_LABELS: Record<string, string> = { NONE: 'Repeat: Off', ALL: 'Repeat: All', ONE: 'Repeat: One' };
const REPEAT_ITERATIONS: Record<string, number> = { NONE: 1, ALL: 1, ONE: 1 };

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
                style={{ width: '100%', maxWidth: '200px', borderRadius: '8px' }}
              />
            </div>
          </PanelSectionRow>
        </PanelSection>
      )}

      {/* Track info */}
      <PanelSection>
        <PanelSectionRow>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {title}
            </div>
            {artist && (
              <div style={{ fontSize: '12px', color: 'var(--gpSystemLighterGrey)', marginTop: '2px' }}>
                {artist}
              </div>
            )}
          </div>
        </PanelSectionRow>

        {/* Seek bar */}
        {duration > 0 && (
          <PanelSectionRow>
            <SliderField
              label=""
              value={position}
              min={0}
              max={duration}
              step={1}
              onChange={(val) => seekTo(val)}
              showValue={false}
            />
          </PanelSectionRow>
        )}
      </PanelSection>

      {/* Playback controls */}
      <PanelSection title="Controls">
        <PanelSectionRow>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <ButtonItem layout="below" onClick={() => previous()} style={{ flex: 1 }}>⏮</ButtonItem>
            <ButtonItem layout="below" onClick={() => togglePlay()} style={{ flex: 1 }}>
              {isPlaying ? '⏸' : '▶'}
            </ButtonItem>
            <ButtonItem layout="below" onClick={() => next()} style={{ flex: 1 }}>⏭</ButtonItem>
          </div>
        </PanelSectionRow>

        {/* Like / Dislike */}
        <PanelSectionRow>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <ButtonItem layout="below" onClick={() => like()} style={{ flex: 1 }}>👍</ButtonItem>
            <ButtonItem layout="below" onClick={() => dislike()} style={{ flex: 1 }}>👎</ButtonItem>
          </div>
        </PanelSectionRow>
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
            onChange={(val) => setVolume(val)}
            showValue={false}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem layout="below" onClick={() => toggleMute()}>
            {muted ? '🔇 Unmute' : '🔊 Mute'}
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>

      {/* Shuffle & Repeat */}
      <PanelSection title="Playback Mode">
        <PanelSectionRow>
          <ToggleField
            label="Shuffle"
            checked={isShuffled}
            onChange={() => shuffle()}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem layout="below" onClick={() => switchRepeat(REPEAT_ITERATIONS[repeat] ?? 1)}>
            {REPEAT_LABELS[repeat] ?? 'Repeat: Off'}
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>
    </>
  );
};
```

**Step 2: Build to verify**

```bash
pnpm run build
```

Expected: No errors.

**Step 3: Commit**

```bash
git add src/components/PlayerView.tsx
git commit -m "feat: add PlayerView with controls, seek, volume, shuffle, repeat"
```

---

### Task 9: Build the Queue view

**Files:**
- Create: `src/components/QueueView.tsx`

**Step 1: Create `src/components/QueueView.tsx`**

```tsx
import { ButtonItem, PanelSection, PanelSectionRow } from '@decky/ui';
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

  if (loading) return <PanelSection><PanelSectionRow><div>Loading queue...</div></PanelSectionRow></PanelSection>;

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
        <ButtonItem layout="below" onClick={handleClear}>Clear Queue</ButtonItem>
      </PanelSectionRow>
      {queue.map((item, index) => {
        const r = getRenderer(item);
        const title = r?.title?.runs?.[0]?.text ?? 'Unknown';
        const artist = r?.shortBylineText?.runs?.[0]?.text ?? '';
        const isSelected = r?.selected ?? false;
        return (
          <PanelSectionRow key={index}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
              <div
                onClick={() => handleJump(index)}
                style={{
                  flex: 1,
                  cursor: 'pointer',
                  fontWeight: isSelected ? 'bold' : 'normal',
                  fontSize: '12px',
                  overflow: 'hidden',
                }}
              >
                <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{title}</div>
                {artist && <div style={{ color: 'var(--gpSystemLighterGrey)', fontSize: '11px' }}>{artist}</div>}
              </div>
              <ButtonItem layout="below" onClick={() => handleRemove(index)} style={{ minWidth: '32px', padding: '4px' }}>
                ✕
              </ButtonItem>
            </div>
          </PanelSectionRow>
        );
      })}
    </PanelSection>
  );
};
```

**Step 2: Build to verify**

```bash
pnpm run build
```

Expected: No errors.

**Step 3: Commit**

```bash
git add src/components/QueueView.tsx
git commit -m "feat: add QueueView with jump, remove, and clear"
```

---

### Task 10: Build the Search view

**Files:**
- Create: `src/components/SearchView.tsx`

**Step 1: Create `src/components/SearchView.tsx`**

```tsx
import { ButtonItem, PanelSection, PanelSectionRow, TextField } from '@decky/ui';
import { useState } from 'react';
import { addToQueue, clearQueue, search, setQueueIndex } from '../services/apiClient';
import type { SearchResultItem } from '../types';

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
      <PanelSection title="Search">
        <PanelSectionRow>
          <TextField
            label="Search YouTube Music"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') void handleSearch(); }}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem layout="below" onClick={handleSearch} disabled={searching || !query.trim()}>
            {searching ? 'Searching...' : 'Search'}
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>

      {searched && results.length === 0 && (
        <PanelSection>
          <PanelSectionRow>
            <div style={{ color: 'var(--gpSystemLighterGrey)', fontSize: '12px' }}>No results found</div>
          </PanelSectionRow>
        </PanelSection>
      )}

      {results.length > 0 && (
        <PanelSection title="Results">
          {results.map((item, index) => (
            <PanelSectionRow key={index}>
              <ButtonItem
                layout="below"
                onClick={() => handlePlay(item)}
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
            </PanelSectionRow>
          ))}
        </PanelSection>
      )}
    </>
  );
};
```

**Step 2: Build to verify**

```bash
pnpm run build
```

Expected: No errors.

**Step 3: Commit**

```bash
git add src/components/SearchView.tsx
git commit -m "feat: add SearchView with play-immediately on result tap"
```

---

### Task 11: Wire up the main plugin entry

**Files:**
- Modify: `src/index.tsx`

**Step 1: Replace the entire contents of `src/index.tsx`**

```tsx
import { PanelSection, PanelSectionRow, Tabs, staticClasses } from '@decky/ui';
import { definePlugin } from '@decky/api';
import { useState } from 'react';
import { FaMusic } from 'react-icons/fa';

import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { NotConnectedView } from './components/NotConnectedView';
import { AuthTokenView } from './components/AuthTokenView';
import { PlayerView } from './components/PlayerView';
import { QueueView } from './components/QueueView';
import { SearchView } from './components/SearchView';

const TABS = [
  { id: 'player', title: 'Player', content: <PlayerView /> },
  { id: 'queue', title: 'Queue', content: <QueueView /> },
  { id: 'search', title: 'Search', content: <SearchView /> },
];

const PluginContent = () => {
  const { connected, authRequired } = usePlayer();
  const [activeTab, setActiveTab] = useState('player');

  if (!connected) return <NotConnectedView />;
  if (authRequired) return <AuthTokenView />;

  return (
    <Tabs
      activeTab={activeTab}
      onShowTab={setActiveTab}
      tabs={TABS.map(({ id, title, content }) => ({
        id,
        title,
        content: <PanelSection>{content}</PanelSection>,
      }))}
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

> **Note on `Tabs`:** If `Tabs` is not exported by `@decky/ui` in your installed version, replace the tabbed layout with manual tab buttons. Check available exports by looking in `node_modules/@decky/ui/dist/index.d.ts`. If `Tabs` is missing, use this fallback tab bar instead (replace the `Tabs` block in `PluginContent`):
>
> ```tsx
> // Fallback tab bar if Tabs is not available
> const PluginContent = () => {
>   const { connected, authRequired } = usePlayer();
>   const [activeTab, setActiveTab] = useState('player');
>
>   if (!connected) return <NotConnectedView />;
>   if (authRequired) return <AuthTokenView />;
>
>   return (
>     <>
>       <PanelSection>
>         <PanelSectionRow>
>           <div style={{ display: 'flex', gap: '4px' }}>
>             {TABS.map(({ id, title }) => (
>               <ButtonItem
>                 key={id}
>                 layout="below"
>                 onClick={() => setActiveTab(id)}
>                 style={{ flex: 1, fontWeight: activeTab === id ? 'bold' : 'normal' }}
>               >
>                 {title}
>               </ButtonItem>
>             ))}
>           </div>
>         </PanelSectionRow>
>       </PanelSection>
>       {TABS.find(({ id }) => id === activeTab)?.content}
>     </>
>   );
> };
> ```

**Step 2: Build the final plugin**

```bash
pnpm run build
```

Expected: `dist/index.js` built with no TypeScript errors.

**Step 3: Commit**

```bash
git add src/index.tsx
git commit -m "feat: wire up main plugin entry with tabs and PlayerProvider"
```

---

### Task 12: Deploy and manually test

**Step 1: Copy to Steam Deck plugin directory**

On your Steam Deck (or via SSH), copy the plugin folder to the Decky plugins directory:

```bash
# From your dev machine, copy the built plugin to the Deck
rsync -av --exclude node_modules --exclude .git \
  /path/to/decky-youtube-music/ \
  deck@steamdeck:/home/deck/homebrew/plugins/youtube-music/
```

Or on the Deck directly, clone the repo and run `pnpm install && pnpm run build`.

**Step 2: Restart Decky Loader**

In the Decky settings, click "Reload" or restart the Steam Deck.

**Step 3: Test checklist**

- [ ] Plugin appears in Decky sidebar with music note icon
- [ ] "Not Connected" view shows when YouTube Music is closed
- [ ] After opening YouTube Music + enabling API Server → plugin auto-connects within 5 seconds
- [ ] Player tab: album art, title, artist display correctly
- [ ] Play/pause, next, previous work
- [ ] Seek bar updates live and clicking seeks correctly
- [ ] Volume slider changes volume
- [ ] Mute/unmute works
- [ ] Shuffle toggle works
- [ ] Repeat cycles NONE → ALL → ONE
- [ ] Like/dislike work
- [ ] Queue tab: shows current queue, tap item to jump, remove item, clear queue works
- [ ] Search tab: type query, get results, tap result plays it
- [ ] If API Server has auth enabled: 401 triggers token input view, entering token reconnects

---

## Notes

- **Decky plugin hot-reload:** In developer mode, Decky can reload plugins without restarting. Enable developer mode in Decky settings.
- **API Server setup in th-ch/youtube-music:** Go to Plugins → API Server → Enable, note the port (default 26538) and auth strategy. Set auth strategy to `NONE` for easiest testing.
- **TypeScript strict mode is on** in `tsconfig.json` — all type errors must be fixed before the build succeeds.
- **`@decky/ui` component availability** varies by version — check `node_modules/@decky/ui/dist/index.d.ts` if a component import fails.
