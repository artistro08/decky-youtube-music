# Volume Fix Design

**Date:** 2026-03-13
**Status:** Approved
**Supersedes:** `docs/superpowers/plans/2026-03-12-fix-volume-remount.md` (old approach — discard it)

## Problem

Two bugs combine to break volume display:

1. **`VOLUME_CHANGED` ignores the volume field** — the handler in `websocketService.ts` dispatches only `muted`, discarding `volume` based on an incorrect assumption that WS volume is on a different scale. Confirmed: volume is reliably 0–100 on both WS and HTTP (`{ state: 41, isMuted: true }`).

2. **`VolumeSlider` uses isolated local state** — it initializes to `null` on every mount and relies on an HTTP polling interval to populate itself. When the user switches tabs, the component may unmount and state resets. On remount, the slider shows 0/disabled until the next poll fires (up to 2 seconds later). Even when it doesn't remount, it never reads from context so it can drift out of sync.

## Confirmed Facts

- `GET /volume` returns `{ state: number, isMuted: boolean }` where `state` is 0–100.
- WebSocket `PLAYER_INFO` and `VOLUME_CHANGED` messages send volume on the same 0–100 scale. The old comment claiming a different scale was incorrect.
- `PlayerContext` is a persistent context — it does **not** unmount when the user switches between Player and Queue tabs, because `PlayerProvider` wraps `PluginContent` at the top level in `Content`.
- `PlayerContext` already stores `volume` from `PLAYER_INFO` (fires on every WS connect/reconnect).
- `PlayerContext` has a `connected: boolean` field that reflects live WS connection state.

## Tab Mounting Behaviour

There are two render paths in `index.tsx`:

**Path A — `Tabs` available (normal case):** `PlayerView` is passed as JSX `content` to the Decky `Tabs` component. Whether Decky mounts/unmounts inactive tab content is not guaranteed; behaviour may vary across Decky versions. The fix must work correctly whether `VolumeSlider` remounts or stays mounted.

**Path B — `!Tabs` fallback:** `{activeTab === 'player' && <PlayerView />}` — `PlayerView` (and therefore `VolumeSlider`) definitely unmounts on every tab switch.

The context-backed approach handles both paths correctly: if the component remounts, it reads the already-populated context value; if it stays mounted, it receives context updates via `useEffect`.

## Design

### `websocketService.ts`

Fix the `VOLUME_CHANGED` handler to batch both fields into a single `notify` call (consistent with the `PLAYER_INFO` handler pattern):

```ts
case 'VOLUME_CHANGED': {
  const update: Partial<PlayerState> = {};
  if (msg.volume !== undefined) update.volume = msg.volume;
  if (msg.muted !== undefined) update.muted = msg.muted;
  if (Object.keys(update).length > 0) notify(update);
  break;
}
```

Remove the incorrect comment about differing scales.

### `VolumeSlider.tsx`

Rewrite the state model:

- **Remove** the HTTP polling interval (`setInterval` / `getVolume` / `fetchVolume` / `POLL_MS` / `USER_ADJUST_GRACE_MS` constants).
- **Read** initial volume from `usePlayer().volume`. Context is populated from `PLAYER_INFO` before the user ever navigates to the Player tab, so this value is correct on mount.
- **Disable the slider** when `usePlayer().connected` is `false`. This prevents the user accidentally firing a `setVolume` POST before the real volume has been read from YTM. The existing disabled render path (currently gated on `volume === null`) should be replaced with `!connected`.
- **Keep local override state** only for the duration of a drag. While the user is dragging, a local value shadows the context value so the slider doesn't jump. Once the drag grace period expires, context re-syncs.
- **After grace period expires**, do a single HTTP `getVolume()` fetch to re-sync. This guards against the case where the YTM companion API does not echo the `POST /volume` back as a `VOLUME_CHANGED` WS event. If it does echo, the context is already correct and the fetch is a no-op (same value). If it doesn't, the fetch corrects any drift.
- **Keep debounced HTTP POST** (`setVolume`) on drag — this is correct and stays.
- **No `null` initial state** — initialize from context value directly; the disabled state is driven by `connected`, not by a null volume.

Sync behaviour:
```
context.volume changes AND not adjusting → update local display value
user drags → update local display value + set adjusting flag + debounced POST
adjusting grace period expires → clear flag + one-shot getVolume() fetch → update context
```

### `PlayerContext.tsx`

No changes required. It already:
- Receives `volume` from `PLAYER_INFO` on every WS connect.
- Will now also receive `volume` from `VOLUME_CHANGED` once the WS fix lands.

## Data Flow

```
YTM desktop changes volume
  → WS VOLUME_CHANGED { volume, muted }
  → websocketService dispatches { volume, muted } (batched)
  → PlayerContext.volume updated
  → VolumeSlider syncs from context (if not adjusting)

Plugin opens / WS reconnects
  → WS PLAYER_INFO { volume, ... }
  → PlayerContext.volume updated
  → VolumeSlider reads context.volume on mount/sync → correct value immediately

User is on Player tab, WS not yet connected
  → PlayerContext.connected = false
  → VolumeSlider shows disabled slider (no value displayed)
  → WS connects → PLAYER_INFO arrives → connected = true, volume populated
  → VolumeSlider becomes interactive with correct value

User drags slider
  → local state updates instantly (no lag)
  → debounced HTTP POST after 300ms
  → adjusting grace period (1500ms) suppresses incoming context updates
  → grace period expires → one-shot HTTP GET /volume → context updated with confirmed value
```

## Error Handling

- **Before WS connects:** Slider is disabled (`connected === false`). No stale 0 or 100 value displayed as interactive. Becomes interactive as soon as WS connects and `PLAYER_INFO` arrives.
- **POST /volume fails:** Local state shows user's intended value. One-shot re-fetch after grace period corrects to actual YTM state.
- **WS VOLUME_CHANGED not emitted after POST:** Handled by one-shot re-fetch at end of grace period.

## Files Changed

| File | Change |
|------|--------|
| `src/services/websocketService.ts` | Fix `VOLUME_CHANGED` to batch-dispatch volume + muted; remove incorrect scale comment |
| `src/components/VolumeSlider.tsx` | Remove polling; read from context; disable on `!connected`; local state only for drag window; one-shot re-fetch after grace period |

## Files Unchanged

| File | Reason |
|------|--------|
| `src/context/PlayerContext.tsx` | Already correct |
| `src/services/apiClient.ts` | `setVolume` POST stays; `getVolume` GET stays (used for one-shot re-fetch) |
| `src/types.ts` | No new fields needed |
| `src/index.tsx` | No changes needed |
