# UI Rebuild — Drop PanelSection/PanelSectionRow Design

## Goal

Replace all `PanelSection` and `PanelSectionRow` layout wrappers with a custom `Section` component backed by plain divs. This eliminates the root cause of all spacing/edge-to-edge issues: `PanelSection` and `PanelSectionRow` add horizontal padding that cannot be reliably overridden (CSS class injection is unreliable across Steam versions).

## Architecture

**One new file:** `src/components/Section.tsx` — a plain div wrapper with an optional title header styled to match Steam's native section headers. All leaf `@decky/ui` components (`SliderField`, `ToggleField`, `TextField`, `ButtonItem`, `DialogButton`, `Focusable`, `Tabs`) are kept unchanged.

**Five files updated:** `PlayerView.tsx`, `QueueView.tsx`, `SearchView.tsx`, `NotConnectedView.tsx`, `AuthTokenView.tsx` — swap every `PanelSection` → `Section`, remove every `PanelSectionRow` wrapper (children render directly).

**`src/index.tsx`:** Remove `quickAccessControlsClasses` import and all CSS injection rules except the sticky tab bar rule for `gamepadTabbedPageClasses.TabHeaderRowWrapper`.

## Section Component

```tsx
import type { ReactNode } from 'react';

interface SectionProps {
  title?: string;
  children: ReactNode;
}

export const Section = ({ title, children }: SectionProps) => (
  <div>
    {title && (
      <div style={{
        padding: '12px 16px 4px',
        fontSize: '11px',
        fontWeight: 'bold',
        textTransform: 'uppercase' as const,
        color: 'var(--gpSystemLighterGrey)',
        letterSpacing: '0.04em',
      }}>
        {title}
      </div>
    )}
    {children}
  </div>
);
```

## Button Row Pattern (PRESERVE AS-IS)

The `Focusable flow-children="horizontal"` + `DialogButton` pattern for horizontal control rows is preserved unchanged. Based on the MusicControl plugin implementation. These rows work correctly when given edge-to-edge space by `Section`.

```tsx
<Focusable
  style={{ display: 'flex', marginTop: '4px', marginBottom: '4px' }}
  flow-children="horizontal"
>
  <DialogButton style={rowBtnFirst} onClick={...}>⏮</DialogButton>
  <DialogButton style={rowBtn} onClick={...}>▶</DialogButton>
  <DialogButton style={rowBtn} onClick={...}>⏭</DialogButton>
</Focusable>
```

## Result

- `ButtonItem`, `SliderField`, `ToggleField`, `TextField` all get full panel width — edge-to-edge with their own internal padding
- `Focusable` rows get full panel width — the 5px `marginLeft` between `DialogButton`s provides small internal gaps
- Section titles styled to match Steam's native look
- No CSS injection, no runtime class name hunting, no negative margins
