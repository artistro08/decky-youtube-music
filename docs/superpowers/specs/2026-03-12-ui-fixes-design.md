# UI Fixes: Volume Icon, Slider Offset, Full-Width Buttons, Repeat Label, Side Padding

## Goal

Fix six visual issues found after the initial UI polish pass:
1. Volume icon rendered via native `icon` prop instead of a custom flex row wrapper
2. Volume slider layout offset caused by empty `label` prop
3. Repeat button not full width
4. Clear Queue button not full width
5. Repeat button shows icon only — needs text label indicating current state
6. Increase side padding from 12px to 16px throughout both components

---

## Scope

All changes are confined to two files:
- `src/components/PlayerView.tsx` — volume section, repeat button, padding
- `src/components/QueueView.tsx` — Clear Queue button, padding

No new files. No changes to context, services, or types.

---

## Design

### 1. Volume Icon — Native `icon` Prop

**Current:** Custom flex row wrapping `FaVolumeUp` beside a `PaddedSlider` with `label=""`.

**Fix:** Remove the flex row wrapper entirely. Pass `icon={<FaVolumeUp size={14} />}` directly to `PaddedSlider`, which forwards it to `SliderField`. The `SliderField` `icon` prop (inherited from `ItemProps`) renders the icon natively to the left of the slider, matching the Steam Deck Quick Settings DOM layout.

### 2. Volume Slider Label Offset

**Current:** `label=""` (empty string) still reserves vertical label space in Decky's layout, causing the slider to sit slightly lower than expected.

**Fix:** Omit the `label` prop entirely — do not pass it, not even as an empty string. Combined with the `icon` prop, this matches the native Quick Settings slider layout with no offset.

### 3. Repeat Button — Full Width + Text Label

**Current:** `PaddedButton` wrapping a `ButtonItem`, showing icon only (not full width).

**Fix:**
- Replace `PaddedButton` with a `Focusable` + `DialogButton` (consistent with transport controls, full width by default).
- Replace the Repeat button JSX first (so `PaddedButton` is no longer referenced), then **delete the `PaddedButton` component definition** from `PlayerView.tsx`. Order matters: deleting the definition before replacing the JSX reference will break the build mid-task.
- Add `REPEAT_LABELS: Record<string, string> = { NONE: 'Off', ALL: 'All', ONE: 'One' }`.
- Button content: `[icon] Repeat: [label]` rendered as a flex row with a gap.
- `DialogButton` style: `height: '30px'`, `display: 'flex'`, `alignItems: 'center'`, `justifyContent: 'flex-start'`, `gap: '6px'`, `paddingLeft: '16px'`.

**Icon visibility (highlighted vs. normal):** The `REPEAT_ICONS` map must NOT use hardcoded `color` values. Instead, differentiate state via `opacity`:
- `NONE` (Off): `opacity: 0.4`
- `ALL` (All): `opacity: 1`
- `ONE` (One): `opacity: 1`

This ensures the icon inherits the `DialogButton`'s text color (which inverts on focus/highlight) and remains visible in both states.

Updated `REPEAT_ICONS`:
```tsx
const REPEAT_ICONS: Record<string, React.ReactElement> = {
  NONE: <MdRepeat size={16} style={{ opacity: 0.4 }} />,
  ALL:  <MdRepeat size={16} style={{ opacity: 1 }} />,
  ONE:  <MdRepeatOne size={16} style={{ opacity: 1 }} />,
};

const REPEAT_LABELS: Record<string, string> = {
  NONE: 'Off',
  ALL:  'All',
  ONE:  'One',
};
```

Button render:
```tsx
<Focusable>
  <DialogButton
    style={{ height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '6px', paddingLeft: '16px' }}
    onClick={() => { void switchRepeat(REPEAT_NEXT[repeat] ?? 1); }}
  >
    {REPEAT_ICONS[repeat] ?? REPEAT_ICONS.NONE}
    Repeat: {REPEAT_LABELS[repeat] ?? 'Off'}
  </DialogButton>
</Focusable>
```

### 4. Clear Queue Button — Full Width

**Current:** `PaddedButton` wrapping a `ButtonItem`, not full width.

**Fix:** Same approach as repeat button — replace with `Focusable` + `DialogButton` with matching style.
- **Delete the `PaddedButton` component definition** from `QueueView.tsx` — it will no longer be used.
- **Remove the `ButtonItem` import** from `QueueView.tsx` — it was only used inside `PaddedButton`. Both are dead code after the replacement and will cause build failures (`noUnusedLocals: true`).
- No `DialogButton` availability fallback is needed for the Clear Queue button — the existing queue item rows already handle the `if (DialogButton)` guard; the Clear Queue button can use `DialogButton` unconditionally consistent with the current pattern.

```tsx
<Focusable>
  <DialogButton
    style={{ height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '6px', paddingLeft: '16px' }}
    onClick={() => { void handleClear(); }}
  >
    <FaTrash /> Clear Queue
  </DialogButton>
</Focusable>
```

### 5. Increase Side Padding — 12px → 16px

All hardcoded `12px` horizontal padding values throughout both files must be updated to `16px`. Specific locations:

**`PlayerView.tsx`:**
- `applyInnerPadding`: `paddingLeft = '12px'` and `paddingRight = '12px'` → `'16px'` (applies to `PaddedButton` and `PaddedToggle` wrappers — affects the Shuffle toggle)
- New Repeat `DialogButton` style: `paddingLeft: '16px'` (already reflected in Section 3 snippet)

**`QueueView.tsx`:**
- Queue item `Focusable` wrapper: `paddingLeft: '12px', paddingRight: '12px'` → `'16px'`
- New Clear Queue `DialogButton` style: `paddingLeft: '16px'` (already reflected in Section 4 snippet)

The `PaddedSlider` inner padding (`10px`) is a separate value tied to slider layout geometry — do not change it.

---

## Constraints

- TypeScript `noUnusedLocals: true` — all imports must be used before building.
- `"jsx": "react-jsx"` — use `React.ReactElement`, not `JSX.Element`.
- All `PlayerView.tsx` changes must be complete before `npm run build` is run (unused import check).
- Do NOT change the 1500ms cooldown on `adjustingRef` in `handleVolumeChange`.
- After all code changes: run `npm run build`, then recreate `youtube-music.zip`.
