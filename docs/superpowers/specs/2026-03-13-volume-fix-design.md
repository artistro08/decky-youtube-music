# Volume Fix Design

**Date:** 2026-03-13
**Status:** Approved

## Problem

Two bugs combine to break volume display:

1. **`VOLUME_CHANGED` ignores the volume field** — the handler in `websocketService.ts` dispatches only `muted`, discarding `volume` based on an incorrect assumption that WS volume is on a different scale. Confirmed: volume is reliably 0–100 on both WS and HTTP.

2. **`VolumeSlider` uses isolated local state** — it initializes to `null` on every mount and relies on an HTTP polling interval to populate itself. When the user switches tabs, the component unmounts and state resets. On remount, the slider shows 0/disabled until the next poll fires (up to 2 seconds later).

## Confirmed Facts

- `GET /volume` returns `{ state: number, isMuted: boolean }` where `state` is 0–100.
- WebSocket `PLAYER_INFO` and `VOLUME_CHANGED` messages send volume on the same 0–100 scale.
- `PlayerContext` is a persistent context — it does **not** unmount when the user switches between Player and Queue tabs.
- `PlayerContext` already stores `volume` from `PLAYER_INFO` (fires on every WS connect/reconnect).

## Design

### `websocketService.ts`

Fix the `VOLUME_CHANGED` handler to dispatch `volume` alongside `muted`:

```ts
case 'VOLUME_CHANGED':
  if (msg.volume !== undefined) notify({ volume: msg.volume });
  if (msg.muted !== undefined) notify({ muted: msg.muted });
  break;
```

Remove the incorrect comment about differing scales.

### `VolumeSlider.tsx`

Rewrite the state model:

- **Remove** the HTTP polling interval (`setInterval` / `getVolume` / `fetchVolume`).
- **Read** initial volume from `usePlayer().volume` — context is already populated from `PLAYER_INFO` before the user ever sees the Player tab.
- **Keep local override state** only for the duration of a drag. While the user is dragging, a local value shadows the context value so the slider doesn't jump. Once the drag grace period expires, the slider re-syncs to context.
- **Keep debounced HTTP POST** (`setVolume`) on drag — this is correct and stays.
- **No `null` initial state** — initialize from context value directly, so remounts show the correct volume instantly.

Sync behaviour:
```
context.volume changes → if not adjusting → update local display value
user drags → update local display value + set adjusting flag + debounced POST
adjusting grace period expires → clear flag → next context.volume change syncs through
```

### `PlayerContext.tsx`

No changes required. It already:
- Receives `volume` from `PLAYER_INFO` on every WS connect.
- Will now also receive `volume` from `VOLUME_CHANGED` once the WS fix lands.

## Data Flow

```
YTM desktop changes volume
  → WS VOLUME_CHANGED { volume, muted }
  → websocketService dispatches { volume, muted }
  → PlayerContext.volume updated
  → VolumeSlider syncs from context (if not adjusting)

Plugin opens / WS reconnects
  → WS PLAYER_INFO { volume, ... }
  → PlayerContext.volume updated
  → VolumeSlider reads context.volume on mount → correct value immediately

User drags slider
  → local state updates instantly (no lag)
  → debounced HTTP POST after 300ms
  → adjusting grace period (1500ms) suppresses incoming context updates
  → after grace period, context.volume (from any VOLUME_CHANGED events) syncs through
```

## Error Handling

- If `PlayerContext.volume` is the default (100) because WS hasn't connected yet, the slider shows 100. This is acceptable — it matches the YTM default and will correct itself within milliseconds of WS connecting.
- If the debounced `setVolume` POST fails (network error), the local state already shows the user's intended value. The next `VOLUME_CHANGED` event from YTM will correct it if needed.

## Files Changed

| File | Change |
|------|--------|
| `src/services/websocketService.ts` | Fix `VOLUME_CHANGED` to dispatch volume |
| `src/components/VolumeSlider.tsx` | Remove polling, read from context, local state only for drag window |

## Files Unchanged

| File | Reason |
|------|--------|
| `src/context/PlayerContext.tsx` | Already correct |
| `src/services/apiClient.ts` | `setVolume` POST stays; `getVolume` GET no longer called |
| `src/types.ts` | No new fields needed |
