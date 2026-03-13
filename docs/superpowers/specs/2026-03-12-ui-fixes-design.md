# UI Fixes: Volume Icon, Slider Offset, Full-Width Buttons, Repeat Label

## Goal

Fix five visual issues found after the initial UI polish pass:
1. Volume icon rendered via native `icon` prop instead of a custom flex row wrapper
2. Volume slider layout offset caused by empty `label` prop
3. Repeat button not full width
4. Clear Queue button not full width
5. Repeat button shows icon only — needs text label indicating current state

---

## Scope

All changes are confined to two files:
- `src/components/PlayerView.tsx` — volume section, repeat button
- `src/components/QueueView.tsx` — Clear Queue button

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
- Add `REPEAT_LABELS: Record<string, string> = { NONE: 'Off', ALL: 'All', ONE: 'One' }`.
- Button content: `[icon] Repeat: [label]` rendered as a flex row with a gap.
- `DialogButton` style: `height: '30px'`, `display: 'flex'`, `alignItems: 'center'`, `justifyContent: 'flex-start'`, `gap: '6px'`, `paddingLeft: '12px'`.

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
    style={{ height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '6px', paddingLeft: '12px' }}
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

```tsx
<Focusable>
  <DialogButton
    style={{ height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '6px', paddingLeft: '12px' }}
    onClick={() => { void handleClear(); }}
  >
    <FaTrash /> Clear Queue
  </DialogButton>
</Focusable>
```

---

## Constraints

- TypeScript `noUnusedLocals: true` — all imports must be used before building.
- `"jsx": "react-jsx"` — use `React.ReactElement`, not `JSX.Element`.
- All `PlayerView.tsx` changes must be complete before `npm run build` is run (unused import check).
- Do NOT change the 1500ms cooldown on `adjustingRef` in `handleVolumeChange`.
- After all code changes: run `npm run build`, then recreate `youtube-music.zip`.
