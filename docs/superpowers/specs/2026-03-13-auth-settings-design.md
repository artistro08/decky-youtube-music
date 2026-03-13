# Auth Settings Design

**Date:** 2026-03-13
**Status:** Approved

## Overview

Add a settings page to the decky-youtube-music plugin that supports the YouTube Music companion API's `AUTH_AT_FIRST` authorization flow. Users can click "Request Authorization" to trigger an Allow/Deny dialog on the YTM desktop app, or enter a token manually as a fallback. A gear icon button in the plugin title bar opens the settings page.

## Architecture

### New Files

- **`src/components/SettingsView.tsx`** — Full-page settings route component. Contains the auto-auth button (with loading/success/error states) and the manual token input form.
- **`src/services/authService.ts`** — Encapsulates the `POST /auth/{id}` request with a 60-second timeout, returning the access token or throwing on failure.

### Modified Files

- **`src/index.tsx`** — Register `/youtube-music/settings` route via `routerHook.addRoute()`. Replace the current plain `titleView` div with a `Focusable` containing the "YouTube Music" title and a gear `DialogButton` that navigates to the settings route.
- **`src/services/apiClient.ts`** — Add `requestAuth(id: string): Promise<string>` that calls `POST /auth/{id}` and returns the `accessToken` from the response, or throws on `403` / network error.
- **`src/components/AuthTokenView.tsx`** — Simplify to a single "Open Settings" button (removes the inline token input). Clicking it calls `Navigation.Navigate('/youtube-music/settings')` and `Navigation.CloseSideMenus()`.

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

1. **Idle** — "Request Authorization" button enabled
2. **Pending** — Button disabled, shows "Waiting for approval..." spinner. The POST request blocks while the desktop dialog is open.
3. **Success** — Shows "Authorized!" briefly, then reconnects WebSocket with the new token
4. **Denied (403)** — Shows "Denied — try again" in red, button re-enabled
5. **Timeout (60s)** — Shows "Timed out — try again" in red, button re-enabled
6. **Network error** — Shows "Could not reach YouTube Music" in red, button re-enabled

## Settings Page Layout

```
┌─────────────────────────────────────┐
│ ← YouTube Music Settings            │
├─────────────────────────────────────┤
│ CONNECTION                          │
│  Status: ● Connected / ✗ No token   │
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

## Title Bar Gear Button

- Pattern follows CSS Loader's `TitleView` component
- `titleView` in `definePlugin` renders a `Focusable` with:
  - Left: "YouTube Music" title text
  - Right: `DialogButton` with `BsGearFill` icon (28px height, 40px width, no min-width)
- On click: `Navigation.Navigate('/youtube-music/settings')` → `Navigation.CloseSideMenus()`

## Token Lifecycle

- Storage key unchanged: `ytmusic_api_token` in `localStorage`
- On successful auth request: `setToken(accessToken)` → `disconnect()` → `resetAndConnect()`
- On clear: `clearToken()` → `disconnect()` → `resetAndConnect()` — server returns 401, `AuthTokenView` appears
- No auto-request on startup — user must explicitly visit settings and click the button

## AuthTokenView (on 401)

Simplified to a single action: one "Open Settings" button. Removes the inline token input. Text explains that the API server requires authorization and directs the user to settings.

## Error Handling

- **60-second client timeout** on the `POST /auth/{id}` request via `AbortController`
- `403` response → denied state
- Network/fetch error → network error state
- All error states re-enable the button so the user can retry
