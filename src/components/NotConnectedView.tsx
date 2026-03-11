import { PanelSection, PanelSectionRow } from '@decky/ui';

export const NotConnectedView = () => (
  <PanelSection title="YouTube Music">
    <PanelSectionRow>
      <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--gpSystemLighterGrey)' }}>
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎵</div>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Not Connected</div>
        <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
          Open YouTube Music and enable the <strong>API Server</strong> plugin in its settings.
          The plugin will connect automatically.
        </div>
      </div>
    </PanelSectionRow>
  </PanelSection>
);
