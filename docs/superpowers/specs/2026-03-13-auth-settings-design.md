# Auth Settings Design

**Date:** 2026-03-13
**Status:** Approved

## Overview

Add a settings page to the decky-youtube-music plugin that supports the YouTube Music companion API's `AUTH_AT_FIRST` authorization flow. Users can click "Request Authorization" to trigger an Allow/Deny dialog on the YTM desktop app, or enter a token manually as a fallback. A gear icon button in the plugin title bar opens the settings page.

## Architecture

### New Files

- **`src/components/SettingsView.tsx`** — Full-page settings route component. Contains the auto-auth button (with loading/success/error states) and the manual token input form. Rendered outside `PlayerProvider` — reads token presence directly from `getToken()` (localStorage) rather than from PlayerContext.

### Modified Files

- **`src/index.tsx`** — Register `/youtube-music/settings` route via `routerHook.addRoute()`. Replace the current plain `titleView` div with a `Focusable` containing the "YouTube Music" title and a gear `DialogButton` that navigates to the settings route.
- **`src/services/apiClient.ts`** — Add `requestAuth(id: string): Promise<string>` that calls `POST /auth/{id}` using a bare `fetch()` (no `Authorization` header — this is the call that obtains a token, so sending a stale/missing token would be incorrect). Returns the `accessToken` string on 200, throws a `DeniedError` on 403, and throws on network errors.
- **`src/components/AuthTokenView.tsx`** — Simplify to a single "Open Settings" button. Remove the inline token input (it now lives in the settings page). Clicking calls `Navigation.Navigate('/youtube-music/settings')` and `Navigation.CloseSideMenus()`.

## Auth Flow

### Client ID

Fixed string `"decky-youtube-music"`. The YTM server stores authorized IDs in `authorizedClients`. Once approved, future calls to `POST /auth/decky-youtube-music` return a fresh token instantly without showing a dialog.

### `POST /auth/{id}` Behavior

| Server strategy | ID known? | Result |
|---|---|---|
| `AUTH_AT_FIRST` | No | Desktop dialog shown → Allow returns token, Deny returns 403 |
| `AUTH_AT_FIRST` | Yes | Token returned immediately, no dialog |
| `NONE` | — | Token returned immediately, no dialog |

### Request Authorization Button States

1. **Idle** — "Request Authorization" button enabled. Shown whether or not a token already exists — clicking when already authorized simply obtains a fresh token silently (harmless, no dialog shown).
2. **Pending** — Button disabled, shows "Waiting for approval..." with a spinner. The POST request blocks while the desktop dialog is open.
3. **Success** — Shows "Authorized!" briefly, then saves token and reconnects WebSocket.
4. **Denied (403)** — Shows "Denied — try again" in red, button re-enabled.
5. **Timeout (60s)** — Shows "Timed out — try again" in red, button re-enabled.
6. **Network error** — Shows "Could not reach YouTube Music" in red, button re-enabled.

### Reconnect After Auth

On successful auth:

```
setToken(accessToken) → disconnect() → setTimeout(resetAndConnect, 100)
```

The 100ms delay matches the existing pattern in `AuthTokenView.tsx` and avoids a race where `socket.close()` has not yet fired `onclose` before `resetAndConnect()` is called.

## Settings Page Layout

```
┌─────────────────────────────────────┐
│ ← YouTube Music Settings            │
├─────────────────────────────────────┤
│ CONNECTION                          │
│  Status: ● Token saved / ✗ No token │
│  (based on localStorage — not live  │
│   WebSocket state)                  │
│                                     │
│ AUTHORIZATION                       │
│  [Request Authorization]            │
│   Asks YouTube Music desktop to     │
│   approve this plugin. Check your   │
│   desktop app when prompted.        │
│                                     │
│  ─── or enter token manually ───    │
│                                     │
│  [Token input field]                │
│  [Save Token]                       │
│                                     │
│  [Clear Token]  ← shown if token set│
└─────────────────────────────────────┘
```

**Status indicator:** Reads from `getToken()` at render time and after any save/clear action. Shows "● Token saved" (green dot) if a token exists in localStorage, "✗ No token" (grey/red) otherwise. Does not reflect live WebSocket connection state — the settings page is a standalone route outside `PlayerProvider`.

## Title Bar Gear Button

- Pattern follows CSS Loader's `TitleView` component
- `titleView` in `definePlugin` renders a `Focusable` with:
  - Left: "YouTube Music" title text
  - Right: `DialogButton` with `BsGearFill` icon (28px height, 40px width, no min-width)
- On click: `Navigation.Navigate('/youtube-music/settings')` then `Navigation.CloseSideMenus()`

## Token Lifecycle

- Storage key unchanged: `ytmusic_api_token` in `localStorage`
- On successful auth request: `setToken(accessToken)` → `disconnect()` → `setTimeout(resetAndConnect, 100)`
- On clear: `clearToken()` → `disconnect()` → `setTimeout(resetAndConnect, 100)` — server returns 401, `AuthTokenView` appears in the panel
- No auto-request on startup — user must explicitly visit settings and click the button

## AuthTokenView (on 401)

Simplified to a message and a single "Open Settings" button. Removes the inline token input. Text explains that the API server requires authorization and directs the user to settings.

## Error Handling

- **60-second client timeout** on `POST /auth/{id}` via `AbortController`
- `403` response → denied state
- `AbortError` → timeout state
- Network/fetch error → network error state
- All error states re-enable the "Request Authorization" button for retry
