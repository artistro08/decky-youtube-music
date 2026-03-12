# Decky YouTube Music Plugin — Design Doc

**Date:** 2026-03-10
**Status:** Approved

---

## Overview

A Decky Loader plugin for the Steam Deck that connects to a running instance of [th-ch/youtube-music](https://github.com/th-ch/youtube-music) (Pear Desktop) and provides full playback control from the Decky sidebar. No Python backend — pure TypeScript/React frontend using the app's built-in REST API and WebSocket.

---

## Architecture

**Approach:** Frontend-only (Approach A)

The plugin communicates directly with the `th-ch/youtube-music` API Server plugin:
- **REST API:** `http://localhost:26538/api/v1/...`
- **WebSocket:** `ws://localhost:26538/api/v1/ws`
- **API version:** `v1`
- **Default port:** `26538`

**Startup flow:**
1. Plugin loads → attempts WebSocket connection
2. Connected → show player UI, subscribe to real-time events
3. Connection fails → show "Not Connected" screen with instructions
4. Any request returns 401 → show inline token input, save token, retry with `Authorization: Bearer <token>`

**State management:** Single React context holding player state (song info, isPlaying, position, volume, mute, shuffle, repeat, queue). WebSocket keeps state live. REST calls are fire-and-forget for controls.

---

## Components

### Player View (main)
- Album art thumbnail
- Song title + artist name
- Seek bar (live position via `POSITION_CHANGED`, click → `POST /seek-to`)
- Play/Pause, Previous, Next buttons
- Volume slider (`GET/POST /api/v1/volume`)
- Shuffle toggle (`POST /api/v1/shuffle`)
- Repeat toggle (`POST /api/v1/switch-repeat` — cycles NONE → ALL → ONE)
- Like / Dislike buttons (`POST /api/v1/like`, `/dislike`)

### Queue View (tab)
- Scrollable list of current queue items (`GET /api/v1/queue`)
- Tap item → jump to it (`PATCH /api/v1/queue` with index)
- Remove button per item (`DELETE /api/v1/queue/{index}`)
- Clear queue button (`DELETE /api/v1/queue`)

### Search View (tab)
- Text input → `POST /api/v1/search`
- Result list with title + artist
- Tap result → play immediately (add to front of queue + set index 0)

### Not Connected View
- Message: "YouTube Music is not running"
- Instructions: open th-ch/youtube-music and enable the API Server plugin

### Auth (inline)
- Shown when any request returns 401
- Token input field saved to Decky settings storage
- All requests attach `Authorization: Bearer <token>` after save

---

## Data Flow

### Real-time state (WebSocket)
| Event | Action |
|---|---|
| `PLAYER_INFO` | Full state snapshot on connect |
| `VIDEO_CHANGED` | Update song info, reset seek |
| `PLAYER_STATE_CHANGED` | Update isPlaying + position |
| `POSITION_CHANGED` | Update seek bar |
| `VOLUME_CHANGED` | Update volume + mute |
| `REPEAT_CHANGED` | Update repeat mode |
| `SHUFFLE_CHANGED` | Update shuffle toggle |

On disconnect → show "Not Connected", reconnect every 5 seconds.

### Control calls (REST)
- User action → `fetch` to REST endpoint
- No manual state update needed — WebSocket reflects changes back
- 401 → prompt for token, attach to all future requests

### Queue & Search (REST request/response)
- Queue tab open → `GET /api/v1/queue`
- Search submit → `POST /api/v1/search`
- Result tap → `POST /api/v1/queue` (add at position 0) + `PATCH /api/v1/queue` (set index 0)

---

## Error Handling

| Scenario | Behavior |
|---|---|
| WebSocket disconnect | Auto-reconnect every 5s, show "Not Connected" overlay |
| REST 401 | Show inline token input, retry after save |
| REST 5xx / network error | Silent fail on controls; toast notification on queue/search |
| Search empty results | Show empty state message |
| Queue empty | Show empty state message |

---

## Testing

Manual testing against a running `th-ch/youtube-music` instance with the API Server plugin enabled on port 26538.

**Test scenarios:**
- Connect / disconnect / reconnect flow
- All playback controls (play, pause, next, previous, seek, volume, shuffle, repeat, like)
- Queue view: display, jump to item, remove item, clear
- Search: query, results display, tap to play
- Auth token flow (401 → enter token → retry)
- Not Connected view when app is closed
