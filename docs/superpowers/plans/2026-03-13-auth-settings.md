# Auth Settings Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a gear-icon settings page to the plugin with a one-click "Request Authorization" flow using the YTM companion API's `POST /auth/{id}` endpoint, plus a manual token entry fallback.

**Architecture:** A new `SettingsView` full-page route (registered via `routerHook`) hosts the auto-auth button and manual token form. A gear `DialogButton` in the plugin's `titleView` navigates there. The existing `AuthTokenView` (shown on 401) is simplified to a single "Open Settings" button.

**Tech Stack:** React (TypeScript), `@decky/ui` v4.11.0 (`Navigation`, `DialogButton`, `Focusable`, `PanelSection`, `PanelSectionRow`, `ButtonItem`, `TextField`), `@decky/api` v1.1.3 (`routerHook`), `react-icons/bs` (`BsGearFill`), native `fetch` + `AbortController`.

**Spec:** `docs/superpowers/specs/2026-03-13-auth-settings-design.md`

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `src/services/apiClient.ts` | Add `requestAuth(id)` — bare fetch to `POST /auth/{id}`, 60s timeout, throws on 403/network error |
| Modify | `src/components/AuthTokenView.tsx` | Replace inline token form with "Open Settings" button |
| Create | `src/components/SettingsView.tsx` | Full-page settings: auto-auth button + manual token form + clear token |
| Modify | `src/index.tsx` | Register `/youtube-music/settings` route; replace `titleView` with `Focusable` + gear button |

---

## Chunk 1: `requestAuth` in apiClient.ts

### Task 1: Add `requestAuth` to `apiClient.ts`

**Files:**
- Modify: `src/services/apiClient.ts`

`requestAuth` must use a bare `fetch()` with **no** `Authorization` header — it is the call that obtains a token, so the shared `headers()` helper must not be used. It applies a 60-second client-side timeout via `AbortController`. It throws `Error('denied')` on 403, `AbortError` on timeout, and a generic error on other failures.

- [ ] **Step 1: Add `requestAuth` to the end of `src/services/apiClient.ts`**

```typescript
export const requestAuth = async (id: string): Promise<string> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);
  try {
    const res = await fetch(`${BASE_URL}/auth/${encodeURIComponent(id)}`, {
      method: 'POST',
      signal: controller.signal,
    });
    if (res.status === 403) throw new Error('denied');
    if (!res.ok) throw new Error(`auth failed: ${res.status}`);
    const data = await res.json() as { accessToken: string };
    return data.accessToken;
  } finally {
    clearTimeout(timeout);
  }
};
```

- [ ] **Step 2: Build to verify no TypeScript errors**

```bash
npm run build
```

Expected: build completes with no errors. (`dist/index.js` is updated.)

- [ ] **Step 3: Commit**

```bash
git add src/services/apiClient.ts
git commit -m "feat: add requestAuth to apiClient"
```

---

## Chunk 2: UI Components

> **Depends on:** Chunk 1 must be complete — `requestAuth` must be exported from `src/services/apiClient.ts` before building this chunk.

### Task 2: Simplify `AuthTokenView`

**Files:**
- Modify: `src/components/AuthTokenView.tsx`

Remove the token input field and "Save & Connect" button. Replace with a short message and a single "Open Settings" button that navigates to the settings page and closes the side menu.

- [ ] **Step 1: Replace the contents of `src/components/AuthTokenView.tsx`**

```tsx
import { ButtonItem, Navigation } from '@decky/ui';
import { Section } from './Section';

export const AuthTokenView = () => {
  const handleOpenSettings = () => {
    Navigation.Navigate('/youtube-music/settings');
    Navigation.CloseSideMenus();
  };

  return (
    <Section title="Authentication Required">
      <div style={{ padding: '8px 16px', fontSize: '12px', color: 'var(--gpSystemLighterGrey)' }}>
        The YouTube Music API server requires authorization. Open Settings to authorize this plugin.
      </div>
      <ButtonItem layout="below" onClick={handleOpenSettings}>
        Open Settings
      </ButtonItem>
    </Section>
  );
};
```

- [ ] **Step 2: Build to verify no TypeScript errors**

```bash
npm run build
```

Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add src/components/AuthTokenView.tsx
git commit -m "feat: simplify AuthTokenView to Open Settings button"
```

---

### Task 3: Create `SettingsView`

**Files:**
- Create: `src/components/SettingsView.tsx`

This is the full-page settings route. It is rendered **outside** `PlayerProvider`, so it cannot use `usePlayer()`. Instead it reads token presence directly from `getToken()` (localStorage). It manages its own local state for the auth button and the manual token input.

Auth button state machine:
- `idle` → user clicks → `pending` (fetch starts, button disabled)
- `pending` → 200 → `success` → save token, reconnect
- `pending` → 403 → `denied`
- `pending` → AbortError (60s) → `timeout`
- `pending` → other error → `error`
- `denied` / `timeout` / `error` → button re-enabled, user can retry

The manual token save and clear token flows both call `disconnect()` → `setTimeout(resetAndConnect, 100)` (matching the 100ms delay already used in the old `AuthTokenView`).

**Error contract from `requestAuth` (defined in Chunk 1):**
- Throws `Error('denied')` with `e.message === 'denied'` on 403 — caught by `e.message === 'denied'` check
- Throws `AbortError` (`e.name === 'AbortError'`) after 60s timeout — caught by `e.name === 'AbortError'` check
- Throws generic `Error` on all other failures — falls through to `error` state

- [ ] **Step 1: Create `src/components/SettingsView.tsx`**

```tsx
import { ButtonItem, PanelSection, PanelSectionRow, TextField } from '@decky/ui';
import { useState } from 'react';
import { getToken, setToken, clearToken, requestAuth } from '../services/apiClient';
import { disconnect, resetAndConnect } from '../services/websocketService';

const CLIENT_ID = 'decky-youtube-music';

type AuthState = 'idle' | 'pending' | 'success' | 'denied' | 'timeout' | 'error';

const AUTH_LABEL: Record<AuthState, string> = {
  idle: 'Request Authorization',
  pending: 'Waiting for approval...',
  success: 'Authorized!',
  denied: 'Denied — try again',
  timeout: 'Timed out — try again',
  error: 'Could not reach YouTube Music',
};

export const SettingsView = () => {
  const [authState, setAuthState] = useState<AuthState>('idle');
  const [manualToken, setManualToken] = useState('');
  const [hasToken, setHasToken] = useState(() => !!getToken());

  const reconnect = (token: string) => {
    setToken(token);
    disconnect();
    setTimeout(resetAndConnect, 100);
  };

  const handleRequestAuth = async () => {
    setAuthState('pending');
    try {
      const token = await requestAuth(CLIENT_ID);
      reconnect(token);
      setHasToken(true);
      setAuthState('success');
      setTimeout(() => setAuthState('idle'), 2000);
    } catch (e: unknown) {
      if (e instanceof Error && e.name === 'AbortError') {
        setAuthState('timeout');
      } else if (e instanceof Error && e.message === 'denied') {
        setAuthState('denied');
      } else {
        setAuthState('error');
      }
    }
  };

  const handleSaveManual = () => {
    const trimmed = manualToken.trim();
    if (!trimmed) return;
    reconnect(trimmed);
    setManualToken('');
    setHasToken(true);
  };

  const handleClear = () => {
    clearToken();
    disconnect();
    setTimeout(resetAndConnect, 100);
    setHasToken(false);
    setAuthState('idle');
  };

  return (
    <>
      <PanelSection title="Connection">
        <PanelSectionRow>
          <div style={{ fontSize: '13px' }}>
            {hasToken
              ? <span><span style={{ color: '#4caf50' }}>●</span> Token saved</span>
              : <span style={{ color: 'var(--gpSystemLighterGrey)' }}>✗ No token</span>}
          </div>
        </PanelSectionRow>
      </PanelSection>

      <PanelSection title="Authorization">
        <PanelSectionRow>
          <div style={{ fontSize: '12px', color: 'var(--gpSystemLighterGrey)' }}>
            Asks YouTube Music desktop to approve this plugin. Check your desktop app when prompted.
          </div>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem
            layout="below"
            onClick={() => { void handleRequestAuth(); }}
            disabled={authState === 'pending'}
          >
            {AUTH_LABEL[authState]}
          </ButtonItem>
        </PanelSectionRow>

        <PanelSectionRow>
          <div style={{ fontSize: '12px', color: 'var(--gpSystemLighterGrey)', textAlign: 'center', margin: '4px 0' }}>
            — or enter token manually —
          </div>
        </PanelSectionRow>

        <PanelSectionRow>
          <TextField
            label="API Token"
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem layout="below" onClick={handleSaveManual} disabled={!manualToken.trim()}>
            Save Token
          </ButtonItem>
        </PanelSectionRow>

        {hasToken && (
          <PanelSectionRow>
            <ButtonItem layout="below" onClick={handleClear}>
              Clear Token
            </ButtonItem>
          </PanelSectionRow>
        )}
      </PanelSection>
    </>
  );
};
```

- [ ] **Step 2: Build to verify no TypeScript errors**

```bash
npm run build
```

Expected: clean build.

> **Note:** Route registration (`routerHook.addRoute('/youtube-music/settings', SettingsView)`) is wired in `index.tsx` in Chunk 3. The "Open Settings" navigation will not function until Chunk 3 is complete.

- [ ] **Step 3: Commit**

```bash
git add src/components/SettingsView.tsx
git commit -m "feat: add SettingsView with auto-auth and manual token entry"
```

---

## Chunk 3: Integration + Packaging

### Task 4: Wire up route and gear button in `index.tsx`

**Files:**
- Modify: `src/index.tsx`

Two changes:
1. Register the settings route via `routerHook.addRoute` inside `definePlugin`
2. Replace the current `titleView` (plain `<div>`) with a `Focusable` containing the title text on the left and a gear `DialogButton` on the right — matching the CSS Loader `TitleView` pattern

The gear button calls `Navigation.Navigate('/youtube-music/settings')` then `Navigation.CloseSideMenus()`. Order matters: navigate first, close menus second (per `@decky/ui` docs — prevents a race condition in Big Picture mode).

- [ ] **Step 1: Add imports at the top of `src/index.tsx`**

Add to the existing import from `@decky/ui`:
```tsx
import { ButtonItem, DialogButton, Focusable, Tabs, staticClasses } from '@decky/ui';
```

Add new imports after the existing imports:
```tsx
import { routerHook } from '@decky/api';
import { Navigation } from '@decky/ui';
import { BsGearFill } from 'react-icons/bs';
import { SettingsView } from './components/SettingsView';
```

- [ ] **Step 2: Register the settings route and update `titleView` in the `definePlugin` call**

Replace the current `definePlugin` block at the bottom of `src/index.tsx`:

```tsx
export default definePlugin(() => {
  routerHook.addRoute('/youtube-music/settings', SettingsView);

  return {
    name: 'YouTube Music',
    titleView: (
      <Focusable
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '0',
          boxShadow: 'none',
        }}
        className={staticClasses.Title}
      >
        <div>YouTube Music</div>
        <DialogButton
          style={{ height: '28px', width: '40px', minWidth: 0, padding: '10px 12px' }}
          onClick={() => {
            Navigation.Navigate('/youtube-music/settings');
            Navigation.CloseSideMenus();
          }}
        >
          <BsGearFill style={{ marginTop: '-4px', display: 'block' }} />
        </DialogButton>
      </Focusable>
    ),
    content: <Content />,
    icon: <FaMusic />,
    onDismount() {
      routerHook.removeRoute('/youtube-music/settings');
    },
  };
});
```

Note: `routerHook.removeRoute` is called in `onDismount` to clean up when the plugin is unloaded.

- [ ] **Step 3: Build to verify no TypeScript errors**

```bash
npm run build
```

Expected: clean build, no errors.

- [ ] **Step 4: Commit**

```bash
git add src/index.tsx
git commit -m "feat: add settings route and gear button to title bar"
```

---

### Task 5: Package and verify

- [ ] **Step 1: Build the final bundle**

```bash
npm run build
```

- [ ] **Step 2: Package as installable zip**

```bash
mkdir -p /tmp/ym/youtube-music/dist
cp dist/index.js /tmp/ym/youtube-music/dist/
cp plugin.json package.json main.py /tmp/ym/youtube-music/
cd /tmp/ym && powershell.exe -Command "Compress-Archive -Path 'youtube-music' -DestinationPath 'youtube-music.zip' -Force"
cp /tmp/ym/youtube-music.zip ./youtube-music.zip
```

- [ ] **Step 3: Verify zip structure**

```bash
cd /tmp/ym && powershell.exe -Command "Get-ChildItem -Recurse youtube-music | Select-Object FullName"
```

Expected structure:
```
youtube-music/main.py
youtube-music/package.json
youtube-music/plugin.json
youtube-music/dist/index.js
```

- [ ] **Step 4: Manual test checklist**

Install the zip via Decky Loader "Install from ZIP" and verify:

- [ ] Gear icon appears in the plugin title bar next to "YouTube Music"
- [ ] Clicking the gear icon navigates to the full-page settings view
- [ ] Settings page shows "✗ No token" when no token is stored
- [ ] "Request Authorization" button is enabled and shows correct label
- [ ] Clicking "Request Authorization" shows "Waiting for approval..." and disables the button
- [ ] Approving on the YTM desktop → settings page shows "Authorized!", status updates to "● Token saved", plugin panel reconnects
- [ ] Denying on the YTM desktop → button shows "Denied — try again" and re-enables
- [ ] Manual token entry: pasting a token and clicking "Save Token" saves it and reconnects
- [ ] "Clear Token" button appears when a token is saved; clicking it removes the token and triggers 401 → `AuthTokenView` appears in panel
- [ ] `AuthTokenView` (on 401) shows "Open Settings" button that navigates to the settings page
- [ ] With `NONE` auth strategy: "Request Authorization" returns instantly with a token, no dialog shown

- [ ] **Step 5: Commit**

```bash
git add youtube-music.zip
git commit -m "build: package auth settings feature"
```
