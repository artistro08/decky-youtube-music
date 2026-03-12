# Edge-to-Edge Spacing Final Fix — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make all interactive elements (buttons, sliders, toggles) extend fully edge-to-edge within the plugin panel, matching Steam's native Quick Settings and Help UI, with only small internal gaps between side-by-side buttons.

**Architecture:** Two targeted changes. First, extend the existing CSS injection in `index.tsx` to also zero out `PanelSectionRow` horizontal padding (currently only `PanelSection` is targeted, leaving single-row items still inset). Second, remove the incorrect `padding: '0 16px'` added to the Focusable control button rows in `PlayerView.tsx` — with both `PanelSection` and `PanelSectionRow` at zero padding, these rows extend edge-to-edge naturally, and the existing `5px` `marginLeft` between buttons provides the small internal gap.

**Tech Stack:** TypeScript, React, `@decky/ui` (`quickAccessControlsClasses`, `PanelSection`, `PanelSectionRow`, `Focusable`, `DialogButton`, `SliderField`), Rollup build via `pnpm run build`, PowerShell for packaging.

---

## Files to modify

- `src/index.tsx` — add `PanelSectionRow` to the CSS injection block
- `src/components/PlayerView.tsx` — remove `padding: '0 16px'` from the two Focusable control rows

---

## Task 1: Extend CSS injection to cover PanelSectionRow

**Files:** Modify `src/index.tsx`

**Context:** The current CSS injection zeros out `PanelSection` left/right padding and restores `PanelSectionTitle` padding. But `PanelSectionRow` — which wraps single-row items like Mute, Repeat, Shuffle, and search results — has its own horizontal padding that still insets those items. `quickAccessControlsClasses.PanelSectionRow` is already exported by `@decky/ui` and available at runtime.

- [ ] **Step 1: Update the CSS injection in `src/index.tsx`**

Find the `<style>` block inside the `return` of `PluginContent` (around line 69). Currently it has three CSS rules. Add a fourth for `PanelSectionRow`.

Replace the existing `<style>` block:

```tsx
      <style>{[
        gamepadTabbedPageClasses?.TabHeaderRowWrapper && `
          .ytm-tabs-container .${gamepadTabbedPageClasses.TabHeaderRowWrapper} {
            position: sticky;
            top: ${stickyTop}px;
            z-index: 9999;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(8px);
          }
        `,
        quickAccessControlsClasses?.PanelSection && `
          .ytm-tabs-container .${quickAccessControlsClasses.PanelSection} {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
        `,
        quickAccessControlsClasses?.PanelSectionTitle && `
          .ytm-tabs-container .${quickAccessControlsClasses.PanelSectionTitle} {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
        `,
      ].filter(Boolean).join('')}</style>
```

With:

```tsx
      <style>{[
        gamepadTabbedPageClasses?.TabHeaderRowWrapper && `
          .ytm-tabs-container .${gamepadTabbedPageClasses.TabHeaderRowWrapper} {
            position: sticky;
            top: ${stickyTop}px;
            z-index: 9999;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(8px);
          }
        `,
        quickAccessControlsClasses?.PanelSection && `
          .ytm-tabs-container .${quickAccessControlsClasses.PanelSection} {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
        `,
        quickAccessControlsClasses?.PanelSectionTitle && `
          .ytm-tabs-container .${quickAccessControlsClasses.PanelSectionTitle} {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
        `,
        quickAccessControlsClasses?.PanelSectionRow && `
          .ytm-tabs-container .${quickAccessControlsClasses.PanelSectionRow} {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
        `,
      ].filter(Boolean).join('')}</style>
```

- [ ] **Step 2: Build and verify no errors**

```bash
pnpm run build
```

Expected: `created dist in Xs` with no errors.

- [ ] **Step 3: Commit**

```bash
git add src/index.tsx
git commit -m "fix: zero out PanelSectionRow horizontal padding for edge-to-edge items"
```

---

## Task 2: Remove incorrect padding from control button rows

**Files:** Modify `src/components/PlayerView.tsx`

**Context:** In the previous commit, `padding: '0 16px'` was added to both Focusable control rows (Prev/Play/Next and Like/Dislike). This was wrong — it made the buttons inset instead of edge-to-edge. With `PanelSection` and `PanelSectionRow` padding now zeroed via CSS injection, the Focusable rows need no extra padding. The `5px` `marginLeft` on non-first buttons (in `rowBtn`) already provides the small internal gap between buttons that the user wants.

- [ ] **Step 1: Remove padding from the Prev/Play/Next Focusable row**

Find the first Focusable in the Controls section (around line 102). Change:

```tsx
            <Focusable
              style={{ display: 'flex', marginTop: '4px', marginBottom: '4px', padding: '0 16px' }}
              flow-children="horizontal"
            >
```

To:

```tsx
            <Focusable
              style={{ display: 'flex', marginTop: '4px', marginBottom: '4px' }}
              flow-children="horizontal"
            >
```

- [ ] **Step 2: Remove padding from the Like/Dislike Focusable row**

Find the second Focusable in the Controls section (around line 112). Change:

```tsx
            <Focusable
              style={{ display: 'flex', marginTop: '4px', marginBottom: '4px', padding: '0 16px' }}
              flow-children="horizontal"
            >
```

To:

```tsx
            <Focusable
              style={{ display: 'flex', marginTop: '4px', marginBottom: '4px' }}
              flow-children="horizontal"
            >
```

- [ ] **Step 3: Build and verify no errors**

```bash
pnpm run build
```

Expected: `created dist in Xs` with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/PlayerView.tsx
git commit -m "fix: remove incorrect padding from control button rows, restore edge-to-edge"
```

---

## Task 3: Package and verify zip structure

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
youtube-music/dist/index.js
youtube-music/dist/index.js.map
youtube-music/main.py
youtube-music/package.json
youtube-music/plugin.json
```

- [ ] **Step 4: Commit zip**

```bash
git add youtube-music.zip
git commit -m "build: package edge-to-edge spacing final fix"
```
